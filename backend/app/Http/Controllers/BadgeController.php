<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Angka kecil untuk lencana di menu: hal yang belum dibuka. Murah dipanggil berkala. */
class BadgeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'notifications' => $user->appNotifications()->whereNull('read_at')->count(),
            // Student: balasan atau perubahan status laporan yang belum dibuka. Admin: laporan yang menunggu penanganan.
            // Hanya Admin: laporan Pending khusus bantuan akun (untuk submenu Account Assistance).
            'recovery' => $user->isAdmin() ? SupportTicket::where('status', 'pending')->where('category', 'account_recovery')->count() : 0,
            'helpdesk' => $user->isAdmin()
                ? SupportTicket::where('status', 'pending')->count()
                : $user->appNotifications()->whereNull('read_at')->where('category', 'support')->count(),
        ]);
    }
}
