<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->string('customer_name')->nullable();
            $table->string('service_type')->nullable();
            $table->string('status')->default('pending'); // pending, in-progress, completed, ready
            $table->text('description')->nullable();
            $table->date('estimated_completion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
