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
    public function index(): Response
    {
        $advertisements = Advertisement::orderBy('priority', 'desc')
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('admin/advertisements/index', [
            'advertisements' => $advertisements,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:5120',
            'link_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'priority' => 'integer',
            'display_start_at' => 'nullable|date',
            'display_duration_hours' => 'nullable|integer|min:1|max:8760',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('advertisements', 'public');
        }

        unset($validated['image']);
        Advertisement::create($validated);

        return redirect()->route('admin.advertisements.index')
            ->with('success', 'Advertisement created successfully.');
    }

    public function update(Request $request, Advertisement $advertisement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:5120',
            'link_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'priority' => 'integer',
            'display_start_at' => 'nullable|date',
            'display_duration_hours' => 'nullable|integer|min:1|max:8760',
        ]);

        if ($request->hasFile('image')) {
            if ($advertisement->image_path) {
                Storage::disk('public')->delete($advertisement->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('advertisements', 'public');
        }

        unset($validated['image']);
        $advertisement->update($validated);

        return redirect()->route('admin.advertisements.index')
            ->with('success', 'Advertisement updated successfully.');
    }

    public function destroy(Advertisement $advertisement): RedirectResponse
    {
        if ($advertisement->image_path) {
            Storage::disk('public')->delete($advertisement->image_path);
        }

        $advertisement->delete();

        return redirect()->route('admin.advertisements.index')
            ->with('success', 'Advertisement deleted successfully.');
    }
}
