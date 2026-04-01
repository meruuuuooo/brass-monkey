<?php

namespace App\Services;

use App\Models\ServiceOrder;
use App\Models\ServiceStatusTransition;
use App\Models\User;

class ServiceOrderWorkflow
{
    public function canTransition(User $user, ServiceOrder $order, string $toStatus): bool
    {
        if ($order->status === $toStatus) {
            return true;
        }

        $roleNames = $user->getRoleNames()->all();

        if (in_array('Admin', $roleNames, true)) {
            return ServiceStatusTransition::query()
                ->where('from_status', $order->status)
                ->where('to_status', $toStatus)
                ->whereIn('allowed_role', ['Admin', 'Manager', 'Client'])
                ->exists();
        }

        if (in_array('Manager', $roleNames, true)) {
            return ServiceStatusTransition::query()
                ->where('from_status', $order->status)
                ->where('to_status', $toStatus)
                ->whereIn('allowed_role', ['Manager', 'Client'])
                ->exists();
        }

        if (in_array('Client', $roleNames, true) && $order->user_id === $user->id) {
            return ServiceStatusTransition::query()
                ->where('from_status', $order->status)
                ->where('to_status', $toStatus)
                ->where('allowed_role', 'Client')
                ->exists();
        }

        return false;
    }

    public function transitionPayload(ServiceOrder $order, string $toStatus): array
    {
        $payload = ['status' => $toStatus];

        if ($toStatus === 'accepted' && $order->accepted_at === null) {
            $payload['accepted_at'] = now();
        }

        if ($toStatus === 'in-progress' && $order->started_at === null) {
            $payload['started_at'] = now();
        }

        if ($toStatus === 'ready' && $order->ready_at === null) {
            $payload['ready_at'] = now();
        }

        if ($toStatus === 'completed' && $order->completed_at === null) {
            $payload['completed_at'] = now();
        }

        if ($order->sla_due_at !== null && now()->greaterThan($order->sla_due_at) && $order->escalated_at === null) {
            $payload['escalated_at'] = now();
        }

        return $payload;
    }
}
