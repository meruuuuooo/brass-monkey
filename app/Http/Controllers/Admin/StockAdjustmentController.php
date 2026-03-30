<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function __construct(private readonly ActivityLogger $logger) {}

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

        $adjustment = null;

        DB::transaction(function () use ($validated, $request, &$adjustment) {
            $product = Product::findOrFail($validated['product_id']);

            $adjustment = StockAdjustment::create([
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

        if ($adjustment) {
            $product = Product::find($validated['product_id']);
            $this->logger->log(
                $request->user(),
                'stock_adjusted',
                "Stock {$validated['type']} of {$validated['quantity']} units for {$product?->name} ({$product?->sku})",
                properties: [
                    'product' => $product?->name,
                    'sku' => $product?->sku,
                    'type' => $validated['type'],
                    'quantity' => $validated['quantity'],
                    'reason' => $validated['reason'] ?? null,
                ],
                subjectType: 'StockAdjustment',
                subjectId: $adjustment->id,
            );
        }

        return redirect()->route('admin.stock-adjustments.index')
            ->with('success', 'Stock adjustment recorded.');
    }
}
