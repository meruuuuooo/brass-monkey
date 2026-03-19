<?php

use App\Http\Controllers\TrackOrderController;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    if (auth()->check()) {
        return redirect()->route('dashboard');
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
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
