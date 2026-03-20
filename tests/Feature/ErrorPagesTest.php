<?php

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    Route::get('/__test-errors/{status}', function (int $status) {
        abort($status);
    });
});

test('custom inertia error pages are rendered for supported statuses', function (int $status): void {
    $response = $this->get("/__test-errors/{$status}");

    $response->assertStatus($status);
    $response->assertInertia(fn (Assert $page) => $page->component("errors/{$status}"));
})->with([400, 401, 403, 404, 408, 500, 502, 503, 504]);
