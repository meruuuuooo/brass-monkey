<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNotificationDeliveryJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public int $notificationId,
        public int $userId,
        public string $channel
    ) {}

    public function handle(): void
    {
        $notification = Notification::find($this->notificationId);
        $user = User::find($this->userId);

        if (! $notification || ! $user) {
            return;
        }

        $delivery = NotificationDelivery::firstOrCreate([
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'channel' => $this->channel,
        ], [
            'status' => 'queued',
        ]);

        $delivery->update([
            'status' => 'sending',
            'attempts' => $delivery->attempts + 1,
            'last_error' => null,
        ]);

        try {
            if ($this->channel === 'email') {
                Mail::raw($notification->message, function ($message) use ($user, $notification) {
                    $message->to($user->email, $user->name)
                        ->subject($notification->title);
                });
            }

            $delivery->update([
                'status' => 'sent',
                'sent_at' => now(),
                'delivered_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            $delivery->update([
                'status' => 'failed',
                'last_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
