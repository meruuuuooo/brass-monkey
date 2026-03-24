<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogTagController extends Controller
{
    public function index(): Response
    {
        $tags = BlogTag::withCount('posts')
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/blog-tags/index', [
            'tags' => $tags,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        BlogTag::create($validated);

        return back()->with('success', 'Tag created successfully.');
    }

    public function update(Request $request, BlogTag $blogTag): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug,' . $blogTag->id,
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $blogTag->update($validated);

        return back()->with('success', 'Tag updated successfully.');
    }

    public function destroy(BlogTag $blogTag): RedirectResponse
    {
        $blogTag->delete();

        return back()->with('success', 'Tag deleted successfully.');
    }
}
