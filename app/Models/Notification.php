<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'type',
        'target',
        'channel',
        'status',
        'scheduled_at',
        'sent_at',
        'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_user')
            ->withPivot('is_read', 'read_at')
            ->withTimestamps();
    }

    /**
     * Send the notification to target users.
     */
    public function sendToTargetUsers(): void
    {
        $users = match ($this->target) {
            'admins' => User::role(['Admin', 'Manager'])->pluck('id'),
            'clients' => User::role('Client')->pluck('id'),
            'all' => User::pluck('id'),
            default => collect(),
        };

        if ($users->isNotEmpty()) {
            $this->recipients()->syncWithoutDetaching(
                $users->mapWithKeys(fn($id) => [$id => ['is_read' => false]])->toArray()
            );
        }

        $this->update(['status' => 'sent', 'sent_at' => now()]);
    }
}
