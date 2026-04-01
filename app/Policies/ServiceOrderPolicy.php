<?php

namespace App\Policies;

use App\Models\ServiceOrder;
use App\Models\User;
use App\Services\ServiceOrderWorkflow;

class ServiceOrderPolicy
{
    public function transition(User $user, ServiceOrder $order, string $toStatus): bool
    {
        return app(ServiceOrderWorkflow::class)->canTransition($user, $order, $toStatus);
    }
}
