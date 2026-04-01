<?php

namespace Database\Seeders;

use App\Models\CustomerNote;
use App\Models\ServiceJobNote;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get staff and customer users
        $staffUsers = User::role(['Admin', 'Manager'])->get();
        if ($staffUsers->isEmpty()) {
            $staffUsers = User::factory(2)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Admin');
                });
        }

        $customers = User::role('Client')->get();
        if ($customers->isEmpty()) {
            $customers = User::factory(5)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Client');
                });
        }

        // Create customer notes (notes about customers)
        foreach ($customers->random(5) as $customer) {
            CustomerNote::factory(fake()->numberBetween(2, 5))
                ->create([
                    'customer_id' => $customer->id,
                    'author_id' => $staffUsers->random()->id,
                ]);
        }

        // Create service job notes for existing service orders
        if (ServiceOrder::exists()) {
            $serviceOrders = ServiceOrder::all();

            foreach ($serviceOrders->random(min(20, $serviceOrders->count())) as $serviceOrder) {
                ServiceJobNote::factory(fake()->numberBetween(1, 3))
                    ->create([
                        'service_order_id' => $serviceOrder->id,
                        'user_id' => $staffUsers->random()->id,
                    ]);
            }
        }
    }
}
