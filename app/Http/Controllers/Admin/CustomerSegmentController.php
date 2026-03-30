<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerSegment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSegmentController extends Controller
{
    public function index(): Response
    {
        $segments = CustomerSegment::withCount('customers')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/customer-segments/index', [
            'segments' => $segments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:customer_segments,name',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        CustomerSegment::create($validated);

        return redirect()->route('admin.customer-segments.index')
            ->with('success', 'Segment created successfully.');
    }

    public function update(Request $request, CustomerSegment $customerSegment): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:customer_segments,name,' . $customerSegment->id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $customerSegment->update($validated);

        return redirect()->route('admin.customer-segments.index')
            ->with('success', 'Segment updated successfully.');
    }

    public function destroy(CustomerSegment $customerSegment): RedirectResponse
    {
        $customerSegment->delete();

        return redirect()->route('admin.customer-segments.index')
            ->with('success', 'Segment deleted successfully.');
    }
}
