<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin|Manager'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('advertisements', AdvertisementController::class)->except(['show', 'create', 'edit']);
    Route::resource('announcements', AnnouncementController::class)->except(['show', 'create', 'edit']);
    Route::resource('services', ServiceController::class)->except(['show', 'create', 'edit']);
    Route::resource('service-requests', ServiceRequestController::class)->only(['index', 'update']);
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
