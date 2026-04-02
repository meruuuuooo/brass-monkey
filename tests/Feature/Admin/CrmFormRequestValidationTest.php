<?php

use App\Models\Service;
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

test('notification creation requires required fields', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    actingAs($admin)
        ->post(route('admin.notifications.store'), [])
        ->assertSessionHasErrors(['title', 'message', 'type', 'target', 'channel']);
});

test('order creation requires at least one valid item', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    actingAs($admin)
        ->post(route('admin.orders.store'), [
            'payment_method' => 'cash',
            'items' => [],
        ])
        ->assertSessionHasErrors(['items']);
});

test('service request creation validates service and customer fields', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $service = Service::factory()->create();

    actingAs($admin)
        ->post(route('admin.service-requests.store'), [
            'service_id' => $service->id,
            'customer_name' => '',
            'priority' => 'normal',
        ])
        ->assertSessionHasErrors(['customer_name']);
});
