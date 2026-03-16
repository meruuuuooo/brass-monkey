<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('active user can access protected routes', function () {
    $user = User::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('inactive user is logged out and redirected to login', function () {
    $user = User::factory()->create(['is_active' => false]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

test('inactive user sees deactivation error message', function () {
    $user = User::factory()->create(['is_active' => false]);

    $response = $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('login'));

    $this->followRedirects($response)
        ->assertSee('Your account has been deactivated');
});

test('guest is not affected by active user middleware', function () {
    $this->get(route('login'))
        ->assertOk();
});
