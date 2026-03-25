<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Categories
        $categories = BlogCategory::factory(5)->create();

        // 2. Create Tags
        $tags = BlogTag::factory(10)->create();

        // 3. Get authors (Admins and Managers)
        $authors = User::role(['Admin', 'Manager'])->get();

        if ($authors->isEmpty()) {
            $authors = User::factory(2)->create()->each(function (User $u) {
                $u->assignRole('Admin');
            });
        }

        // 4. Create Posts
        BlogPost::factory(15)
            ->published()
            ->recycle($authors)
            ->create()
            ->each(function ($post) use ($categories, $tags) {
                // Attach random categories (1-2)
                $post->categories()->attach(
                    $categories->random(rand(1, 2))->pluck('id')->toArray()
                );

                // Attach random tags (2-5)
                $post->tags()->attach(
                    $tags->random(rand(2, 5))->pluck('id')->toArray()
                );

                // Add random comments
                BlogComment::factory(rand(2, 8))
                    ->recycle($post)
                    ->create([
                        'user_id' => User::inRandomOrder()->first()->id
                    ]);
            });

        // 5. Create some Drafts and Archived posts
        BlogPost::factory(5)
            ->recycle($authors)
            ->create([
                'status' => 'draft',
                'published_at' => null
            ]);

        BlogPost::factory(2)
            ->recycle($authors)
            ->create([
                'status' => 'archived'
            ]);
    }
}
