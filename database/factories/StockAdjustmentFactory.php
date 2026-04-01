<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockAdjustment>
 */
class StockAdjustmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'type' => fake()->randomElement(['addition', 'subtraction', 'audit']),
            'quantity' => fake()->numberBetween(-50, 100),
            'reason' => fake()->optional(0.5)->sentence(),
            'adjusted_by' => User::factory(),
        ];
    }
}
