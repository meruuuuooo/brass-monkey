<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Models\Announcement;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\ServiceOrder;
use App\Models\StockAdjustment;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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

        if ($user->hasRole('Admin')) {
            return $this->adminDashboard();
        }

        if ($user->hasRole('Manager')) {
            return $this->managerDashboard();
        }

        // Mock data for client's active work orders
        $activeWorkOrders = [
            ['id' => 1, 'number' => 'WO-2026-001', 'status' => 'In Progress', 'type' => 'Full Engine Overhaul'],
            ['id' => 2, 'number' => 'WO-2026-004', 'status' => 'Pending', 'type' => 'Suspension Tuning'],
            ['id' => 3, 'number' => 'WO-2026-007', 'status' => 'Awaiting Parts', 'type' => 'Custom Exhaust Build'],
        ];

        $now = now();

        return Inertia::render('client/dashboard', [
            'activeWorkOrders' => $activeWorkOrders,
            'advertisements' => Advertisement::where('is_active', true)
                ->where(function ($q) use ($now) {
                    // No scheduled start → always show
                    $q->whereNull('display_start_at')
                        // OR: started already
                        ->orWhere(function ($q2) use ($now) {
                        $q2->where('display_start_at', '<=', $now)
                            ->where(function ($q3) use ($now) {
                                // No duration → show indefinitely after start
                                $q3->whereNull('display_duration_hours')
                                    // OR: still within duration window
                                    ->orWhereRaw(
                                        'DATE_ADD(display_start_at, INTERVAL display_duration_hours HOUR) >= ?',
                                        [$now]
                                    );
                            });
                    });
                })
                ->orderBy('priority', 'desc')
                ->latest()
                ->get(),
            'announcements' => Announcement::active()
                ->orderBy('priority', 'desc')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Manager operational dashboard.
     */
    private function managerDashboard(): Response
    {
        $today = now()->startOfDay();

        $todaysOrders = Order::where('created_at', '>=', $today)->count();
        $todaysRevenue = Order::where('created_at', '>=', $today)
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->sum('total_amount');

        $pendingJobs = ServiceOrder::where('status', 'pending')->count();

        $myJobsCount = ServiceOrder::where('assigned_to', auth()->id())
            ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
            ->count();

        $lowStockProducts = Product::where('is_available', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->select('id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold')
            ->limit(10)
            ->get();

        $recentOrders = Order::with('customer:id,name')
            ->latest()
            ->limit(10)
            ->get(['id', 'order_number', 'customer_id', 'status', 'total_amount', 'created_at']);

        $recentJobs = ServiceOrder::with(['customer:id,name', 'service:id,name', 'assignee:id,name'])
            ->latest()
            ->limit(10)
            ->get(['id', 'tracking_number', 'user_id', 'service_id', 'status', 'priority', 'assigned_to', 'created_at']);

        return Inertia::render('manager/dashboard', [
            'todaysOrders' => $todaysOrders,
            'todaysRevenue' => round($todaysRevenue, 2),
            'pendingJobs' => $pendingJobs,
            'myJobsCount' => $myJobsCount,
            'lowStockProducts' => $lowStockProducts,
            'recentOrders' => $recentOrders,
            'recentJobs' => $recentJobs,
        ]);
    }

    /**
     * Admin dashboard with system KPIs.
     */
    private function adminDashboard(): Response
    {
        // --- Products & Inventory ---
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_available', true)->count();
        $inventoryValue = Product::sum(DB::raw('stock_quantity * cost_price'));
        $retailValue = Product::sum(DB::raw('stock_quantity * price'));
        $lowStockProducts = Product::where('is_available', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->select('id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold')
            ->limit(10)
            ->get();

        // --- Suppliers ---
        $totalSuppliers = Supplier::count();
        $activeSuppliers = Supplier::where('is_active', true)->count();

        // --- Purchase Orders ---
        $poStats = PurchaseOrder::select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $recentPOs = PurchaseOrder::with('supplier:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'supplier_id', 'status', 'total_amount', 'created_at']);

        // --- Customers ---
        $totalClients = User::role('Client')->count();
        $newClientsThisMonth = User::role('Client')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        // --- Stock Adjustments ---
        $recentAdjustments = StockAdjustment::with(['product:id,name,sku', 'adjustedBy:id,name'])
            ->latest()
            ->limit(5)
            ->get();

        // --- Service Orders (calendar) ---
        $serviceOrders = ServiceOrder::all()->toArray();
        $calendarItems = collect($serviceOrders)
            ->map(function (array $order) {
                $displayDate = $order['estimated_completion'] ?? $order['created_at'];
                return [
                    'date' => (new \DateTime($displayDate))->format('Y-m-d'),
                    'status' => $this->mapStatusToCalendarStatus($order['status']),
                ];
            })
            ->toArray();

        return Inertia::render('admin/dashboard', [
            'totalClients' => $totalClients,
            'newClientsThisMonth' => $newClientsThisMonth,
            'calendarItems' => $calendarItems,
            'serviceOrders' => $serviceOrders,
            // Products & Inventory
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'inventoryValue' => round($inventoryValue, 2),
            'retailValue' => round($retailValue, 2),
            'lowStockProducts' => $lowStockProducts,
            // Suppliers
            'totalSuppliers' => $totalSuppliers,
            'activeSuppliers' => $activeSuppliers,
            // Purchase Orders
            'poStats' => $poStats,
            'recentPOs' => $recentPOs,
            // Stock Adjustments
            'recentAdjustments' => $recentAdjustments,
        ]);
    }

    /**
     * Map service order status to calendar status.
     */
    private function mapStatusToCalendarStatus(string $status): string
    {
        return match (strtolower($status)) {
            'completed', 'done' => 'completed',
            'pending', 'awaiting' => 'pending',
            'in-progress', 'in progress' => 'pending',
            'urgent' => 'urgent',
            default => 'pending',
        };
    }
}

