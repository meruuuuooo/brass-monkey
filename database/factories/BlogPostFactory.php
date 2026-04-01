<?php

namespace Database\Factories;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    public function definition(): array
    {
        $title = $this->faker->sentence();

        $images = [
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop', // Tools
            'https://images.unsplash.com/photo-1504917595217-d4dc5f649734?q=80&w=1200&auto=format&fit=crop', // Construction
            'https://images.unsplash.com/photo-1534398079543-7ae6d016b167?q=80&w=1200&auto=format&fit=crop', // Industrial
            'https://images.unsplash.com/photo-1517646281502-d636da241f4b?q=80&w=1200&auto=format&fit=crop', // Workshop
            'https://images.unsplash.com/photo-1530124566582-a618bc2615ad?q=80&w=1200&auto=format&fit=crop', // Blueprints
            'https://images.unsplash.com/photo-1572916141567-47add3ec99bf?q=80&w=1200&auto=format&fit=crop', // Mechanic
            'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop', // Gear
            'https://images.unsplash.com/photo-1454694220579-9d6672b1ec2a?q=80&w=1200&auto=format&fit=crop', // Welding
            'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=1200&auto=format&fit=crop', // Tools 2
        ];

        return [
            'author_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'excerpt' => $this->faker->paragraph(),
            'content' => $this->faker->paragraphs(5, true),
            'featured_image_path' => 'services/brass-monkey-logo.png',
            'status' => $this->faker->randomElement(['draft', 'published', 'archived']),
            'is_featured' => $this->faker->boolean(20),
            'meta_title' => $title,
            'meta_description' => $this->faker->sentence(),
            'published_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'view_count' => $this->faker->numberBetween(0, 5000),
        ];
    }

    public function published(): self
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}
