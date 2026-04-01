<?php

use App\Jobs\ExportReportJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);
});

test('admin can queue sales report export', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    actingAs($admin)
        ->get(route('admin.reports.export', [
            'type' => 'sales',
            'from' => now()->subMonth()->toDateString(),
            'to' => now()->toDateString(),
        ]))
        ->assertRedirect();

    Queue::assertPushed(ExportReportJob::class);
});
