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
