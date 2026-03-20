<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Models\Announcement;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();

        if ($user->hasRole(['Admin', 'Manager'])) {
            return Inertia::render('admin/dashboard', [
                'totalClients' => User::role('Client')->count(),
            ]);
        }

        // Mock data for client's active work orders
        $activeWorkOrders = [
            ['id' => 1, 'number' => 'WO-2026-001', 'status' => 'In Progress', 'type' => 'Full Engine Overhaul'],
            ['id' => 2, 'number' => 'WO-2026-004', 'status' => 'Pending', 'type' => 'Suspension Tuning'],
            ['id' => 3, 'number' => 'WO-2026-007', 'status' => 'Awaiting Parts', 'type' => 'Custom Exhaust Build'],
        ];

        return Inertia::render('client/dashboard', [
            'activeWorkOrders' => $activeWorkOrders,
            'advertisements' => Advertisement::where('is_active', true)
                ->orderBy('priority', 'desc')
                ->latest()
                ->get(),
            'announcements' => Announcement::active()
                ->orderBy('priority', 'desc')
                ->latest()
                ->get(),
        ]);
    }
}
