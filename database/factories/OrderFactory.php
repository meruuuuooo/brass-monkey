<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
        $paymentMethods = ['cash', 'card', 'transfer', 'check'];

        $subtotal = fake()->randomFloat(2, 50, 2000);
        $tax = $subtotal * 0.1; // 10% tax
        $discount = fake()->optional(0.3)->randomFloat(2, 0, $subtotal * 0.2);

        return [
            'order_number' => 'ORD-' . date('Y') . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 5, '0', STR_PAD_LEFT),
            'customer_id' => User::factory(),
            'status' => fake()->randomElement($statuses),
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'discount_amount' => $discount ?? 0,
            'total_amount' => $subtotal + $tax - ($discount ?? 0),
            'payment_method' => fake()->randomElement($paymentMethods),
            'notes' => fake()->optional(0.3)->sentence(),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Create a completed order.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Create a pending order.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
