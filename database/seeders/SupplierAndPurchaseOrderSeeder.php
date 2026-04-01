<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class SupplierAndPurchaseOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create suppliers
        $suppliers = Supplier::factory(10)->create();

        // Get staff users (Admin and Manager)
        $staffUsers = User::role(['Admin', 'Manager'])->get();

        if ($staffUsers->count() < 2) {
            $staffUsers = User::factory(2)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Admin');
                });
        }

        $products = Product::all();

        // Create purchase orders with items
        foreach ($suppliers as $supplier) {
            // Create 3-5 purchase orders per supplier
            PurchaseOrder::factory(fake()->numberBetween(3, 5))
                ->create([
                    'supplier_id' => $supplier->id,
                    'ordered_by' => $staffUsers->random()->id,
                    'approved_by' => fake()->boolean(70) ? $staffUsers->random()->id : null,
                ])
                ->each(function ($po) use ($products) {
                    // Add 3-8 items per purchase order
                    for ($i = 0; $i < fake()->numberBetween(3, 8); $i++) {
                        PurchaseOrderItem::factory()->create([
                            'purchase_order_id' => $po->id,
                            'product_id' => $products->random()->id,
                        ]);
                    }
                });
        }

        // Create some inactive suppliers
        Supplier::factory(3)
            ->inactive()
            ->create();
    }
}
