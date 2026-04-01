<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->timestamp('accepted_at')->nullable()->after('completed_at');
            $table->timestamp('started_at')->nullable()->after('accepted_at');
            $table->timestamp('ready_at')->nullable()->after('started_at');
            $table->timestamp('sla_due_at')->nullable()->after('ready_at');
            $table->timestamp('escalated_at')->nullable()->after('sla_due_at');
        });
    }

    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropColumn([
                'accepted_at',
                'started_at',
                'ready_at',
                'sla_due_at',
                'escalated_at',
            ]);
        });
    }
};
