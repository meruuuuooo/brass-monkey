<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\ServiceReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceAndServiceOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create services
        $serviceNames = [
            'General Maintenance',
            'Repair Service',
            'Installation',
            'Consultation',
            'Technical Support',
            'Cleaning Service',
            'Inspection',
            'Adjustment',
        ];

        $services = collect();
        foreach ($serviceNames as $name) {
            $services->push(Service::firstOrCreate(
                ['name' => $name],
                [
                    'description' => "Professional {$name} with expert technicians",
                    'duration' => fake()->numberBetween(30, 480),
                    'price' => fake()->randomFloat(2, 50, 500),
                    'is_active' => true,
                ]
            ));
        }

        // Get staff and customer users
        $staffUsers = User::role(['Admin', 'Manager'])->get();
        if ($staffUsers->isEmpty()) {
            $staffUsers = User::factory(3)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Admin');
                });
        }

        $customers = User::role('Client')->get();
        if ($customers->count() < 5) {
            $customers = User::factory(10)
                ->create()
                ->each(function ($user) {
                    $user->assignRole('Client');
                });
        }

        // Create service orders
        ServiceOrder::factory(30)
            ->create([
                'service_id' => $services->random()->id,
                'user_id' => $customers->random()->id,
                'assigned_to' => $staffUsers->random()->id,
            ]);

        // Create some completed service orders
        ServiceOrder::factory(15)
            ->completed()
            ->create([
                'service_id' => $services->random()->id,
                'user_id' => $customers->random()->id,
                'assigned_to' => $staffUsers->random()->id,
            ]);

        // Create in-progress service orders
        ServiceOrder::factory(10)
            ->inProgress()
            ->create([
                'service_id' => $services->random()->id,
                'user_id' => $customers->random()->id,
                'assigned_to' => $staffUsers->random()->id,
            ]);

        // Add service reviews for completed orders
        $completedOrders = ServiceOrder::where('status', 'completed')->get();
        foreach ($completedOrders->random(min(10, $completedOrders->count())) as $serviceOrder) {
            ServiceReview::factory()
                ->create([
                    'service_order_id' => $serviceOrder->id,
                    'user_id' => $serviceOrder->user_id,
                ]);
        }
    }
}
