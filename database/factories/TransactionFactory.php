<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['payment', 'refund', 'adjustment']);

        return [
            'transaction_number' => 'TXN-' . fake()->unique()->bothify('#####-????'),
            'order_id' => Order::factory(),
            'type' => $type,
            'amount' => fake()->randomFloat(2, 50, 2000),
            'payment_method' => fake()->randomElement(['cash', 'card', 'transfer', 'check']),
            'reference' => fake()->optional(0.5)->text(30),
            'notes' => fake()->optional(0.3)->sentence(),
            'processed_by' => User::factory(),
        ];
    }

    /**
     * Create a completed transaction.
     */
    public function payment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'payment',
        ]);
    }
}
