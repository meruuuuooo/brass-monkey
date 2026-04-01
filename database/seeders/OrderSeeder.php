<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get staff users for created_by
        $staffUsers = User::role(['Admin', 'Manager'])->get();

        if ($staffUsers->isEmpty()) {
            $staffUsers = User::factory(2)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Admin');
                });
        }

        // Get customer users
        $customers = User::role('Client')->get();

        if ($customers->count() < 5) {
            $customers = User::factory(10)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Client');
                });
        }

        $products = Product::available()->get();

        // Create orders
        $orders = Order::factory(50)
            ->create([
                'customer_id' => $customers->random()->id,
                'created_by' => $staffUsers->random()->id,
            ]);

        // Add items to each order
        foreach ($orders as $order) {
            $orderItems = fake()->numberBetween(1, 5);

            for ($i = 0; $i < $orderItems; $i++) {
                $product = $products->random();

                OrderItem::factory()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'unit_price' => $product->price,
                ]);
            }
        }

        // Create some delivered and pending orders specifically
        Order::factory(10)
            ->completed()
            ->create([
                'customer_id' => $customers->random()->id,
                'created_by' => $staffUsers->random()->id,
            ])
            ->each(function ($order) use ($products) {
                for ($i = 0; $i < fake()->numberBetween(1, 3); $i++) {
                    OrderItem::factory()->create([
                        'order_id' => $order->id,
                        'product_id' => $products->random()->id,
                    ]);
                }
            });
    }
}
