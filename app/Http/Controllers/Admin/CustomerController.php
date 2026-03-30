<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerNote;
use App\Models\CustomerSegment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::role('Client')
            ->with('segments:id,name,color')
            ->withCount('customerNotes');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('segment')) {
            $query->whereHas('segments', fn($q) => $q->where('customer_segments.id', $request->input('segment')));
        }

        $customers = $query->latest()->paginate(15)->withQueryString();
        $segments = CustomerSegment::orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'segments' => $segments,
            'filters' => $request->only(['search', 'segment']),
        ]);
    }

    public function show(User $customer): Response
    {
        $customer->load([
            'segments:id,name,color',
            'customerNotes.author:id,name',
            'roles',
        ]);

        $segments = CustomerSegment::orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
            'segments' => $segments,
        ]);
    }

    /**
     * Sync customer segments.
     */
    public function updateSegments(Request $request, User $customer): RedirectResponse
    {
        $validated = $request->validate([
            'segment_ids' => 'array',
            'segment_ids.*' => 'exists:customer_segments,id',
        ]);

        $customer->segments()->sync($validated['segment_ids'] ?? []);

        return back()->with('success', 'Customer segments updated.');
    }

    /**
     * Add a note to a customer.
     */
    public function addNote(Request $request, User $customer): RedirectResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        CustomerNote::create([
            'customer_id' => $customer->id,
            'author_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Note added.');
    }

    /**
     * Delete a customer note.
     */
    public function deleteNote(CustomerNote $note): RedirectResponse
    {
        $note->delete();

        return back()->with('success', 'Note deleted.');
    }
}
