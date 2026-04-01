<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_status_transitions', function (Blueprint $table) {
            $table->id();
            $table->string('from_status');
            $table->string('to_status');
            $table->string('allowed_role');
            $table->timestamps();

            $table->unique(['from_status', 'to_status', 'allowed_role'], 'service_status_transition_unique');
        });

        DB::table('service_status_transitions')->insert([
            ['from_status' => 'pending', 'to_status' => 'accepted', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'pending', 'to_status' => 'accepted', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'pending', 'to_status' => 'accepted', 'allowed_role' => 'Client', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'pending', 'to_status' => 'cancelled', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'pending', 'to_status' => 'cancelled', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'pending', 'to_status' => 'rejected', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'pending', 'to_status' => 'rejected', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'accepted', 'to_status' => 'in-progress', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'accepted', 'to_status' => 'in-progress', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'accepted', 'to_status' => 'cancelled', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'accepted', 'to_status' => 'cancelled', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'in-progress', 'to_status' => 'ready', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'in-progress', 'to_status' => 'ready', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'in-progress', 'to_status' => 'completed', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'in-progress', 'to_status' => 'completed', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'ready', 'to_status' => 'completed', 'allowed_role' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['from_status' => 'ready', 'to_status' => 'completed', 'allowed_role' => 'Manager', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('service_status_transitions');
    }
};
