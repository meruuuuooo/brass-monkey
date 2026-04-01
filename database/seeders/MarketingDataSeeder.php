<?php

namespace Database\Seeders;

use App\Models\Advertisement;
use App\Models\Announcement;
use App\Models\CustomerSegment;
use Illuminate\Database\Seeder;

class MarketingDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create customer segments
        $segments = [
            [
                'name' => 'Premium Customers',
                'description' => 'High-value customers with frequent purchases',
                'color' => '#f59e0b',
            ],
            [
                'name' => 'Regular Customers',
                'description' => 'Repeat customers with steady purchases',
                'color' => '#3b82f6',
            ],
            [
                'name' => 'New Customers',
                'description' => 'Customers from the last 30 days',
                'color' => '#10b981',
            ],
            [
                'name' => 'Inactive Customers',
                'description' => 'Customers not active in the last 90 days',
                'color' => '#6b7280',
            ],
            [
                'name' => 'High-Risk Churn',
                'description' => 'Customers at risk of leaving',
                'color' => '#ef4444',
            ],
        ];

        foreach ($segments as $segment) {
            CustomerSegment::firstOrCreate(
                ['name' => $segment['name']],
                $segment
            );
        }

        // Create advertisements
        Advertisement::factory(8)->create();
        Advertisement::factory(3)->inactive()->create();

        // Create announcements
        Announcement::factory(10)->create();
        Announcement::factory(2)->inactive()->create();

        // Create some important announcements
        Announcement::factory(2)->create([
            'type' => 'warning',
            'title' => 'System Maintenance',
        ]);

        Announcement::factory(2)->create([
            'type' => 'success',
            'title' => 'New Features Available',
        ]);
    }
}
