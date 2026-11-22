<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Istilah "tiket" diganti "laporan". Menyamakan teks lama yang sudah tersimpan (notifikasi dan catatan sistem di percakapan). */
    public function up(): void
    {
        $swap = fn (string $col) => DB::raw("REPLACE(REPLACE({$col}, 'Tiket', 'Laporan'), 'tiket', 'laporan')");

        DB::table('app_notifications')->where('category', 'support')->update(['title' => $swap('title'), 'body' => $swap('body')]);
        DB::table('support_messages')->where('kind', 'event')->update(['body' => $swap('body')]);
    }

    public function down(): void
    {
        // Perubahan teks saja; tidak perlu dikembalikan.
    }
};
