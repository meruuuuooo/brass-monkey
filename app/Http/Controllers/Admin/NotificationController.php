<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotificationRequest;
use App\Http\Requests\Admin\UpdateNotificationRequest;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Notification::with('creator:id,name')
            ->withCount('recipients')
            ->latest();

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        return Inertia::render('admin/notifications/index', [
            'notifications' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function store(StoreNotificationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $notification = Notification::create([
            ...$validated,
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        if ($request->boolean('send_now')) {
            $notification->sendToTargetUsers();
        }

        return back()->with('success', $request->boolean('send_now')
            ? 'Notification sent successfully!'
            : 'Notification saved as draft.');
    }

    public function show(Notification $notification): Response
    {
        $notification->load([
            'creator:id,name',
            'recipients' => fn ($q) => $q->select('users.id', 'name', 'email')->latest('notification_user.created_at')->limit(50),
        ]);
        $notification->loadCount('recipients');
        $readCount = $notification->recipients()->wherePivot('is_read', true)->count();
        $deliverySummary = [
            'total' => $notification->deliveries()->count(),
            'sent' => $notification->deliveries()->where('status', 'sent')->count(),
            'failed' => $notification->deliveries()->where('status', 'failed')->count(),
            'opened' => $notification->deliveries()->whereNotNull('opened_at')->count(),
            'inApp' => $notification->deliveries()->where('channel', 'in_app')->count(),
            'email' => $notification->deliveries()->where('channel', 'email')->count(),
        ];

        return Inertia::render('admin/notifications/show', [
            'notification' => $notification,
            'readCount' => $readCount,
            'deliverySummary' => $deliverySummary,
        ]);
    }

    public function update(UpdateNotificationRequest $request, Notification $notification): RedirectResponse
    {
        $action = $request->input('action');

        if ($action === 'send' && $notification->status === 'draft') {
            $notification->sendToTargetUsers();

            return back()->with('success', 'Notification sent!');
        }

        if ($action === 'cancel' && in_array($notification->status, ['draft', 'scheduled'])) {
            $notification->update(['status' => 'cancelled']);

            return back()->with('success', 'Notification cancelled.');
        }

        // Edit draft
        if ($notification->status === 'draft') {
            $validated = $request->safe()->only(['title', 'message', 'type', 'target', 'channel']);
            $notification->update($validated);

            return back()->with('success', 'Notification updated.');
        }

        return back()->with('error', 'Cannot modify a sent notification.');
    }

    public function destroy(Notification $notification): RedirectResponse
    {
        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }
}
