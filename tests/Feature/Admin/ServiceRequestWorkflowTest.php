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

test('admin can transition service request from pending to accepted', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $job = ServiceOrder::factory()->create([
        'service_id' => Service::factory()->create()->id,
        'status' => 'pending',
    ]);

    actingAs($admin)
        ->put(route('admin.service-requests.update', $job), [
            'status' => 'accepted',
        ])
        ->assertRedirect();

    $job->refresh();

    expect($job->status)->toBe('accepted');
    expect($job->accepted_at)->not->toBeNull();
});

test('manager cannot transition completed service request back to pending', function () {
    $manager = User::factory()->create();
    $manager->assignRole('Manager');

    $job = ServiceOrder::factory()->create([
        'service_id' => Service::factory()->create()->id,
        'status' => 'completed',
        'completed_at' => now(),
    ]);

    actingAs($manager)
        ->put(route('admin.service-requests.update', $job), [
            'status' => 'pending',
        ])
        ->assertRedirect();

    $job->refresh();

    expect($job->status)->toBe('completed');
});
