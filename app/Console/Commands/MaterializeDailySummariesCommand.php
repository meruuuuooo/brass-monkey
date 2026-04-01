<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MaterializeDailySummariesCommand extends Command
{
    protected $signature = 'reports:materialize-daily-summaries {--date=}';

    protected $description = 'Materialize daily sales and inventory summary tables';

    public function handle(): int
    {
        $date = $this->option('date') ?: now()->toDateString();
        $from = $date.' 00:00:00';
        $to = $date.' 23:59:59';

        $orders = Order::query()->whereBetween('created_at', [$from, $to]);
        $grossRevenue = (clone $orders)->where('status', '!=', 'cancelled')->sum('total_amount');
        $refundsTotal = (clone $orders)->where('status', 'refunded')->sum('total_amount');
        $ordersCount = (clone $orders)->count();
        $netRevenue = $grossRevenue - $refundsTotal;
        $avgOrderValue = $ordersCount > 0 ? $netRevenue / $ordersCount : 0;

        DB::table('daily_sales_summaries')->updateOrInsert(
            ['date' => $date],
            [
                'orders_count' => $ordersCount,
                'gross_revenue' => round($grossRevenue, 2),
                'refunds_total' => round($refundsTotal, 2),
                'net_revenue' => round($netRevenue, 2),
                'avg_order_value' => round($avgOrderValue, 2),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $products = Product::query()->get(['stock_quantity', 'low_stock_threshold', 'cost_price', 'price']);

        DB::table('daily_inventory_summaries')->updateOrInsert(
            ['date' => $date],
            [
                'total_cost_value' => round($products->sum(fn (Product $product) => $product->stock_quantity * (float) $product->cost_price), 2),
                'total_retail_value' => round($products->sum(fn (Product $product) => $product->stock_quantity * (float) $product->price), 2),
                'low_stock_count' => $products->where(fn (Product $product) => $product->stock_quantity <= $product->low_stock_threshold)->count(),
                'out_of_stock_count' => $products->where('stock_quantity', 0)->count(),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $this->info("Daily summaries materialized for {$date}");

        return self::SUCCESS;
    }
}
