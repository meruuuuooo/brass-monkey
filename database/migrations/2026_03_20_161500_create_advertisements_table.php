<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $content) {
            $content->id();
            $content->string('title');
            $content->text('content');
            $content->string('image_path')->nullable();
            $content->string('link_url')->nullable();
            $content->boolean('is_active')->default(true);
            $content->integer('priority')->default(0);
            $content->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
