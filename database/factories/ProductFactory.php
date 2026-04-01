<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 10, 500);
        $costPrice = $price * fake()->randomFloat(2, 0.4, 0.8);

        return [
            'category_id' => Category::factory(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->paragraph(),
            'sku' => fake()->unique()->bothify('SKU-####'),
            'barcode' => fake()->unique()->bothify('?????-####'),
            'price' => $price,
            'cost_price' => $costPrice,
            'stock_quantity' => fake()->numberBetween(0, 500),
            'low_stock_threshold' => fake()->numberBetween(10, 50),
            'image_path' => 'https://via.placeholder.com/300x300?text=' . urlencode(fake()->word()),
            'is_available' => true,
        ];
    }

    /**
     * Mark as unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }

    /**
     * Create with low stock.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => fake()->numberBetween(0, 15),
        ]);
    }
}
