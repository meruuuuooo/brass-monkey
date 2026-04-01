<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceOrder>
 */
class ServiceOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        $priorities = ['low', 'normal', 'high', 'urgent'];

        return [
            'tracking_number' => 'SRV-' . fake()->unique()->bothify('####-####'),
            'customer_name' => fake()->name(),
            'service_type' => fake()->word(),
            'status' => fake()->randomElement($statuses),
            'description' => fake()->paragraph(),
            'estimated_completion' => fake()->dateTimeBetween('now', '+30 days'),
            'service_id' => Service::factory(),
            'user_id' => User::factory(),
            'assigned_to' => User::factory(),
            'priority' => fake()->randomElement($priorities),
            'estimated_cost' => fake()->randomFloat(2, 50, 1000),
            'actual_cost' => fake()->optional(0.5)->randomFloat(2, 50, 1200),
            'completed_at' => fake()->optional(0.3)->dateTime(),
        ];
    }

    /**
     * Create a completed service order.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => fake()->dateTime(),
            'actual_cost' => fake()->randomFloat(2, 50, 1200),
        ]);
    }

    /**
     * Create an in-progress service order.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
        ]);
    }
}
