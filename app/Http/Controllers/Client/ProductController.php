<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category:id,name')
            ->where('is_available', true);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($category = $request->input('category')) {
            if ($category !== 'all') {
                $query->where('category_id', $category);
            }
        }

        return Inertia::render('client/products/index', [
            'products' => $query->latest()->paginate(12)->withQueryString(),
            'categories' => Category::all(['id', 'name']),
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_available, 404);

        $product->load('category:id,name');

        // Related products in same category (excluding current)
        $related = Product::with('category:id,name')
            ->where('is_available', true)
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn($q) => $q->where('category_id', $product->category_id))
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('client/products/show', [
            'product' => $product,
            'related' => $related,
        ]);
    }

    public function cartCheckout(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $user = $request->user();
        $items = collect($validated['items']);

        $products = Product::whereIn('id', $items->pluck('product_id'))
            ->where('is_available', true)
            ->get()
            ->keyBy('id');

        // Validate stock for all items before touching the DB
        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (!$product || $product->stock_quantity < $item['quantity']) {
                return back()->with('error', "\"" . ($product?->name ?? 'A product') . "\" doesn't have enough stock.");
            }
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($items, $products, $user) {
            $subtotal = $items->reduce(function ($carry, $item) use ($products) {
                return $carry + ($products[$item['product_id']]->price * $item['quantity']);
            }, 0);

            $order = \App\Models\Order::create([
                'order_number' => \App\Models\Order::generateOrderNumber(),
                'customer_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax_amount' => $subtotal * 0.1,
                'discount_amount' => 0,
                'total_amount' => $subtotal * 1.1,
                'payment_method' => 'deferred',
                'created_by' => $user->id,
            ]);

            foreach ($items as $item) {
                $product = $products[$item['product_id']];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total_price' => $product->price * $item['quantity'],
                ]);
                $product->decrement('stock_quantity', $item['quantity']);
            }
        });

        return redirect()->route('client.orders.index')
            ->with('success', 'Order placed! Our team will contact you for payment.');
    }

    public function purchase(Request $request, Product $product): \Illuminate\Http\RedirectResponse
    {
        if ($product->stock_quantity <= 0 || !$product->is_available) {
            return back()->with('error', 'This product is currently unavailable.');
        }

        $user = $request->user();

        \Illuminate\Support\Facades\DB::transaction(function () use ($product, $user) {
            $order = \App\Models\Order::create([
                'order_number' => \App\Models\Order::generateOrderNumber(),
                'customer_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $product->price,
                'tax_amount' => $product->price * 0.1, // Flat 10% tax for now
                'discount_amount' => 0,
                'total_amount' => $product->price * 1.1,
                'payment_method' => 'deferred',
                'created_by' => $user->id,
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price,
            ]);

            // Optional: Reduce stock
            $product->decrement('stock_quantity');
        });

        return redirect()->route('client.orders.index')
            ->with('success', 'Order placed successfully! our team will contact you for payment.');
    }
}
