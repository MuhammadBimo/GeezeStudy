<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Jumlah Points yang diperoleh dari aktivitas ini (misi, achievement), agar bisa ditampilkan sebagai "+20 Points".
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->unsignedSmallInteger('points')->nullable()->after('body');
        });

        // Pengumuman yang sudah ditutup pengguna. Terpisah dari notifikasi aktivitas.
        Schema::create('announcement_dismissals', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('announcement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('dismissed_at')->useCurrent();

            $table->primary(['user_id', 'announcement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_dismissals');
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropColumn('points');
        });
    }
};
