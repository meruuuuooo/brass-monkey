<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class CustomerSegment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
    ];

    protected static function booted(): void
    {
        static::creating(function (CustomerSegment $segment) {
            if (empty($segment->slug)) {
                $segment->slug = Str::slug($segment->name);
            }
        });

        static::updating(function (CustomerSegment $segment) {
            if ($segment->isDirty('name')) {
                $segment->slug = Str::slug($segment->name);
            }
        });
    }

    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'customer_segment_user')
            ->withTimestamps();
    }
}
