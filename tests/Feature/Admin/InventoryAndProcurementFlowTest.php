<?php

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
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

test('receiving a purchase order increases stock and stock adjustment subtraction decreases stock', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create([
        'stock_quantity' => 5,
        'cost_price' => 20,
        'price' => 35,
    ]);

    actingAs($admin)
        ->post(route('admin.purchase-orders.store'), [
            'supplier_id' => $supplier->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 7,
                    'unit_price' => 20,
                ],
            ],
        ])
        ->assertRedirect(route('admin.purchase-orders.index'));

    $purchaseOrder = PurchaseOrder::query()->latest('id')->firstOrFail();

    actingAs($admin)
        ->put(route('admin.purchase-orders.update', $purchaseOrder), [
            'status' => 'received',
        ])
        ->assertRedirect(route('admin.purchase-orders.index'));

    expect($purchaseOrder->fresh()->status)->toBe('received');
    expect($product->fresh()->stock_quantity)->toBe(12);

    actingAs($admin)
        ->post(route('admin.stock-adjustments.store'), [
            'product_id' => $product->id,
            'type' => 'subtraction',
            'quantity' => 4,
            'reason' => 'Damaged stock',
        ])
        ->assertRedirect(route('admin.stock-adjustments.index'));

    expect($product->fresh()->stock_quantity)->toBe(8);
});
