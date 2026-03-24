<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ServiceJobNote;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ServiceOrder::with(['customer:id,name,email', 'assignee:id,name', 'service:id,name'])
            ->latest();

        if ($status = $request->input('status')) {
            if ($status !== 'all')
                $query->where('status', $status);
        }
        if ($priority = $request->input('priority')) {
            if ($priority !== 'all')
                $query->where('priority', $priority);
        }
        if ($assignedTo = $request->input('assigned_to')) {
            if ($assignedTo === 'unassigned') {
                $query->whereNull('assigned_to');
            } elseif ($assignedTo !== 'all') {
                $query->where('assigned_to', $assignedTo);
            }
        }
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        $technicians = User::role(['Admin', 'Manager'])->select('id', 'name')->get();
        $services = Service::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('admin/service-requests/index', [
            'requests' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['status', 'priority', 'assigned_to', 'search']),
            'technicians' => $technicians,
            'services' => $services,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'customer_name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,normal,high,urgent',
            'description' => 'nullable|string',
            'estimated_completion' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        $trackingNumber = 'JOB-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        ServiceOrder::create([
            ...$validated,
            'tracking_number' => $trackingNumber,
            'status' => 'pending',
            'service_type' => Service::find($validated['service_id'])->name,
        ]);

        return back()->with('success', 'Service job created successfully.');
    }

    public function show(ServiceOrder $service_request): Response
    {
        $service_request->load([
            'customer:id,name,email',
            'assignee:id,name',
            'service:id,name,price',
            'notes.author:id,name'
        ]);

        $technicians = User::role(['Admin', 'Manager'])->select('id', 'name')->get();

        return Inertia::render('admin/service-requests/show', [
            'job' => $service_request,
            'technicians' => $technicians,
        ]);
    }

    public function update(Request $request, ServiceOrder $service_request): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:pending,accepted,in-progress,completed,ready,rejected,cancelled',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'estimated_cost' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && $service_request->status !== 'completed') {
            $validated['completed_at'] = now();
        }

        $service_request->update($validated);

        return back()->with('success', 'Service job updated successfully.');
    }

    public function addNote(Request $request, ServiceOrder $service_request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:note,estimate,repair_log',
            'content' => 'required|string',
        ]);

        $service_request->notes()->create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Note added successfully.');
    }
}
