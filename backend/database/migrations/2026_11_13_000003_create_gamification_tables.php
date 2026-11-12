<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Aturan Points yang bisa diubah Admin (kunci: task_completed, study_per_25_min, dst).
        Schema::create('point_rules', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->unsignedInteger('points');
            $table->timestamps();
        });

        Schema::create('level_thresholds', function (Blueprint $table) {
            $table->unsignedSmallInteger('level')->primary();
            $table->unsignedInteger('points_required');
        });

        // Buku besar Points. Unik per sumber supaya Points tidak bisa diberikan dua kali.
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('points');
            $table->string('source_type', 32);
            $table->string('source_key', 64);
            $table->string('description');
            $table->timestamps();

            $table->unique(['user_id', 'source_type', 'source_key']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('type', 8);        // daily | weekly
            $table->string('metric', 24);     // tasks_completed | study_minutes
            $table->unsignedInteger('target');
            $table->unsignedInteger('reward_points');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('mission_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mission_id')->constrained()->cascadeOnDelete();
            $table->string('period_key', 16); // 2026-11-13 (harian) atau 2026-W46 (mingguan)
            $table->timestamp('claimed_at');

            $table->unique(['user_id', 'mission_id', 'period_key']);
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description');
            $table->string('metric', 24);     // tasks_completed | study_minutes | best_streak | level
            $table->unsignedInteger('threshold');
            $table->unsignedInteger('reward_points')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('unlocked_at');

            $table->unique(['user_id', 'achievement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('mission_claims');
        Schema::dropIfExists('missions');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('level_thresholds');
        Schema::dropIfExists('point_rules');
    }
};
