<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);
});

test('admin can view user list', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/index'));
});

test('manager can view user list', function () {
    $manager = User::factory()->create();
    $manager->assignRole('Manager');

    $this->actingAs($manager)
        ->get(route('admin.users.index'))
        ->assertOk();
});

test('client cannot access admin user list', function () {
    $client = User::factory()->create();
    $client->assignRole('Client');

    $this->actingAs($client)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('unauthenticated user is redirected from admin routes', function () {
    $this->get(route('admin.users.index'))
        ->assertRedirect(route('login'));
});

test('admin can create a user', function () {
    Notification::fake();

    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'role' => 'Client',
            'bypass_email_verification' => true,
        ])
        ->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseHas('users', ['email' => 'new@example.com']);

    $created = User::where('email', 'new@example.com')->first();
    expect($created->hasRole('Client'))->toBeTrue();
    expect($created->email_verified_at)->not->toBeNull();
    Notification::assertNothingSent();
});

test('admin can create an unverified user when bypass is unchecked', function () {
    Notification::fake();

    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Pending Verify User',
            'email' => 'pending@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'role' => 'Client',
            'bypass_email_verification' => false,
        ])
        ->assertRedirect(route('admin.users.index'));

    $created = User::query()->where('email', 'pending@example.com')->firstOrFail();

    expect($created->email_verified_at)->toBeNull();
    Notification::assertSentTo($created, VerifyEmail::class);
});

test('manager cannot create a user', function () {
    $manager = User::factory()->create();
    $manager->assignRole('Manager');

    $this->actingAs($manager)
        ->post(route('admin.users.store'), [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'role' => 'Client',
        ])
        ->assertForbidden();
});

test('admin can update a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $target = User::factory()->create(['name' => 'Old Name']);
    $target->assignRole('Client');

    $this->actingAs($admin)
        ->put(route('admin.users.update', $target), [
            'name' => 'New Name',
            'email' => $target->email,
            'role' => 'Manager',
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.users.index'));

    expect($target->fresh()->name)->toBe('New Name');
    expect($target->fresh()->hasRole('Manager'))->toBeTrue();
});

test('admin can bypass email verification on update', function () {
    Notification::fake();

    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $target = User::factory()->unverified()->create();
    $target->assignRole('Client');

    $this->actingAs($admin)
        ->put(route('admin.users.update', $target), [
            'name' => $target->name,
            'email' => $target->email,
            'role' => 'Client',
            'is_active' => true,
            'bypass_email_verification' => true,
        ])
        ->assertRedirect(route('admin.users.index'));

    expect($target->fresh()->email_verified_at)->not->toBeNull();
    Notification::assertNothingSent();
});

test('admin can deactivate a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $target = User::factory()->create(['is_active' => true]);
    $target->assignRole('Client');

    $this->actingAs($admin)
        ->put(route('admin.users.update', $target), [
            'name' => $target->name,
            'email' => $target->email,
            'role' => 'Client',
            'is_active' => false,
        ]);

    expect($target->fresh()->is_active)->toBeFalse();
});

test('admin cannot delete their own account', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin))
        ->assertForbidden();
});

test('admin can delete another user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $target = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $target))
        ->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('user list search filters by name', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    User::factory()->create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
    User::factory()->create(['name' => 'Bob Jones', 'email' => 'bob@example.com']);

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['search' => 'Alice']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->where('users.total', 1)
        );
});
