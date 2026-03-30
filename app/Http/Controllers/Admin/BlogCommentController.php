<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogComment;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BlogCommentController extends Controller
{
    public function index(): Response
    {
        $comments = BlogComment::with(['post:id,title,slug', 'author:id,name'])
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/blog-comments/index', [
            'comments' => $comments,
        ]);
    }

    public function approve(BlogComment $blogComment): RedirectResponse
    {
        $blogComment->update(['is_approved' => !$blogComment->is_approved]);

        $action = $blogComment->is_approved ? 'approved' : 'unapproved';

        return back()->with('success', "Comment {$action} successfully.");
    }

    public function destroy(BlogComment $blogComment): RedirectResponse
    {
        $blogComment->delete();

        return back()->with('success', 'Comment deleted successfully.');
    }
}
