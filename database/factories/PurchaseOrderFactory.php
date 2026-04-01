<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['draft', 'submitted', 'approved', 'received', 'cancelled'];

        return [
            'supplier_id' => Supplier::factory(),
            'order_number' => 'PO-' . date('Y') . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 5, '0', STR_PAD_LEFT),
            'status' => fake()->randomElement($statuses),
            'total_amount' => fake()->randomFloat(2, 100, 5000),
            'notes' => fake()->optional(0.5)->sentence(),
            'ordered_by' => User::factory(),
            'approved_by' => User::factory(),
            'ordered_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'received_at' => fake()->optional(0.7)->dateTimeBetween('-20 days', 'now'),
        ];
    }

    /**
     * Create a pending purchase order.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'approved_by' => null,
            'received_at' => null,
        ]);
    }

    /**
     * Create a received purchase order.
     */
    public function received(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'received',
            'received_at' => fake()->dateTime(),
        ]);
    }
}
