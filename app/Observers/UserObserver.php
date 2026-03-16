<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        /** @var User|null $causer */
        $causer = Auth::user();

        ActivityLog::create([
            'user_id' => $user->id,
            'causer_id' => $causer?->id,
            'event' => 'created',
            'description' => "User account '{$user->email}' was created.",
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        $changed = $user->getChanges();

        $trackedFields = ['name', 'email', 'is_active', 'email_verified_at'];
        $relevantChanges = array_intersect_key($changed, array_flip($trackedFields));

        if (empty($relevantChanges)) {
            return;
        }

        $original = array_intersect_key($user->getOriginal(), $relevantChanges);

        /** @var User|null $causer */
        $causer = Auth::user();

        $isStatusChange = isset($relevantChanges['is_active']);
        $event = $isStatusChange ? ($relevantChanges['is_active'] ? 'activated' : 'deactivated') : 'updated';
        $description = $isStatusChange
            ? "User account '{$user->email}' was ".($relevantChanges['is_active'] ? 'activated' : 'deactivated').'.'
            : "User account '{$user->email}' was updated.";

        ActivityLog::create([
            'user_id' => $user->id,
            'causer_id' => $causer?->id,
            'event' => $event,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'properties' => ['old' => $original, 'new' => $relevantChanges],
        ]);
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // Activity logs are automatically deleted via CASCADE due to FK config
    }
}
