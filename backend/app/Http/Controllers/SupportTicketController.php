<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupportTicketRequest;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use App\Services\SupportDesk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Helpdesk sisi Student: hanya tiket milik sendiri. */
class SupportTicketController extends Controller
{
    public function __construct(private readonly SupportDesk $desk) {}

    public function index(Request $request): JsonResponse
    {
        $tickets = $request->user()->supportTickets()->latest('last_activity_at')->latest('id')->limit(100)->get();

        return response()->json(['tickets' => SupportTicketResource::collection($tickets)]);
    }

    public function store(StoreSupportTicketRequest $request): JsonResponse
    {
        $ticket = $this->desk->create($request->ticketData(), $request->user(), $request->file('attachment'));

        return (new SupportTicketResource($ticket->load('messages.author')))->response()->setStatusCode(201);
    }

    public function show(Request $request, int $ticket): SupportTicketResource
    {
        $model = $this->own($request, $ticket);

        // Membuka tiket berarti notifikasi tentang tiket ini sudah dilihat.
        $request->user()->appNotifications()->whereNull('read_at')->where('support_ticket_id', $model->id)->update(['read_at' => now()]);

        return new SupportTicketResource($model->load('messages.author'));
    }

    public function reply(Request $request, int $ticket): SupportTicketResource
    {
        $model = $this->own($request, $ticket);
        $data = $request->validate(['body' => ['required', 'string', 'min:2', 'max:3000']]);

        if ($model->isClosed()) {
            throw ValidationException::withMessages(['body' => 'Tiket ini sudah ditutup. Buat laporan baru jika masih ada kendala.']);
        }

        $this->desk->message($model, $request->user(), trim($data['body']), false);

        // Balasan Student membuka kembali tiket yang sudah selesai atau menunggu jawabannya.
        if (in_array($model->status, ['resolved', 'waiting_user'], true)) {
            $model->forceFill(['status' => $model->status === 'resolved' ? 'pending' : 'in_progress', 'resolved_at' => null])->save();
        }

        return new SupportTicketResource($model->load('messages.author'));
    }

    public function attachment(Request $request, int $ticket): StreamedResponse
    {
        $model = $this->own($request, $ticket);
        abort_unless($model->attachment_path && Storage::disk('local')->exists(SupportDesk::DIR.'/'.$model->attachment_path), 404);

        return Storage::disk('local')->download(SupportDesk::DIR.'/'.$model->attachment_path, $model->attachment_name ?: $model->attachment_path, [
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function own(Request $request, int $id): SupportTicket
    {
        return $request->user()->supportTickets()->findOrFail($id);
    }
}
