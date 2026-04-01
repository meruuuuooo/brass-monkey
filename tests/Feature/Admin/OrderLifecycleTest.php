<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Transaction;
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

test('order creation decrements stock and admin can refund with stock restoration', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $client = User::factory()->create();
    $client->assignRole('Client');

    $product = Product::factory()->create([
        'stock_quantity' => 10,
        'price' => 75,
        'cost_price' => 40,
    ]);

    actingAs($admin)
        ->post(route('admin.orders.store'), [
            'customer_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => 75,
                ],
            ],
        ])
        ->assertRedirect(route('admin.orders.index'));

    $order = Order::query()->latest('id')->firstOrFail();

    expect($order->status)->toBe('completed');
    expect($product->fresh()->stock_quantity)->toBe(8);

    expect(Transaction::query()->where('order_id', $order->id)->where('type', 'payment')->exists())->toBeTrue();

    actingAs($admin)
        ->put(route('admin.orders.update', $order), [
            'status' => 'refunded',
        ])
        ->assertRedirect();

    expect($order->fresh()->status)->toBe('refunded');
    expect($product->fresh()->stock_quantity)->toBe(10);
    expect(Transaction::query()->where('order_id', $order->id)->where('type', 'refund')->exists())->toBeTrue();
});

test('manager cannot process order refunds', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $manager = User::factory()->create();
    $manager->assignRole('Manager');

    $client = User::factory()->create();
    $client->assignRole('Client');

    $product = Product::factory()->create(['stock_quantity' => 5, 'price' => 100, 'cost_price' => 60]);

    actingAs($admin)
        ->post(route('admin.orders.store'), [
            'customer_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => 100,
                ],
            ],
        ])
        ->assertRedirect();

    $order = Order::query()->latest('id')->firstOrFail();

    actingAs($manager)
        ->put(route('admin.orders.update', $order), [
            'status' => 'refunded',
        ])
        ->assertRedirect();

    expect($order->fresh()->status)->not->toBe('refunded');
    expect(Transaction::query()->where('order_id', $order->id)->where('type', 'refund')->exists())->toBeFalse();
});
