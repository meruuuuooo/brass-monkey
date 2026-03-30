<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(): Response
    {
        $now = now();

        $advertisements = Advertisement::where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('display_start_at')
                    ->orWhere(function ($q2) use ($now) {
                        $q2->where('display_start_at', '<=', $now)
                            ->where(function ($q3) use ($now) {
                                $q3->whereNull('display_duration_hours')
                                    ->orWhereRaw(
                                        'DATE_ADD(display_start_at, INTERVAL display_duration_hours HOUR) >= ?',
                                        [$now]
                                    );
                            });
                    });
            })
            ->orderBy('priority', 'desc')
            ->latest()
            ->get();

        return Inertia::render('client/promotions', [
            'advertisements' => $advertisements,
        ]);
    }
}
