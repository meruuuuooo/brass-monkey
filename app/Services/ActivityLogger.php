<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    public function __construct(private readonly Request $request) {}

    /**
     * Log an activity for a user.
     *
     * @param  array<string, mixed>|null  $properties
     */
    public function log(
        User $user,
        string $event,
        string $description,
        ?User $causer = null,
        ?array $properties = null,
        ?string $subjectType = null,
        ?int $subjectId = null,
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $user->id,
            'causer_id' => $causer?->id,
            'event' => $event,
            'description' => $description,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
            'properties' => $properties,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
        ]);
    }
}
