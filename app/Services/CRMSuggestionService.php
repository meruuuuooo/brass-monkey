<?php

namespace App\Services;

use App\Models\ServiceOrder;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class CRMSuggestionService
{
    /**
     * VIP threshold: lifetime spend above this amount earns VIP status.
     */
    private const VIP_SPEND_THRESHOLD = 2000;

    /**
     * At-risk threshold: no activity for this many days.
     */
    private const AT_RISK_DAYS = 180;

    /**
     * Generate "Next Best Action" suggestions for the CRM dashboard.
     * Returns a collection of action items with type, message, and customer info.
     */
    public function getNextBestActions(int $limit = 10): Collection
    {
        $actions = collect();

        // 1. Customers who haven't ordered or booked in 6 months (retention)
        $atRiskCustomers = $this->getAtRiskCustomers(5);
        foreach ($atRiskCustomers as $customer) {
            $actions->push([
                'type' => 'retention',
                'priority' => 'high',
                'icon' => 'UserX',
                'color' => 'text-red-500',
                'bg' => 'bg-red-500/10',
                'message' => "No activity for 6+ months. Consider reaching out.",
                'customer_id' => $customer->id,
                'customer' => $customer->only(['id', 'name', 'email']),
                'action_label' => 'View Customer',
            ]);
        }

        // 2. Customers with completed service orders missing a review
        $pendingReviewOrders = $this->getCompletedOrdersWithoutReviews(5);
        foreach ($pendingReviewOrders as $order) {
            $actions->push([
                'type' => 'review_request',
                'priority' => 'medium',
                'icon' => 'Star',
                'color' => 'text-amber-500',
                'bg' => 'bg-amber-500/10',
                'message' => "Service completed but no review left. Request feedback.",
                'customer_id' => $order->user_id,
                'customer' => $order->customer ? $order->customer->only(['id', 'name', 'email']) : ['name' => $order->customer_name],
                'action_label' => 'View Service Order',
                'meta' => ['tracking_number' => $order->tracking_number],
            ]);
        }

        return $actions->take($limit)->values();
    }

    /**
     * Calculate a health score and status for a specific user.
     *
     * Returns: ['score' => int, 'status' => 'vip'|'at_risk'|'healthy', 'lifetime_value' => float]
     */
    public function getCustomerHealth(User $customer): array
    {
        $lifetimeValue = $this->getLifetimeValue($customer);
        $lastActivityDate = $this->getLastActivityDate($customer);
        $daysSinceActivity = $lastActivityDate
            ? Carbon::now()->diffInDays($lastActivityDate)
            : PHP_INT_MAX;

        if ($lifetimeValue >= self::VIP_SPEND_THRESHOLD) {
            $status = 'vip';
            $score = min(100, (int) ($lifetimeValue / self::VIP_SPEND_THRESHOLD * 80) + 20);
        } elseif ($daysSinceActivity >= self::AT_RISK_DAYS) {
            $status = 'at_risk';
            $score = max(0, 40 - ($daysSinceActivity - self::AT_RISK_DAYS));
        } else {
            $status = 'healthy';
            // Score between 40-79 based on recency and value
            $recencyScore = max(0, 40 - (int) ($daysSinceActivity / 4));
            $valueScore = min(39, (int) ($lifetimeValue / 50));
            $score = min(79, $recencyScore + $valueScore);
        }

        return [
            'score' => $score,
            'status' => $status,
            'lifetime_value' => round($lifetimeValue, 2),
            'last_activity' => $lastActivityDate?->toDateString(),
            'days_inactive' => $daysSinceActivity === PHP_INT_MAX ? null : $daysSinceActivity,
        ];
    }

    /**
     * Generate upsell/cross-sell product or service recommendations for a customer.
     * Returns a list of service suggestions with rationale.
     */
    public function getUpsellRecommendations(User $customer): array
    {
        $recommendations = [];

        // Load service order history
        $customer->loadMissing('serviceOrders.service');
        $bookedServiceIds = $customer->serviceOrders->pluck('service_id')->unique()->values();

        // Load all available services (avoiding circular import, use service model directly)
        $allServices = \App\Models\Service::all(['id', 'name', 'description', 'price']);

        foreach ($allServices as $service) {
            if ($bookedServiceIds->contains($service->id)) {
                continue; // already used this service
            }
            $recommendations[] = [
                'service_id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'reason' => 'Service not yet tried — recommend based on vehicle history.',
            ];
        }

        return array_slice($recommendations, 0, 3);
    }

    /**
     * Get segment suggestions: customers who met criteria for a "Premium" segment
     * but are not in it yet.
     */
    public function getSegmentSuggestions(): Collection
    {
        $premiumSegment = \App\Models\CustomerSegment::where('slug', 'premium')->first();
        if (!$premiumSegment) {
            return collect();
        }

        $existingPremiumIds = $premiumSegment->customers()->pluck('users.id');

        $candidates = User::role('Client')
            ->whereNotIn('id', $existingPremiumIds)
            ->with('orders.transactions')
            ->get()
            ->filter(function (User $user) {
                return $this->getLifetimeValue($user) >= self::VIP_SPEND_THRESHOLD;
            })
            ->map(fn(User $user) => [
                'customer_id' => $user->id,
                'customer_name' => $user->name,
                'lifetime_value' => round($this->getLifetimeValue($user), 2),
                'segment_id' => $premiumSegment->id,
                'segment_name' => $premiumSegment->name,
            ])
            ->values();

        return $candidates;
    }

    // -------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------

    private function getAtRiskCustomers(int $limit): Collection
    {
        $cutoff = Carbon::now()->subDays(self::AT_RISK_DAYS);

        // Customers with 'Client' role whose last order/service-order is older than cutoff
        $activeIds = collect();

        $recentOrderIds = \App\Models\Order::where('created_at', '>=', $cutoff)
            ->pluck('customer_id');
        $recentServiceIds = ServiceOrder::where('created_at', '>=', $cutoff)
            ->pluck('user_id');

        $activeIds = $recentOrderIds->merge($recentServiceIds)->unique();

        return User::role('Client')
            ->whereNotIn('id', $activeIds)
            ->where('is_active', true)
            ->limit($limit)
            ->get(['id', 'name', 'email', 'created_at']);
    }

    private function getCompletedOrdersWithoutReviews(int $limit): Collection
    {
        return ServiceOrder::with(['customer:id,name,email'])
            ->where('status', 'completed')
            ->whereDoesntHave('review')
            ->whereNotNull('user_id')
            ->latest('completed_at')
            ->limit($limit)
            ->get(['id', 'tracking_number', 'customer_name', 'user_id', 'completed_at']);
    }

    private function getLifetimeValue(User $customer): float
    {
        // Sum all transactions linked to this customer's orders
        $customer->loadMissing('orders.transactions');

        return $customer->orders->flatMap->transactions->sum(fn($t) => (float) $t->amount);
    }

    private function getLastActivityDate(User $customer): ?Carbon
    {
        $customer->loadMissing('orders', 'serviceOrders');

        $lastOrder = $customer->orders->max('created_at');
        $lastServiceOrder = $customer->serviceOrders->max('created_at');

        $dates = collect([$lastOrder, $lastServiceOrder])->filter();

        if ($dates->isEmpty()) {
            return null;
        }

        return Carbon::parse($dates->max());
    }
}
