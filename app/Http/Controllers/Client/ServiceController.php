<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('client/services/index', [
            'services' => Service::where('is_active', true)->get(),
        ]);
    }

    public function show(Service $service): Response
    {
        return Inertia::render('services-show', [
            'service' => $service,
        ]);
    }

    public function book(Request $request): RedirectResponse
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'notes' => 'nullable|string',
        ]);

        $service = Service::findOrFail($request->service_id);
        $user = $request->user();

        $order = ServiceOrder::create([
            'tracking_number' => 'SRV-'.strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'service_id' => $service->id,
            'customer_name' => $user->name,
            'service_type' => $service->name,
            'status' => 'pending',
            'description' => $request->notes ?? 'Booking for '.$service->name,
            'estimated_completion' => now()->addDays(7), // Default estimate
        ]);

        return redirect()->route('track-order', ['number' => $order->tracking_number])
            ->with('success', 'Service booked successfully! You can track your order here.');
    }
}
