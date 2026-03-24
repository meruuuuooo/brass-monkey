<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CustomerSegmentController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PurchaseOrderController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\StockAdjustmentController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin|Manager'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);
    Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);
    Route::resource('suppliers', SupplierController::class)->except(['show', 'create', 'edit']);
    Route::resource('purchase-orders', PurchaseOrderController::class)->except(['create', 'edit']);
    Route::resource('stock-adjustments', StockAdjustmentController::class)->only(['index', 'store']);

    // CRM
    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::put('customers/{customer}/segments', [CustomerController::class, 'updateSegments'])->name('customers.segments');
    Route::post('customers/{customer}/notes', [CustomerController::class, 'addNote'])->name('customers.notes.store');
    Route::delete('customer-notes/{note}', [CustomerController::class, 'deleteNote'])->name('customers.notes.destroy');
    Route::resource('customer-segments', CustomerSegmentController::class)->except(['show', 'create', 'edit']);

    // Orders & Transactions
    Route::resource('orders', OrderController::class)->except(['create', 'edit', 'destroy']);
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');

    // Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('reports/inventory', [ReportController::class, 'inventory'])->name('reports.inventory');
    Route::get('reports/financial', [ReportController::class, 'financial'])->name('reports.financial');

    Route::resource('advertisements', AdvertisementController::class)->except(['show', 'create', 'edit']);
    Route::resource('announcements', AnnouncementController::class)->except(['show', 'create', 'edit']);
    Route::resource('notifications', NotificationController::class)->except(['create', 'edit']);
    Route::resource('services', ServiceController::class)->except(['show', 'create', 'edit']);
    Route::resource('service-requests', ServiceRequestController::class)->except(['create', 'edit', 'destroy']);
    Route::post('service-requests/{service_request}/notes', [ServiceRequestController::class, 'addNote'])->name('service-requests.notes.store');
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});

