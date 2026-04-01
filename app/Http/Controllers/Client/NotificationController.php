<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()->notifications()
            ->withPivot('is_read', 'read_at')
            ->latest()
            ->paginate(15);

        return Inertia::render('client/notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, int $id): RedirectResponse
    {
        $request->user()->notifications()->updateExistingPivot($id, [
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'Notification marked as read.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->notifications()->wherePivot('is_read', false)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function trackOpen(Request $request, Notification $notification): RedirectResponse
    {
        $request->user()->notifications()->updateExistingPivot($notification->id, [
            'is_read' => true,
            'read_at' => now(),
        ]);

        NotificationDelivery::query()
            ->where('notification_id', $notification->id)
            ->where('user_id', $request->user()->id)
            ->whereNull('opened_at')
            ->update(['opened_at' => now()]);

        return back();
    }
}
