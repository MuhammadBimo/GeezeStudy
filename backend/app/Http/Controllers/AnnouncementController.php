<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/**
 * Pengumuman sistem dari Admin (pemeliharaan, gangguan, fitur baru). Mekanismenya terpisah dari
 * notifikasi aktivitas: pengguna menutup banner (disimpan di announcement_dismissals), dan semua
 * pengumuman tetap bisa dibaca di riwayat.
 */
class AnnouncementController extends Controller
{
    /** Riwayat semua pengumuman yang sudah terbit, terbaru dulu, beserta tanda apakah sudah ditutup. */
    public function index(Request $request): JsonResponse
    {
        $dismissed = DB::table('announcement_dismissals')->where('user_id', $request->user()->id)->pluck('announcement_id')->flip();

        $page = Announcement::whereNotNull('published_at')->where('published_at', '<=', now())
            ->latest('published_at')->latest('id')
            ->paginate(15, ['id', 'title', 'body', 'published_at']);

        $page->getCollection()->transform(fn ($a) => $a->setAttribute('dismissed', $dismissed->has($a->id)));

        return response()->json($page);
    }

    /** Tutup banner pengumuman untuk pengguna ini; tidak muncul lagi di Beranda. */
    public function dismiss(Request $request, int $announcement): Response
    {
        $model = Announcement::whereNotNull('published_at')->findOrFail($announcement);
        DB::table('announcement_dismissals')->insertOrIgnore(['user_id' => $request->user()->id, 'announcement_id' => $model->id, 'dismissed_at' => now()]);

        return response()->noContent();
    }

    /** Pengumuman untuk banner Beranda: yang belum ditutup, terbaru dulu (yang lama tidak tertimpa, hanya bergeser). */
    public static function activeFor(int $userId, int $limit = 3)
    {
        return Announcement::whereNotNull('published_at')->where('published_at', '<=', now())
            ->whereNotExists(fn ($q) => $q->from('announcement_dismissals')
                ->whereColumn('announcement_dismissals.announcement_id', 'announcements.id')
                ->where('announcement_dismissals.user_id', $userId))
            ->latest('published_at')->latest('id')->limit($limit)
            ->get(['id', 'title', 'body', 'published_at']);
    }
}
