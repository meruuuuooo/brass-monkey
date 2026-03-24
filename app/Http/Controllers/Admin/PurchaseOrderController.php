<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PurchaseOrder::with(['supplier:id,name', 'orderedBy:id,name', 'approvedBy:id,name'])
            ->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('supplier')) {
            $query->where('supplier_id', $request->input('supplier'));
        }

        $purchaseOrders = $query->latest()
            ->paginate(15)
            ->withQueryString();

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $products = Product::where('is_available', true)->orderBy('name')->get(['id', 'name', 'sku', 'cost_price']);

        return Inertia::render('admin/purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers' => $suppliers,
            'products' => $products,
            'filters' => $request->only(['status', 'supplier']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $po = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'order_number' => PurchaseOrder::generateOrderNumber(),
                'status' => 'draft',
                'notes' => $validated['notes'] ?? null,
                'ordered_by' => $request->user()->id,
                'total_amount' => 0,
            ]);

            $total = 0;
            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $total += $lineTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $lineTotal,
                ]);
            }

            $po->update(['total_amount' => $total]);
        });

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order created successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load([
            'supplier',
            'orderedBy:id,name',
            'approvedBy:id,name',
            'items.product:id,name,sku',
        ]);

        return Inertia::render('admin/purchase-orders/show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,submitted,approved,received,cancelled',
        ]);

        $oldStatus = $purchaseOrder->status;
        $newStatus = $validated['status'];

        $purchaseOrder->update([
            'status' => $newStatus,
            'approved_by' => $newStatus === 'approved' ? $request->user()->id : $purchaseOrder->approved_by,
            'ordered_at' => $newStatus === 'submitted' && !$purchaseOrder->ordered_at ? now() : $purchaseOrder->ordered_at,
            'received_at' => $newStatus === 'received' ? now() : $purchaseOrder->received_at,
        ]);

        // Auto-add stock when PO is received
        if ($newStatus === 'received' && $oldStatus !== 'received') {
            foreach ($purchaseOrder->items as $item) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order status updated.');
    }

    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return redirect()->route('admin.purchase-orders.index')
                ->with('error', 'Only draft purchase orders can be deleted.');
        }

        $purchaseOrder->delete();

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', 'Purchase order deleted successfully.');
    }
}
