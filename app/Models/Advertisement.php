<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'image_path',
        'link_url',
        'is_active',
        'priority',
        'display_start_at',
        'display_duration_hours',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'priority' => 'integer',
            'display_start_at' => 'datetime',
            'display_duration_hours' => 'integer',
        ];
    }
}
