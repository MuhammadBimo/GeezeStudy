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

/** Helpdesk sisi Student: hanya laporan milik sendiri. */
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

        // Membuka laporan berarti notifikasi tentang laporan ini sudah dilihat.
        $request->user()->appNotifications()->whereNull('read_at')->where('support_ticket_id', $model->id)->update(['read_at' => now()]);

        return new SupportTicketResource($model->load('messages.author'));
    }

    public function reply(Request $request, int $ticket): SupportTicketResource
    {
        $model = $this->own($request, $ticket);
        $data = $request->validate(['body' => ['required', 'string', 'min:2', 'max:3000']]);

        if ($model->isClosed()) {
            throw ValidationException::withMessages(['body' => 'Laporan ini sudah ditutup dan tidak bisa dibalas lagi. Buat laporan baru jika masih ada kendala.']);
        }

        $this->desk->message($model, $request->user(), trim($data['body']), false);

        // Jawaban Student atas laporan yang menunggunya berarti laporan kembali ditangani.
        if ($model->status === 'waiting_user') {
            $model->forceFill(['status' => 'in_progress'])->save();
        }

        return new SupportTicketResource($model->load('messages.author'));
    }

    public function attachment(Request $request, int $ticket): StreamedResponse
    {
        $model = $this->own($request, $ticket);
        $stream = null;
        if ($model->attachment_path) {
            try {
                $stream = Storage::disk()->readStream(SupportDesk::DIR.'/'.$model->attachment_path);
            } catch (\Throwable) {
                $stream = null;
            }
        }
        abort_unless($stream, 404);

        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $model->attachment_name ?: $model->attachment_path, [
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function own(Request $request, int $id): SupportTicket
    {
        return $request->user()->supportTickets()->findOrFail($id);
    }
}
