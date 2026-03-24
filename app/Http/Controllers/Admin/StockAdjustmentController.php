<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockAdjustment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StockAdjustment::with(['product:id,name,sku', 'adjustedBy:id,name']);

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $adjustments = $query->latest()
            ->paginate(20)
            ->withQueryString();

        $products = Product::orderBy('name')->get(['id', 'name', 'sku', 'stock_quantity']);

        return Inertia::render('admin/stock-adjustments/index', [
            'adjustments' => $adjustments,
            'products' => $products,
            'filters' => $request->only(['type']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:addition,subtraction,audit',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::findOrFail($validated['product_id']);

            StockAdjustment::create([
                ...$validated,
                'adjusted_by' => $request->user()->id,
            ]);

            if ($validated['type'] === 'addition') {
                $product->increment('stock_quantity', $validated['quantity']);
            } elseif ($validated['type'] === 'subtraction') {
                $product->decrement('stock_quantity', max(0, $validated['quantity']));
                // Prevent negative stock
                if ($product->fresh()->stock_quantity < 0) {
                    $product->update(['stock_quantity' => 0]);
                }
            } else {
                // Audit: set stock to the exact quantity given
                $product->update(['stock_quantity' => $validated['quantity']]);
            }
        });

        return redirect()->route('admin.stock-adjustments.index')
            ->with('success', 'Stock adjustment recorded.');
    }
}
