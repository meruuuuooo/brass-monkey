<?php

use App\Http\Controllers\Client\ServiceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TrackOrderController;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    if (auth()->check()) {
        if (auth()->user()->hasRole(['Admin', 'Manager'])) {
            return redirect()->route('dashboard');
        }

        return redirect()->route('profile.edit');
    }

    $order = null;
    $trackingQuery = $request->query('number');

    if ($trackingQuery) {
        $order = ServiceOrder::where('tracking_number', $trackingQuery)->first();
    }

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'order' => $order,
        'query' => $trackingQuery,
    ]);
})->name('home');

Route::get('/track-order', [TrackOrderController::class, 'index'])->name('track-order');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Services
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::post('/services/book', [ServiceController::class, 'book'])->name('services.book');

    // My Orders
    Route::get('/my-orders', [\App\Http\Controllers\Client\OrderController::class, 'index'])->name('client.orders.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
