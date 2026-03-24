<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'causer_id',
        'event',
        'description',
        'ip_address',
        'user_agent',
        'properties',
        'subject_type',
        'subject_id',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    /**
     * The subject user this log entry is about.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The user who caused this log entry (e.g., admin acting on another user).
     */
    public function causer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'causer_id');
    }
}
