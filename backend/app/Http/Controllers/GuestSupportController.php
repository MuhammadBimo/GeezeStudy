<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupportTicketRequest;
use App\Services\SupportDesk;
use Illuminate\Http\JsonResponse;

/**
 * Bantuan untuk orang yang belum bisa masuk (lupa email, akun tidak bisa diakses).
 * Tidak mengembalikan data akun apa pun; balasan Admin dikirim ke email kontak.
 */
class GuestSupportController extends Controller
{
    public function store(StoreSupportTicketRequest $request, SupportDesk $desk): JsonResponse
    {
        $ticket = $desk->create($request->ticketData(), null, $request->file('attachment'));

        return response()->json([
            'code' => $ticket->code,
            'message' => 'Permintaan terkirim. Balasan akan dikirim ke email kontak yang kamu isi.',
        ], 201);
    }
}
