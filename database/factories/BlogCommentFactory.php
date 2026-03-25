<?php

namespace Database\Factories;

use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogCommentFactory extends Factory
{
    protected $model = BlogComment::class;

    public function definition(): array
    {
        return [
            'blog_post_id' => BlogPost::factory(),
            'user_id' => User::factory(),
            'body' => $this->faker->paragraph(),
            'is_approved' => $this->faker->boolean(80),
        ];
    }
}
