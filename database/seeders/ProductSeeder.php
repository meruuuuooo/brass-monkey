<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create product categories
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Electronic devices and accessories',
            ],
            [
                'name' => 'Clothing',
                'description' => 'Apparel and fashion items',
            ],
            [
                'name' => 'Home & Garden',
                'description' => 'Home and garden products',
            ],
            [
                'name' => 'Sports & Outdoors',
                'description' => 'Sports equipment and outdoor gear',
            ],
            [
                'name' => 'Books & Media',
                'description' => 'Books, DVDs, and digital media',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate($category);
        }

        $allCategories = Category::all();

        // Create products for each category
        foreach ($allCategories as $category) {
            Product::factory(15)->create([
                'category_id' => $category->id,
            ]);

            // Add some low stock products
            Product::factory(3)
                ->lowStock()
                ->create([
                    'category_id' => $category->id,
                ]);

            // Add some unavailable products
            Product::factory(2)
                ->unavailable()
                ->create([
                    'category_id' => $category->id,
                ]);
        }
    }
}
