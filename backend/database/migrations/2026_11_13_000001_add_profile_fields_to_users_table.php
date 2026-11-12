<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 16)->default('student')->after('password');
            $table->string('status', 16)->default('active')->after('role');
            $table->string('education_level', 16)->nullable()->after('status');
            $table->string('institution')->nullable()->after('education_level');
            $table->unsignedSmallInteger('daily_goal_minutes')->default(60)->after('institution');
            $table->boolean('privacy_show_progress')->default(true)->after('daily_goal_minutes');
            $table->boolean('calendar_sync')->default(false)->after('privacy_show_progress');
            $table->json('notification_prefs')->nullable()->after('calendar_sync');
            $table->json('quiet_hours')->nullable()->after('notification_prefs');
            $table->timestamp('onboarded_at')->nullable()->after('quiet_hours');

            // Statistik gamifikasi. Hanya server yang boleh mengubahnya (tidak ada di $fillable).
            $table->unsignedInteger('points')->default(0)->after('onboarded_at');
            $table->unsignedSmallInteger('level')->default(1)->after('points');
            $table->unsignedSmallInteger('current_streak')->default(0)->after('level');
            $table->unsignedSmallInteger('best_streak')->default(0)->after('current_streak');
            $table->date('last_active_on')->nullable()->after('best_streak');

            $table->index(['role', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'status']);
            $table->dropColumn([
                'role', 'status', 'education_level', 'institution', 'daily_goal_minutes',
                'privacy_show_progress', 'calendar_sync', 'notification_prefs', 'quiet_hours',
                'onboarded_at', 'points', 'level', 'current_streak', 'best_streak', 'last_active_on',
            ]);
        });
    }
};
