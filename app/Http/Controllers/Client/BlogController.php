<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $posts = BlogPost::with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])
            ->where('status', 'published')
            ->when($request->filled('category'), fn($q) => $q->whereHas('categories', fn($c) => $c->where('blog_categories.slug', $request->category)))
            ->when($request->filled('tag'), fn($q) => $q->whereHas('tags', fn($t) => $t->where('blog_tags.slug', $request->tag)))
            ->when($request->filled('search'), fn($q) => $q->where(fn($w) => $w->where('title', 'like', '%' . $request->search . '%')->orWhere('excerpt', 'like', '%' . $request->search . '%')))
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        $categories = BlogCategory::withCount(['posts' => fn($q) => $q->where('status', 'published')])->orderBy('name')->get();
        $tags = BlogTag::withCount(['posts' => fn($q) => $q->where('status', 'published')])->orderBy('name')->get();

        return Inertia::render('client/blog/index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => $request->only(['category', 'tag', 'search']),
        ]);
    }

    public function guestIndex(Request $request): Response
    {
        $posts = BlogPost::with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])
            ->where('status', 'published')
            ->when($request->filled('category'), fn($q) => $q->whereHas('categories', fn($c) => $c->where('blog_categories.slug', $request->category)))
            ->when($request->filled('tag'), fn($q) => $q->whereHas('tags', fn($t) => $t->where('blog_tags.slug', $request->tag)))
            ->when($request->filled('search'), fn($q) => $q->where(fn($w) => $w->where('title', 'like', '%' . $request->search . '%')->orWhere('excerpt', 'like', '%' . $request->search . '%')))
            ->orderByDesc('is_featured')
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        $categories = BlogCategory::withCount(['posts' => fn($q) => $q->where('status', 'published')])->orderBy('name')->get();
        $tags = BlogTag::withCount(['posts' => fn($q) => $q->where('status', 'published')])->orderBy('name')->get();

        return Inertia::render('articles', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => $request->only(['category', 'tag', 'search']),
        ]);
    }

    public function guestShow(string $slug): Response
    {
        $post = BlogPost::with([
            'author:id,name,avatar',
            'categories:id,name,slug',
            'tags:id,name,slug',
            'approvedComments.author:id,name,avatar',
        ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $post->incrementViewCount();

        $related = BlogPost::with(['author:id,name', 'categories:id,name,slug'])
            ->where('status', 'published')
            ->where('id', '!=', $post->id)
            ->whereHas('categories', fn($q) => $q->whereIn('blog_categories.id', $post->categories->pluck('id')))
            ->latest('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('blog-show', [
            'post' => $post,
            'related' => $related,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = BlogPost::with([
            'author:id,name,avatar',
            'categories:id,name,slug',
            'tags:id,name,slug',
            'approvedComments.author:id,name,avatar',
        ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $post->incrementViewCount();

        $related = BlogPost::with(['author:id,name', 'categories:id,name,slug'])
            ->where('status', 'published')
            ->where('id', '!=', $post->id)
            ->whereHas('categories', fn($q) => $q->whereIn('blog_categories.id', $post->categories->pluck('id')))
            ->latest('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('client/blog/show', [
            'post' => $post,
            'related' => $related,
        ]);
    }

    public function comment(Request $request, string $slug): RedirectResponse
    {
        $post = BlogPost::where('slug', $slug)->where('status', 'published')->firstOrFail();

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        BlogComment::create([
            'blog_post_id' => $post->id,
            'user_id' => Auth::id(),
            'body' => $request->body,
            'is_approved' => false,
        ]);

        return back()->with('success', 'Your comment has been submitted and is pending approval.');
    }
}
