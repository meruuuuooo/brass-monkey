<?php

namespace Database\Seeders;

use App\Models\StockAdjustment;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionAndStockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get staff users
        $staffUsers = User::role(['Admin', 'Manager'])->get();

        if ($staffUsers->isEmpty()) {
            $staffUsers = User::factory(2)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Admin');
                });
        }

        // Create stock adjustments
        StockAdjustment::factory(100)->create([
            'adjusted_by' => $staffUsers->random()->id,
        ]);

        // Create transactions from existing orders
        if (\App\Models\Order::exists()) {
            $orders = \App\Models\Order::all();

            foreach ($orders as $order) {
                // Create 1-2 transactions per order
                Transaction::factory(fake()->numberBetween(1, 2))
                    ->create([
                        'order_id' => $order->id,
                        'processed_by' => $staffUsers->random()->id,
                    ]);
            }
        }
    }
}
