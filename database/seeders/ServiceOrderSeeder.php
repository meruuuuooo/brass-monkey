<?php

namespace Database\Seeders;

use App\Models\ServiceOrder;
use Illuminate\Database\Seeder;

class ServiceOrderSeeder extends Seeder
{
    public function run(): void
    {
        ServiceOrder::create([
            'tracking_number' => 'BM-1001',
            'customer_name' => 'John Doe',
            'service_type' => 'Precision Balancing',
            'status' => 'in-progress',
            'description' => 'Balancing high-rpm turbine assembly.',
            'estimated_completion' => now()->addDays(3),
        ]);

        ServiceOrder::create([
            'tracking_number' => 'BM-1002',
            'customer_name' => 'Jane Smith',
            'service_type' => 'Full Restoration',
            'status' => 'ready',
            'description' => 'Complete overhaul of mechanical gear system.',
            'estimated_completion' => now()->subDay(),
        ]);

        ServiceOrder::create([
            'tracking_number' => 'BM-1003',
            'customer_name' => 'Alex Reed',
            'service_type' => 'Diagnostic',
            'status' => 'pending',
            'description' => 'Vibration analysis requested for industrial fan.',
            'estimated_completion' => now()->addDays(1),
        ]);
    }
}
