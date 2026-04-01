<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_number',
        'customer_name',
        'service_type',
        'status',
        'description',
        'estimated_completion',
        'service_id',
        'user_id',
        'assigned_to',
        'priority',
        'estimated_cost',
        'actual_cost',
        'completed_at',
        'accepted_at',
        'started_at',
        'ready_at',
        'sla_due_at',
        'escalated_at',
    ];

    protected function casts(): array
    {
        return [
            'estimated_completion' => 'date',
            'completed_at' => 'datetime',
            'accepted_at' => 'datetime',
            'started_at' => 'datetime',
            'ready_at' => 'datetime',
            'sla_due_at' => 'datetime',
            'escalated_at' => 'datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ServiceJobNote::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(ServiceReview::class);
    }
}
