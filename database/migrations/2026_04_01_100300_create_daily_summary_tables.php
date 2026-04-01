<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_sales_summaries', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedInteger('orders_count')->default(0);
            $table->decimal('gross_revenue', 14, 2)->default(0);
            $table->decimal('refunds_total', 14, 2)->default(0);
            $table->decimal('net_revenue', 14, 2)->default(0);
            $table->decimal('avg_order_value', 14, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('daily_inventory_summaries', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->decimal('total_cost_value', 14, 2)->default(0);
            $table->decimal('total_retail_value', 14, 2)->default(0);
            $table->unsignedInteger('low_stock_count')->default(0);
            $table->unsignedInteger('out_of_stock_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_inventory_summaries');
        Schema::dropIfExists('daily_sales_summaries');
    }
};
