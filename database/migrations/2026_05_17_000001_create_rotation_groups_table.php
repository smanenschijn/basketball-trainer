<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotation_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('training_sessions')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->unsignedInteger('interval_minutes');
            $table->unsignedInteger('total_duration_minutes');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('session_exercises', function (Blueprint $table) {
            $table->foreignId('rotation_group_id')->nullable()->after('exercise_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('session_exercises', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rotation_group_id');
        });

        Schema::dropIfExists('rotation_groups');
    }
};
