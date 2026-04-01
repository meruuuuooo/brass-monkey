<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ExportReportJob;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockAdjustment;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    /**
     * Reports hub page.
     */
    public function index(): Response
    {
        return Inertia::render('admin/reports/index');
    }

    /**
     * Sales report.
     */
    public function sales(Request $request): Response
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        $orders = Order::whereBetween('created_at', [$from, $to.' 23:59:59']);

        $totalOrders = (clone $orders)->count();
        $totalRevenue = (clone $orders)->where('status', '!=', 'cancelled')->sum('total_amount');
        $totalRefunds = (clone $orders)->where('status', 'refunded')->sum('total_amount');
        $completedOrders = (clone $orders)->where('status', 'completed')->count();

        // Daily revenue breakdown
        $dailyRevenue = Order::whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top products by quantity sold
        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$from, $to.' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled', 'refunded'])
            ->select(
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.total_price) as total_revenue')
            )
            ->groupBy('order_items.product_name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        // Payment method breakdown
        $paymentMethods = Order::whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->whereNotNull('payment_method')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method')
            ->get();

        return Inertia::render('admin/reports/sales', [
            'filters' => ['from' => $from, 'to' => $to],
            'summary' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => round($totalRevenue, 2),
                'totalRefunds' => round($totalRefunds, 2),
                'completedOrders' => $completedOrders,
                'avgOrderValue' => $completedOrders > 0 ? round($totalRevenue / $completedOrders, 2) : 0,
            ],
            'dailyRevenue' => $dailyRevenue,
            'topProducts' => $topProducts,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Inventory report.
     */
    public function inventory(Request $request): Response
    {
        $products = Product::select('id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold', 'cost_price', 'price', 'is_available')
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'stock_quantity' => $p->stock_quantity,
                    'low_stock_threshold' => $p->low_stock_threshold,
                    'cost_price' => $p->cost_price,
                    'price' => $p->price,
                    'is_available' => $p->is_available,
                    'stock_value' => round($p->stock_quantity * $p->cost_price, 2),
                    'retail_value' => round($p->stock_quantity * $p->price, 2),
                    'is_low_stock' => $p->stock_quantity <= $p->low_stock_threshold,
                ];
            });

        $totalCostValue = $products->sum('stock_value');
        $totalRetailValue = $products->sum('retail_value');
        $lowStockCount = $products->where('is_low_stock', true)->count();
        $outOfStockCount = $products->where('stock_quantity', 0)->count();

        // Recent adjustments
        $recentAdjustments = StockAdjustment::with(['product:id,name,sku', 'adjustedBy:id,name'])
            ->latest()
            ->limit(15)
            ->get();

        return Inertia::render('admin/reports/inventory', [
            'products' => $products->values(),
            'summary' => [
                'totalProducts' => $products->count(),
                'totalCostValue' => round($totalCostValue, 2),
                'totalRetailValue' => round($totalRetailValue, 2),
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'potentialProfit' => round($totalRetailValue - $totalCostValue, 2),
            ],
            'recentAdjustments' => $recentAdjustments,
        ]);
    }

    /**
     * Financial summary report.
     */
    public function financial(Request $request): Response
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        // Income (payments)
        $totalPayments = Transaction::where('type', 'payment')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->sum('amount');

        // Refunds
        $totalRefunds = Transaction::where('type', 'refund')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->sum('amount');

        // Expenses (purchase orders received)
        $totalPurchases = PurchaseOrder::where('status', 'received')
            ->whereBetween('updated_at', [$from, $to.' 23:59:59'])
            ->sum('total_amount');

        // Transaction breakdown by day
        $dailyTransactions = Transaction::whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->select(
                DB::raw('DATE(created_at) as date'),
                'type',
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        // Customer count growth
        $newCustomers = User::role('Client')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->count();

        return Inertia::render('admin/reports/financial', [
            'filters' => ['from' => $from, 'to' => $to],
            'summary' => [
                'totalPayments' => round($totalPayments, 2),
                'totalRefunds' => round($totalRefunds, 2),
                'netRevenue' => round($totalPayments - $totalRefunds, 2),
                'totalPurchases' => round($totalPurchases, 2),
                'grossProfit' => round(($totalPayments - $totalRefunds) - $totalPurchases, 2),
                'newCustomers' => $newCustomers,
            ],
            'dailyTransactions' => $dailyTransactions,
        ]);
    }

    public function export(Request $request, string $type): RedirectResponse
    {
        if (! in_array($type, ['sales', 'inventory', 'financial'], true)) {
            abort(404);
        }

        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $token = Str::uuid()->toString();

        ExportReportJob::dispatch($type, $from, $to, $token);

        $downloadUrl = URL::temporarySignedRoute(
            'admin.reports.export.download',
            now()->addDay(),
            ['token' => $token]
        );

        return back()->with('success', 'Report export queued. Use the generated download link once ready.')
            ->with('exportDownloadUrl', $downloadUrl);
    }

    public function downloadExport(Request $request, string $token): BinaryFileResponse
    {
        if (! $request->hasValidSignature()) {
            abort(401);
        }

        $filePath = Cache::get("report-export:{$token}");

        if (! $filePath || ! Storage::disk('local')->exists($filePath)) {
            abort(404, 'Export file is not ready or has expired.');
        }

        return response()->download(Storage::disk('local')->path($filePath));
    }
}
