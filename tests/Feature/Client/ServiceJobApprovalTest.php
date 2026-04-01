<?php

use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);
});

test('client can approve own pending estimate', function () {
    $client = User::factory()->create();
    $client->assignRole('Client');

    $job = ServiceOrder::factory()->create([
        'service_id' => Service::factory()->create()->id,
        'user_id' => $client->id,
        'status' => 'pending',
        'estimated_cost' => 149.99,
    ]);

    actingAs($client)
        ->post(route('client.jobs.approve', $job))
        ->assertRedirect();

    $job->refresh();

    expect($job->status)->toBe('accepted');
    expect($job->accepted_at)->not->toBeNull();
});

test('client cannot approve estimate for another user job', function () {
    $owner = User::factory()->create();
    $owner->assignRole('Client');

    $otherClient = User::factory()->create();
    $otherClient->assignRole('Client');

    $job = ServiceOrder::factory()->create([
        'service_id' => Service::factory()->create()->id,
        'user_id' => $owner->id,
        'status' => 'pending',
        'estimated_cost' => 180,
    ]);

    actingAs($otherClient)
        ->post(route('client.jobs.approve', $job))
        ->assertForbidden();
});
