<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = BlogCategory::withCount('posts')
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/blog-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
            'description' => 'nullable|string|max:1000',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        BlogCategory::create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, BlogCategory $blogCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $blogCategory->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $blogCategory->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(BlogCategory $blogCategory): RedirectResponse
    {
        $blogCategory->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
