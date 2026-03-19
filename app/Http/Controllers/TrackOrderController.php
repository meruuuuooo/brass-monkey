<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $trackingNumber = $request->query('number');
        $order = null;

        if ($trackingNumber) {
            $order = ServiceOrder::where('tracking_number', $trackingNumber)->first();
        }

        return Inertia::render('track-order', [
            'order' => $order,
            'query' => $trackingNumber,
        ]);
    }
}
