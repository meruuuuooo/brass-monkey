<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::with('items.product:id,name,image_path')
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('client/orders/index', [
            'orders' => $orders,
        ]);
    }
}
