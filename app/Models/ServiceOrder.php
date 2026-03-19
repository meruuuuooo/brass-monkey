<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    protected function casts(): array
    {
        return [
            'estimated_completion' => 'date',
        ];
    }
}
