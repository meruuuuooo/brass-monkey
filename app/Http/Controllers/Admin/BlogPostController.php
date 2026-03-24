<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogPostController extends Controller
{
    public function index(Request $request): Response
    {
        $query = BlogPost::with(['author:id,name', 'categories:id,name', 'tags:id,name'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('category'), fn($q) => $q->whereHas('categories', fn($c) => $c->where('blog_categories.id', $request->category)))
            ->when($request->filled('search'), fn($q) => $q->where('title', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $categories = BlogCategory::orderBy('name')->get(['id', 'name']);
        $tags = BlogTag::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/blog-posts/index', [
            'posts' => $query,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => $request->only(['status', 'category', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:5120',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:300',
            'scheduled_at' => 'nullable|date',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:blog_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
        ]);

        $validated['author_id'] = Auth::id();
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);

        if ($request->hasFile('featured_image')) {
            $validated['featured_image_path'] = $request->file('featured_image')->store('blog/images', 'public');
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $categoryIds = $validated['categories'] ?? [];
        $tagIds = $validated['tags'] ?? [];
        unset($validated['featured_image'], $validated['categories'], $validated['tags']);

        $post = BlogPost::create($validated);
        $post->categories()->sync($categoryIds);
        $post->tags()->sync($tagIds);

        return redirect()->route('admin.blog-posts.index')
            ->with('success', 'Blog post created successfully.');
    }

    public function update(Request $request, BlogPost $blogPost): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug,' . $blogPost->id,
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:5120',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:300',
            'scheduled_at' => 'nullable|date',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:blog_categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);

        if ($request->hasFile('featured_image')) {
            if ($blogPost->featured_image_path) {
                Storage::disk('public')->delete($blogPost->featured_image_path);
            }
            $validated['featured_image_path'] = $request->file('featured_image')->store('blog/images', 'public');
        }

        if ($validated['status'] === 'published' && !$blogPost->published_at) {
            $validated['published_at'] = now();
        }

        $categoryIds = $validated['categories'] ?? [];
        $tagIds = $validated['tags'] ?? [];
        unset($validated['featured_image'], $validated['categories'], $validated['tags']);

        $blogPost->update($validated);
        $blogPost->categories()->sync($categoryIds);
        $blogPost->tags()->sync($tagIds);

        return redirect()->route('admin.blog-posts.index')
            ->with('success', 'Blog post updated successfully.');
    }

    public function destroy(BlogPost $blogPost): RedirectResponse
    {
        if ($blogPost->featured_image_path) {
            Storage::disk('public')->delete($blogPost->featured_image_path);
        }

        $blogPost->delete();

        return redirect()->route('admin.blog-posts.index')
            ->with('success', 'Blog post deleted successfully.');
    }

    public function publish(BlogPost $blogPost): RedirectResponse
    {
        $blogPost->update([
            'status' => 'published',
            'published_at' => $blogPost->published_at ?? now(),
        ]);

        return back()->with('success', 'Blog post published successfully.');
    }

    public function archive(BlogPost $blogPost): RedirectResponse
    {
        $blogPost->update(['status' => 'archived']);

        return back()->with('success', 'Blog post archived successfully.');
    }
}
