<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin|Manager'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('advertisements', AdvertisementController::class)->except(['show', 'create', 'edit']);
    Route::resource('announcements', AnnouncementController::class)->except(['show', 'create', 'edit']);
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
