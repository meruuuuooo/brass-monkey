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
     * @return array<int, array{id: int, name: string, email: string}>
     */
    protected function filterUsers(): array
    {
        return User::query()
            ->whereIn('id', ActivityLog::query()->select('user_id')->whereNotNull('user_id')->distinct())
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->toArray();
    }

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
                        ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->input('event'), fn ($q, $event) => $q->where('event', $event))
            ->when($request->input('user_id'), fn ($q, $userId) => $q->where('user_id', $userId))
            ->when($request->input('subject_type'), fn ($q, $type) => $q->where('subject_type', $type))
            ->when($request->input('date_from'), fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($request->input('date_to'), fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/activity-logs', [
            'logs' => $logs,
            'filters' => $request->only('search', 'event', 'user_id', 'subject_type', 'date_from', 'date_to'),
            'events' => ActivityLog::distinct()->orderBy('event')->pluck('event'),
            'subjectTypes' => ActivityLog::whereNotNull('subject_type')->distinct()->orderBy('subject_type')->pluck('subject_type'),
            'users' => $this->filterUsers(),
        ]);
    }
}
