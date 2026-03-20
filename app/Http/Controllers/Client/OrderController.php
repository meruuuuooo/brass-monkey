<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = ServiceOrder::where('customer_name', $request->user()->name)
            ->latest()
            ->paginate(15);

        return Inertia::render('client/orders/index', [
            'orders' => $orders,
        ]);
    }
}
