<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['customer:id,name,email', 'createdBy:id,name'])
            ->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
            });
        }

        $orders = $query->latest()->paginate(15)->withQueryString();
        $customers = User::role('Client')->orderBy('name')->get(['id', 'name', 'email']);
        $products = Product::where('is_available', true)->orderBy('name')->get(['id', 'name', 'sku', 'price', 'stock_quantity']);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'customers' => $customers,
            'products' => $products,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:users,id',
            'payment_method' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'customer_id' => $validated['customer_id'] ?? null,
                'status' => 'pending',
                'subtotal' => 0,
                'tax_amount' => 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'total_amount' => 0,
                'payment_method' => $validated['payment_method'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $subtotal += $lineTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $lineTotal,
                ]);

                // Decrement stock
                $product->decrement('stock_quantity', $item['quantity']);
            }

            $discount = $validated['discount_amount'] ?? 0;
            $total = max(0, $subtotal - $discount);

            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $total,
            ]);

            // Auto-create payment transaction
            if ($validated['payment_method']) {
                Transaction::create([
                    'transaction_number' => Transaction::generateTransactionNumber(),
                    'order_id' => $order->id,
                    'type' => 'payment',
                    'amount' => $total,
                    'payment_method' => $validated['payment_method'],
                    'processed_by' => $request->user()->id,
                ]);
                $order->update(['status' => 'completed']);
            }
        });

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order created successfully.');
    }

    public function show(Order $order): Response
    {
        $order->load([
            'customer:id,name,email',
            'createdBy:id,name',
            'items.product:id,name,sku',
            'transactions.processedBy:id,name',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled,refunded',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        // Refund: create refund transaction and restore stock
        if ($newStatus === 'refunded' && $oldStatus !== 'refunded') {
            if (!$request->user()->hasRole('Admin')) {
                return back()->with('error', 'Only Administrators can process refunds.');
            }

            DB::transaction(function () use ($order, $request) {
                Transaction::create([
                    'transaction_number' => Transaction::generateTransactionNumber(),
                    'order_id' => $order->id,
                    'type' => 'refund',
                    'amount' => $order->total_amount,
                    'payment_method' => $order->payment_method,
                    'notes' => 'Full refund',
                    'processed_by' => $request->user()->id,
                ]);

                foreach ($order->items as $item) {
                    $item->product?->increment('stock_quantity', $item->quantity);
                }

                $order->update(['status' => 'refunded']);
            });

            return back()->with('success', 'Order refunded and stock restored.');
        }

        // Cancelled: restore stock
        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    $item->product?->increment('stock_quantity', $item->quantity);
                }
                $order->update(['status' => 'cancelled']);
            });

            return back()->with('success', 'Order cancelled and stock restored.');
        }

        $order->update(['status' => $newStatus]);

        return back()->with('success', 'Order status updated.');
    }
}
