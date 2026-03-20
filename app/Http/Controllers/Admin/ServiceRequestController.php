<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    /**
     * Display a listing of the service requests.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        
        $query = ServiceOrder::query();
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        $requests = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/service-requests/index', [
            'requests' => $requests,
            'filters' => [
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Update the specified service request status.
     */
    public function update(Request $request, ServiceOrder $service_request): RedirectResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,accepted,completed,rejected,cancelled',
        ]);

        $service_request->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Service request status updated successfully.');
    }
}
