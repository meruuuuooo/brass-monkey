<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);
});

test('login event is logged when user authenticates', function () {
    $user = User::factory()->create();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $user->id,
        'event' => 'login',
    ]);
});

test('logout event is logged when user signs out', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('logout'));

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $user->id,
        'event' => 'logout',
    ]);
});

test('user creation is logged by observer', function () {
    $target = User::factory()->create();

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $target->id,
        'event' => 'created',
    ]);
});

test('user update is logged by observer when name changes', function () {
    $user = User::factory()->create();
    $user->update(['name' => 'Updated Name']);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $user->id,
        'event' => 'updated',
    ]);
});

test('user deletion cascades and removes activity logs', function () {
    $user = User::factory()->create();
    $userId = $user->id;

    // Verify activity log exists for user creation
    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $userId,
        'event' => 'created',
    ]);

    $user->delete();

    // Activity logs for the deleted user are cascade deleted
    $this->assertDatabaseMissing('activity_logs', [
        'user_id' => $userId,
    ]);
});

test('admin can view activity logs page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->get(route('admin.activity-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/activity-logs'));
});

test('client cannot view activity logs page', function () {
    $client = User::factory()->create();
    $client->assignRole('Client');

    $this->actingAs($client)
        ->get(route('admin.activity-logs.index'))
        ->assertForbidden();
});
