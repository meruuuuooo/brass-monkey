<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Machine Repair',
                'description' => 'Comprehensive repair service for industrial and commercial machinery. Includes diagnostics and part replacement.',
                'duration' => '2 hr',
                'price' => 150.00,
                'is_active' => true,
            ],
            [
                'name' => 'Equipment Cleaning',
                'description' => 'Professional deep cleaning of specialized equipment to ensure optimal performance and longevity.',
                'duration' => '1 hr 30 min',
                'price' => 100.00,
                'is_active' => true,
            ],
            [
                'name' => 'Preventive Maintenance',
                'description' => 'Scheduled inspections and maintenance to prevent breakdowns and extend equipment life.',
                'duration' => '1 hr',
                'price' => 120.00,
                'is_active' => true,
            ],
            [
                'name' => 'Basic Machine Cleaning & Inspection',
                'description' => 'Quick inspection and external cleaning for daily maintenance needs.',
                'duration' => '1 hr',
                'price' => 5.00,
                'is_active' => true,
            ],
            [
                'name' => 'Deep Cleaning & Descaling',
                'description' => 'Thorough descaling and internal cleaning to remove mineral buildup and residue.',
                'duration' => '1 hr',
                'price' => 20.00,
                'is_active' => true,
            ],
            [
                'name' => 'Parts Replacement & Calibration',
                'description' => 'Precision calibration and replacement of worn-out internal components.',
                'duration' => '1 hr',
                'price' => 30.00,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
