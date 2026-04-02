<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ClientSuggestionService
{
    /**
     * Days of inactivity before a service is suggested again.
     */
    private const SERVICE_REMINDER_DAYS = 180; // 6 months

    // -----------------------------------------------------------------------
    // 1. Next Recommended Services (Maintenance Reminders)
    // -----------------------------------------------------------------------

    /**
     * Return services the client previously booked more than 6 months ago
     * and hasn't re-booked since, plus services never booked at all.
     *
     * @return array<int, array{service_id: int, name: string, description: string|null, price: float|null, reason: string, last_booked: string|null}>
     */
    public function getRecommendedServices(User $user, int $limit = 3): array
    {
        $user->loadMissing('serviceOrders.service');

        $cutoff = Carbon::now()->subDays(self::SERVICE_REMINDER_DAYS);

        // map service_id => last booking date
        $lastBookingByService = $user->serviceOrders
            ->whereNotNull('service_id')
            ->groupBy('service_id')
            ->map(fn($orders) => $orders->max('created_at'));

        // Services booked long ago (over 6 months)
        $dueForRebooking = $lastBookingByService
            ->filter(fn($date) => Carbon::parse($date)->lt($cutoff))
            ->keys()
            ->toArray();

        $recommendations = [];

        // Overdue rebooking services (highest priority)
        $overdue = Service::whereIn('id', $dueForRebooking)
            ->where('is_active', true)
            ->get(['id', 'name', 'description', 'price']);

        foreach ($overdue as $service) {
            $lastBooked = $lastBookingByService[$service->id] ?? null;
            $recommendations[] = [
                'service_id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => (float) $service->price,
                'reason' => "Last booked over 6 months ago — likely due for a refresh.",
                'last_booked' => $lastBooked ? Carbon::parse($lastBooked)->toDateString() : null,
                'priority' => 'high',
            ];
        }

        // Fill remaining slots with never-booked services
        if (count($recommendations) < $limit) {
            $bookedIds = $lastBookingByService->keys()->toArray();
            $neverBooked = Service::whereNotIn('id', $bookedIds)
                ->where('is_active', true)
                ->limit($limit - count($recommendations))
                ->get(['id', 'name', 'description', 'price']);

            foreach ($neverBooked as $service) {
                $recommendations[] = [
                    'service_id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => (float) $service->price,
                    'reason' => "A service you haven't tried yet — worth considering!",
                    'last_booked' => null,
                    'priority' => 'medium',
                ];
            }
        }

        return array_slice($recommendations, 0, $limit);
    }

    // -----------------------------------------------------------------------
    // 2. Action Required Nudges (Reviews & Pending Estimates)
    // -----------------------------------------------------------------------

    /**
     * Return pending actions the client still needs to take.
     *
     * @return array<int, array{type: string, message: string, action_label: string, action_url: string, service_order_id: int, tracking_number: string}>
     */
    public function getPendingActions(User $user): array
    {
        $actions = [];

        // a) Completed service orders without a review
        $unreviewedOrders = ServiceOrder::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereDoesntHave('review')
            ->latest('completed_at')
            ->limit(5)
            ->get(['id', 'tracking_number', 'service_type', 'completed_at']);

        foreach ($unreviewedOrders as $order) {
            $actions[] = [
                'type' => 'review_request',
                'icon' => 'Star',
                'color' => 'text-amber-500',
                'bg' => 'bg-amber-500/10',
                'message' => "Your service \"{$order->service_type}\" is complete. Share your experience!",
                'action_label' => 'Leave a Review',
                'action_url' => "/my-service-jobs/{$order->id}",
                'service_order_id' => $order->id,
                'tracking_number' => $order->tracking_number,
            ];
        }

        // b) Service orders awaiting client estimate approval
        $pendingEstimates = ServiceOrder::where('user_id', $user->id)
            ->where('status', 'awaiting_approval')
            ->latest()
            ->limit(5)
            ->get(['id', 'tracking_number', 'service_type', 'estimated_cost']);

        foreach ($pendingEstimates as $order) {
            $actions[] = [
                'type' => 'estimate_approval',
                'icon' => 'ClipboardCheck',
                'color' => 'text-blue-500',
                'bg' => 'bg-blue-500/10',
                'message' => "Estimate ready for \"{$order->service_type}\" — please approve to proceed.",
                'action_label' => 'Review Estimate',
                'action_url' => "/my-service-jobs/{$order->id}",
                'service_order_id' => $order->id,
                'tracking_number' => $order->tracking_number,
            ];
        }

        return $actions;
    }

    // -----------------------------------------------------------------------
    // 3. Personalized Product Recommendations
    // -----------------------------------------------------------------------

    /**
     * Recommend products based on service order history (category affinity).
     * Falls back to top-selling products if no history exists.
     *
     * @return Collection<int, Product>
     */
    public function getRecommendedProducts(User $user, int $limit = 4): Collection
    {
        $user->loadMissing('orders.items.product.category');

        // Collect category IDs the user has previously ordered
        $purchasedCategoryIds = $user->orders
            ->flatMap->items
            ->map(fn($item) => optional($item->product)->category_id)
            ->filter()
            ->unique()
            ->values();

        if ($purchasedCategoryIds->isNotEmpty()) {
            // Products in those categories they haven't ordered yet
            $purchasedProductIds = $user->orders
                ->flatMap->items
                ->pluck('product_id')
                ->unique();

            $recs = Product::available()
                ->whereIn('category_id', $purchasedCategoryIds)
                ->whereNotIn('id', $purchasedProductIds)
                ->limit($limit)
                ->get();

            if ($recs->count() >= $limit) {
                return $recs;
            }
        }

        // Fallback: popular products (most ordered overall), excluding already-bought
        $purchasedProductIds = $user->orders->flatMap->items->pluck('product_id')->unique();

        return Product::available()
            ->whereNotIn('id', $purchasedProductIds)
            ->orderByDesc('stock_quantity') // proxy for popularity/availability
            ->limit($limit)
            ->get();
    }

    // -----------------------------------------------------------------------
    // 4. Segment-Targeted Advertisements
    // -----------------------------------------------------------------------

    /**
     * Filter advertisements to show only those relevant to the user's segments.
     * Falls back to showing all active ads if no segment-specific ones exist.
     *
     * @return Collection
     */
    public function getTargetedAdvertisements(User $user, Collection $allActiveAds): Collection
    {
        $user->loadMissing('segments');
        $userSegmentIds = $user->segments->pluck('id');

        if ($userSegmentIds->isEmpty()) {
            return $allActiveAds; // no segments → show everything
        }

        // Ads with a matching segment (or no segment restriction = universal)
        $targeted = $allActiveAds->filter(function ($ad) use ($userSegmentIds) {
            // If ad has no segment restriction, always show it
            if (is_null($ad->segment_id)) {
                return true;
            }
            return $userSegmentIds->contains($ad->segment_id);
        });

        return $targeted->isNotEmpty() ? $targeted : $allActiveAds;
    }
}
