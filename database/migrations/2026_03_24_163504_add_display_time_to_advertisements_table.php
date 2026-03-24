<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->timestamp('display_start_at')->nullable()->after('priority');
            $table->unsignedTinyInteger('display_duration_hours')->nullable()->after('display_start_at')
                ->comment('How many hours the ad should be visible from display_start_at. Null = always.');
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn(['display_start_at', 'display_duration_hours']);
        });
    }
};
