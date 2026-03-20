<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdvertisementController extends Controller
{
    /**
     * Display a listing of advertisements.
     */
    public function index(): Response
    {
        $advertisements = Advertisement::orderBy('priority', 'desc')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/advertisements/index', [
            'advertisements' => $advertisements,
        ]);
    }

    /**
     * Store a newly created advertisement.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'link_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('advertisements', 'public');
        }

        Advertisement::create($validated);

        return redirect()->route('admin.advertisements.index')
            ->with('success', 'Advertisement created successfully.');
    }

    /**
     * Update the specified advertisement.
     */
    public function update(Request $request, Advertisement $advertisement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'link_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            if ($advertisement->image_path) {
                Storage::disk('public')->delete($advertisement->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('advertisements', 'public');
        }

        $advertisement->update($validated);

        return redirect()->route('admin.advertisements.index')
            ->with('success', 'Advertisement updated successfully.');
    }

    /**
     * Remove the specified advertisement.
     */
    public function destroy(Advertisement $advertisement): RedirectResponse
    {
        $advertisement->delete();

        return redirect()->route('admin.advertisements.index')
            ->with('success', 'Advertisement deleted successfully.');
    }
}
