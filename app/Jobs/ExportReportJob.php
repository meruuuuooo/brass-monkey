<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ExportReportJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public string $type,
        public string $from,
        public string $to,
        public string $token
    ) {}

    public function handle(): void
    {
        $filePath = "exports/{$this->type}-{$this->token}.csv";
        $rows = $this->buildRows();

        $handle = fopen('php://temp', 'r+');

        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        Storage::disk('local')->put($filePath, $content ?: '');

        Cache::put("report-export:{$this->token}", $filePath, now()->addHours(24));
    }

    private function buildRows(): array
    {
        return match ($this->type) {
            'sales' => $this->salesRows(),
            'inventory' => $this->inventoryRows(),
            'financial' => $this->financialRows(),
            default => [['error', 'Unsupported report type']],
        };
    }

    private function salesRows(): array
    {
        $rows = [['date', 'order_number', 'status', 'total_amount', 'payment_method']];

        $orders = Order::query()
            ->whereBetween('created_at', [$this->from, $this->to.' 23:59:59'])
            ->orderBy('created_at')
            ->get(['created_at', 'order_number', 'status', 'total_amount', 'payment_method']);

        foreach ($orders as $order) {
            $rows[] = [
                $order->created_at?->toDateString(),
                $order->order_number,
                $order->status,
                (string) $order->total_amount,
                $order->payment_method,
            ];
        }

        return $rows;
    }

    private function inventoryRows(): array
    {
        $rows = [['sku', 'name', 'stock_quantity', 'cost_price', 'price']];

        $products = Product::query()->orderBy('name')->get(['sku', 'name', 'stock_quantity', 'cost_price', 'price']);

        foreach ($products as $product) {
            $rows[] = [
                $product->sku,
                $product->name,
                (string) $product->stock_quantity,
                (string) $product->cost_price,
                (string) $product->price,
            ];
        }

        return $rows;
    }

    private function financialRows(): array
    {
        $rows = [['date', 'type', 'amount', 'reference_type', 'reference_id']];

        $transactions = Transaction::query()
            ->whereBetween('created_at', [$this->from, $this->to.' 23:59:59'])
            ->orderBy('created_at')
            ->get(['created_at', 'type', 'amount', 'reference_type', 'reference_id']);

        foreach ($transactions as $transaction) {
            $rows[] = [
                $transaction->created_at?->toDateString(),
                $transaction->type,
                (string) $transaction->amount,
                $transaction->reference_type,
                (string) $transaction->reference_id,
            ];
        }

        $rows[] = [];
        $rows[] = ['received_purchase_orders_total', (string) PurchaseOrder::query()
            ->where('status', 'received')
            ->whereBetween('updated_at', [$this->from, $this->to.' 23:59:59'])
            ->sum('total_amount')];

        return $rows;
    }
}
