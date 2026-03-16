<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display a paginated list of activity logs.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $logs = ActivityLog::query()
            ->with(['user:id,name,email', 'causer:id,name,email'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                        ->orWhere('event', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%"));
                });
            })
            ->when($request->input('event'), fn ($q, $event) => $q->where('event', $event))
            ->when($request->input('user_id'), fn ($q, $userId) => $q->where('user_id', $userId))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/activity-logs', [
            'logs' => $logs,
            'filters' => $request->only('search', 'event', 'user_id'),
            'events' => ActivityLog::distinct()->orderBy('event')->pluck('event'),
        ]);
    }
}
