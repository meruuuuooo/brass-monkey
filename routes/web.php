<?php

use App\Http\Controllers\Client\BlogController;
use App\Http\Controllers\Client\NotificationController;
use App\Http\Controllers\Client\OrderController;
use App\Http\Controllers\Client\ProductController;
use App\Http\Controllers\Client\PromotionController;
use App\Http\Controllers\Client\ServiceController;
use App\Http\Controllers\Client\ServiceJobController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TrackOrderController;
use App\Models\Advertisement;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Service;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    $order = null;
    $trackingQuery = $request->query('number');

    if ($trackingQuery) {
        $order = ServiceOrder::where('tracking_number', $trackingQuery)->first();
    }

    $now = now();
    $advertisements = Advertisement::where('is_active', true)
        ->where(function ($q) use ($now) {
            $q->whereNull('display_start_at')
                ->orWhere(function ($q2) use ($now) {
                    $q2->where('display_start_at', '<=', $now)->where(function ($q3) use ($now) {
                        $q3->whereNull('display_duration_hours')
                            ->orWhereRaw(
                                'DATE_ADD(display_start_at, INTERVAL display_duration_hours HOUR) >= ?',
                                [$now]
                            );
                    });
                });
        })
        ->orderBy('priority', 'desc')
        ->latest()
        ->get();

    $posts = BlogPost::with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])
        ->where('status', 'published')
        ->when($request->filled('category'), fn ($q) => $q->whereHas('categories', fn ($c) => $c->where('blog_categories.slug', $request->category)))
        ->when($request->filled('tag'), fn ($q) => $q->whereHas('tags', fn ($t) => $t->where('blog_tags.slug', $request->tag)))
        ->when($request->filled('search'), fn ($q) => $q->where(fn ($w) => $w->where('title', 'like', '%'.$request->search.'%')->orWhere('excerpt', 'like', '%'.$request->search.'%')))
        ->orderByDesc('is_featured')
        ->latest('published_at')
        ->paginate(12)
        ->withQueryString();

    $categories = BlogCategory::withCount(['posts' => fn ($q) => $q->where('status', 'published')])->orderBy('name')->get();
    $tags = BlogTag::withCount(['posts' => fn ($q) => $q->where('status', 'published')])->orderBy('name')->get();

    $services = Service::where('is_active', true)->get();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'order' => $order,
        'query' => $trackingQuery,
        'advertisements' => $advertisements,
        'posts' => $posts,
        'categories' => $categories,
        'tags' => $tags,
        'services' => $services,
        'filters' => $request->only(['category', 'tag', 'search']),
    ]);
})->name('home');

Route::get('/track-order', [TrackOrderController::class, 'index'])->name('track-order');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Services
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
    Route::post('/services/book', [ServiceController::class, 'book'])->name('services.book');

    // Promotions
    Route::get('/promotions', [PromotionController::class, 'index'])->name('client.promotions.index');

    // Shop / Catalog
    Route::get('/products', [
        ProductController::class,
        'index',
    ])->name('client.products.index');
    Route::post('/products/{product}/purchase', [
        ProductController::class,
        'purchase',
    ])->name('client.products.purchase');

    // My Orders
    Route::get('/my-orders', [
        OrderController::class,
        'index',
    ])->name('client.orders.index');

    // My Service Jobs
    Route::get('/my-jobs', [
        ServiceJobController::class,
        'index',
    ])->name('client.jobs.index');
    Route::get('/my-jobs/{job}', [
        ServiceJobController::class,
        'show',
    ])->name('client.jobs.show');
    Route::post('/my-jobs/{job}/approve', [
        ServiceJobController::class,
        'approveEstimate',
    ])->name('client.jobs.approve');
    Route::post('/my-jobs/{job}/review', [
        ServiceJobController::class,
        'submitReview',
    ])->name('client.jobs.review');

    // Notifications
    Route::get('/notifications', [
        NotificationController::class,
        'index',
    ])->name('client.notifications.index');
    Route::post('/notifications/{id}/read', [
        NotificationController::class,
        'markAsRead',
    ])->name('client.notifications.read');
    Route::post('/notifications/mark-all-read', [
        NotificationController::class,
        'markAllAsRead',
    ])->name('client.notifications.read-all');
    Route::post('/notifications/{notification}/track-open', [
        NotificationController::class,
        'trackOpen',
    ])->name('client.notifications.track-open');

    // Blog Client Comments
    Route::post('/blog/{slug}/comment', [
        BlogController::class,
        'comment',
    ])->name('client.blog.comment');
});

// Public Blog Routes
Route::get('/blog-articles', [
    BlogController::class,
    'guestIndex',
])->name('guest.blog.index');

Route::get('/blog-article/{slug}', [
    BlogController::class,
    'guestShow',
])->name('guest.blog.show');

Route::get('/blog', [
    BlogController::class,
    'index',
])->name('client.blog.index');
Route::get('/blog/{slug}', [
    BlogController::class,
    'show',
])->name('guest.blog.show');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
