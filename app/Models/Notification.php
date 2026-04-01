<?php

namespace App\Models;

use App\Jobs\SendNotificationDeliveryJob;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function deliveries(): HasMany
    {
        return $this->hasMany(NotificationDelivery::class);
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
                $users->mapWithKeys(fn ($id) => [$id => ['is_read' => false]])->toArray()
            );

            foreach ($users as $userId) {
                $channels = $this->channel === 'both' ? ['in_app', 'email'] : [$this->channel];

                foreach ($channels as $channel) {
                    $isEnabled = UserNotificationPreference::query()
                        ->where('user_id', $userId)
                        ->where('channel', $channel)
                        ->value('is_enabled');

                    if ($isEnabled === false) {
                        continue;
                    }

                    SendNotificationDeliveryJob::dispatch((int) $this->id, (int) $userId, $channel);
                }
            }
        }

        $this->update(['status' => 'sent', 'sent_at' => now()]);
    }
}
