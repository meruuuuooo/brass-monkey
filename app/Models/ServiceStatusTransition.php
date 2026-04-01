<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceStatusTransition extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_status',
        'to_status',
        'allowed_role',
    ];
}
