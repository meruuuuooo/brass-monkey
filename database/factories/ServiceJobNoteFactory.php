<?php

namespace Database\Factories;

use App\Models\ServiceJobNote;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceJobNote>
 */
class ServiceJobNoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_order_id' => ServiceOrder::factory(),
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['note', 'estimate', 'repair_log']),
            'content' => fake()->paragraph(),
        ];
    }
}
