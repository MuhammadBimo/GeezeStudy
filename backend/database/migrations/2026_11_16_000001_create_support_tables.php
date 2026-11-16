<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->nullable()->unique(); // HD-00012, dibuat setelah baris tersimpan
            // Null untuk permintaan dari pengunjung yang belum bisa masuk (lupa email / tidak bisa akses akun).
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('requester_name', 80);
            $table->string('contact_email', 190);
            $table->string('category', 20);
            $table->string('subject', 140);
            $table->string('status', 16)->default('pending');
            $table->json('meta')->nullable(); // data bantuan akun: NIM, jenjang, email lama
            $table->string('attachment_name')->nullable();
            $table->string('attachment_path')->nullable();
            $table->unsignedInteger('attachment_size')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'last_activity_at']);
            $table->index('user_id');
        });

        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 8)->default('reply'); // reply | event (catatan sistem: perubahan status dsb.)
            $table->boolean('is_staff')->default(false);
            $table->text('body');
            $table->timestamps();

            $table->index(['ticket_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_tickets');
    }
};
