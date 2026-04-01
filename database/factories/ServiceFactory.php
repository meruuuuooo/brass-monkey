<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'duration' => $this->faker->randomElement(['1 hr', '2 hr', '1 hr 30 min', '30 min']),
            'price' => $this->faker->randomFloat(2, 5, 200),
            'image_path' => 'services/brass-monkey-logo.png',
            'is_active' => true,
        ];
    }
}
