<?php

use App\Jobs\SendNotificationDeliveryJob;
use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotificationPreference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);
});

test('sendToTargetUsers queues only enabled channels', function () {
    Queue::fake();

    $client = User::factory()->create();
    $client->assignRole('Client');

    UserNotificationPreference::create([
        'user_id' => $client->id,
        'channel' => 'email',
        'is_enabled' => false,
    ]);

    $notification = Notification::create([
        'title' => 'System Notice',
        'message' => 'Test message',
        'type' => 'system',
        'target' => 'clients',
        'channel' => 'both',
        'status' => 'draft',
    ]);

    $notification->sendToTargetUsers();

    Queue::assertPushed(SendNotificationDeliveryJob::class, function (SendNotificationDeliveryJob $job) use ($client) {
        return $job->userId === $client->id && $job->channel === 'in_app';
    });

    Queue::assertNotPushed(SendNotificationDeliveryJob::class, function (SendNotificationDeliveryJob $job) use ($client) {
        return $job->userId === $client->id && $job->channel === 'email';
    });
});
