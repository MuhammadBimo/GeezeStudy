<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('course')->nullable();
            $table->text('description')->nullable();
            $table->string('priority', 8)->default('medium');
            $table->string('status', 16)->default('todo');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('attachment_name')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'due_at']);
        });

        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('type', 16)->default('personal');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('repeat', 8)->default('none');
            $table->unsignedSmallInteger('reminder_minutes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'starts_at']);
        });

        Schema::create('study_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('focus_minutes');
            $table->timestamp('started_at');
            $table->timestamp('ended_at');
            $table->unsignedInteger('points_awarded')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'started_at']);
        });

        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('period', 8)->default('daily'); // daily | weekly | long
            $table->string('unit', 24)->default('lainnya');
            $table->unsignedInteger('target');
            $table->unsignedInteger('progress')->default(0);
            $table->date('deadline')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
        Schema::dropIfExists('study_sessions');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('tasks');
    }
};
