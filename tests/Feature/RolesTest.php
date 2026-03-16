<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

it('creates admin, manager, and client roles via seeder', function () {
    $this->artisan('db:seed', ['--class' => 'RolesSeeder', '--no-interaction' => true]);

    expect(Role::whereIn('name', ['Admin', 'Manager', 'Client'])->count())->toBe(3);
});

it('can assign admin role to a user', function () {
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('Admin');

    expect($user->hasRole('Admin'))->toBeTrue();
});

it('can assign manager role to a user', function () {
    Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('Manager');

    expect($user->hasRole('Manager'))->toBeTrue();
});

it('can assign client role to a user', function () {
    Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('Client');

    expect($user->hasRole('Client'))->toBeTrue();
});
