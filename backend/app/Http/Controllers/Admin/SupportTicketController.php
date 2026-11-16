<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupportTicketResource;
use App\Models\AuditLog;
use App\Models\SupportTicket;
use App\Models\User;
use App\Services\SupportDesk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Helpdesk sisi Admin. Rutenya dilindungi middleware role:admin di routes/api.php. */
class SupportTicketController extends Controller
{
    public function __construct(private readonly SupportDesk $desk) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => ['nullable', Rule::in(SupportTicket::CATEGORIES)],
            'status' => ['nullable', Rule::in(SupportTicket::STATUSES)],
            'q' => ['nullable', 'string', 'max:80'],
        ]);

        $tickets = SupportTicket::query()
            ->with('user:id,name,email,role,status,education_level,institution,created_at,email_verified_at')
            ->when($request->query('category'), fn ($q, $c) => $q->where('category', $c))
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('q'), function ($q, $term) {
                $like = '%'.addcslashes($term, '%_\\').'%';
                $q->where(fn ($w) => $w->where('code', 'like', $like)
                    ->orWhere('requester_name', 'like', $like)
                    ->orWhere('subject', 'like', $like)
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $like)));
            })
            ->latest('last_activity_at')->latest('id')
            ->paginate(20);

        return response()->json([
            'counts' => SupportTicket::query()->select('status', DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status'),
            'tickets' => [
                'data' => SupportTicketResource::collection($tickets->getCollection())->resolve(),
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    public function show(int $ticket): SupportTicketResource
    {
        return $this->resource(SupportTicket::findOrFail($ticket));
    }

    public function reply(Request $request, int $ticket): SupportTicketResource
    {
        $model = SupportTicket::findOrFail($ticket);
        $data = $request->validate([
            'body' => ['required', 'string', 'min:2', 'max:3000'],
            'status' => ['nullable', Rule::in(['in_progress', 'waiting_user', 'resolved', 'closed'])],
        ]);

        $this->guardOpen($model);
        $this->desk->message($model, $request->user(), trim($data['body']), true);

        // Tanpa status eksplisit, tiket yang baru dibalas berarti sedang ditangani.
        $next = $data['status'] ?? ($model->status === 'pending' ? 'in_progress' : $model->status);
        $changed = $this->desk->setStatus($model, $next, $request->user(), notify: false);

        $this->desk->notify($model, "Admin membalas tiket {$model->code}", Str::limit(trim($data['body']), 140));
        $this->desk->mail($model, "Balasan untuk tiket {$model->code}", trim($data['body'])."\n\nStatus tiket: ".SupportDesk::STATUS_LABELS[$next].".\nJangan kirim password kepada siapa pun, termasuk tim GeezeStudy.");

        if ($changed) {
            AuditLog::record($request->user(), "Membalas tiket {$model->code} dan mengubah status menjadi {$next}", ['ticket_id' => $model->id]);
        }

        return $this->resource($model);
    }

    public function updateStatus(Request $request, int $ticket): SupportTicketResource
    {
        $model = SupportTicket::findOrFail($ticket);
        $data = $request->validate(['status' => ['required', Rule::in(SupportTicket::STATUSES)]]);

        if ($this->desk->setStatus($model, $data['status'], $request->user())) {
            AuditLog::record($request->user(), "Mengubah status tiket {$model->code} menjadi {$data['status']}", ['ticket_id' => $model->id]);
            $this->desk->mail($model, "Status tiket {$model->code} berubah", 'Status tiketmu sekarang: '.SupportDesk::STATUS_LABELS[$data['status']].'.');
        }

        return $this->resource($model);
    }

    /**
     * Pulihkan akses akun: mengganti email akun dengan email kontak yang dikirim pelapor.
     * Admin harus menyatakan sudah memverifikasi kepemilikan; email baru tidak boleh bebas diisi
     * (harus sama dengan email kontak di tiket), email berstatus belum terverifikasi, dan semua sesi lama dicabut.
     * Password tidak pernah dilihat atau diubah di sini; pemilik akun mengaturnya lewat "Lupa password".
     */
    public function changeEmail(Request $request, int $ticket): SupportTicketResource
    {
        $model = SupportTicket::findOrFail($ticket);
        $data = $request->validate([
            'user_id' => ['required', 'integer'],
            'verified' => ['accepted'],
        ], ['verified.accepted' => 'Konfirmasi dulu bahwa kepemilikan akun sudah kamu verifikasi.']);

        $this->guardOpen($model);

        if ($model->category !== 'account_recovery') {
            throw ValidationException::withMessages(['user_id' => 'Perubahan email hanya untuk tiket Lupa Akun atau Email.']);
        }

        $account = User::find($data['user_id']);
        if (! $account || $account->role !== User::ROLE_STUDENT) {
            throw ValidationException::withMessages(['user_id' => 'Akun Student tidak ditemukan.']);
        }

        $newEmail = $model->contact_email;
        if (strcasecmp($account->email, $newEmail) === 0) {
            throw ValidationException::withMessages(['user_id' => 'Email akun ini sudah sama dengan email kontak.']);
        }
        if (User::where('email', $newEmail)->exists()) {
            throw ValidationException::withMessages(['user_id' => 'Email kontak itu sudah dipakai akun lain.']);
        }

        $oldEmail = $account->email;
        $account->forceFill([
            'email' => $newEmail,
            'email_verified_at' => null,
            'remember_token' => Str::random(60),
        ])->save();

        $account->tokens()->delete();
        if (config('session.driver') === 'database') {
            DB::table('sessions')->where('user_id', $account->id)->delete();
        }
        $account->sendEmailVerificationNotification();

        $model->forceFill(['user_id' => $account->id])->save();
        $this->desk->message($model, $request->user(), 'Email akun sudah diperbarui ke email kontakmu setelah kepemilikan akun diverifikasi. Tautan verifikasi dikirim ke email baru. Setelah memverifikasi, atur password barumu lewat "Lupa password" di halaman masuk.', true);
        $this->desk->setStatus($model, 'waiting_user', $request->user(), notify: false);
        $this->desk->mail($model, "Email akunmu sudah diperbarui (tiket {$model->code})", "Email akun GeezeStudy sudah diganti ke alamat ini setelah kepemilikan akun diverifikasi.\nBuka tautan verifikasi yang dikirim terpisah ke email ini, lalu atur password barumu lewat \"Lupa password\" di halaman masuk.\nJangan kirim password kepada siapa pun, termasuk tim GeezeStudy.");

        AuditLog::record($request->user(), "Mengubah email akun {$account->name} lewat tiket {$model->code}", [
            'ticket_id' => $model->id,
            'user_id' => $account->id,
            'from' => SupportDesk::maskEmail($oldEmail),
            'to' => SupportDesk::maskEmail($newEmail),
        ], 'warning');

        return $this->resource($model);
    }

    public function attachment(int $ticket): StreamedResponse
    {
        $model = SupportTicket::findOrFail($ticket);
        abort_unless($model->attachment_path && Storage::disk('local')->exists(SupportDesk::DIR.'/'.$model->attachment_path), 404);

        return Storage::disk('local')->download(SupportDesk::DIR.'/'.$model->attachment_path, $model->attachment_name ?: $model->attachment_path, [
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function guardOpen(SupportTicket $ticket): void
    {
        if ($ticket->isClosed()) {
            throw ValidationException::withMessages(['body' => 'Tiket sudah ditutup. Ubah status dulu jika perlu membukanya kembali.']);
        }
    }

    private function resource(SupportTicket $ticket): SupportTicketResource
    {
        return new SupportTicketResource($ticket->refresh()->load('messages.author', 'user'), staff: true);
    }
}
