<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Resolved dan Closed digabung: tiket Resolved yang sudah ada menjadi Closed. Tidak ada tiket atau pesan yang dihapus. */
    public function up(): void
    {
        DB::table('support_tickets')->where('status', 'resolved')->update([
            'status' => 'closed',
            'resolved_at' => DB::raw('COALESCE(resolved_at, updated_at)'),
        ]);
    }

    public function down(): void
    {
        // Tidak bisa dibedakan lagi mana yang dulunya Resolved; biarkan sebagai Closed.
    }
};
