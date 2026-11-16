<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            // Menautkan notifikasi Helpdesk ke tiketnya, supaya membuka tiket bisa menandainya terbaca.
            $table->unsignedBigInteger('support_ticket_id')->nullable()->after('dedupe_key')->index();
        });

        // Notifikasi Helpdesk yang sudah ada: kenali tiketnya dari nomor tiket (HD-00012) di judul atau isi.
        DB::table('app_notifications')->where('category', 'support')->orderBy('id')->each(function ($n) {
            if (preg_match('/HD-(\d{5})/', $n->title.' '.$n->body, $m)) {
                DB::table('app_notifications')->where('id', $n->id)->update(['support_ticket_id' => (int) $m[1]]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropIndex(['support_ticket_id']);
            $table->dropColumn('support_ticket_id');
        });
    }
};
