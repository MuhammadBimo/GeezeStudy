<?php

namespace App\Services;

use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Aturan Helpdesk di satu tempat: membuat laporan, membalas, mengubah status, dan memberi tahu pelapor. */
class SupportDesk
{
    public const DIR = 'support-attachments';

    public const STATUS_LABELS = [
        'pending' => 'Pending',
        'in_progress' => 'In Progress',
        'waiting_user' => 'Waiting for User',
        'resolved' => 'Resolved',
        'closed' => 'Closed',
    ];

    public function create(array $data, ?User $user, ?UploadedFile $file = null): SupportTicket
    {
        $ticket = DB::transaction(function () use ($data, $user, $file) {
            $ticket = SupportTicket::create([
                'user_id' => $user?->id,
                'requester_name' => $data['requester_name'],
                'contact_email' => $data['contact_email'],
                'category' => $data['category'],
                'subject' => $data['subject'],
                'meta' => $data['meta'] ?? null,
                'status' => 'pending',
                'last_activity_at' => now(),
                ...($file ? $this->storeFile($file) : []),
            ]);
            $ticket->forceFill(['code' => 'HD-'.str_pad((string) $ticket->id, 5, '0', STR_PAD_LEFT)])->save();

            $this->message($ticket, $user, $data['description'], false);

            return $ticket;
        });

        $this->notify($ticket, 'Laporanmu sudah kami terima', "Nomor laporan {$ticket->code}: {$ticket->subject}. Kami akan membalas secepatnya.");
        $this->mail($ticket, "Laporan {$ticket->code} diterima", "Halo {$ticket->requester_name},\n\nLaporanmu \"{$ticket->subject}\" sudah kami terima dengan nomor laporan {$ticket->code}.\nBalasan dari tim GeezeStudy akan dikirim ke email ini.\n\nJangan kirim password kepada siapa pun, termasuk tim GeezeStudy.");

        return $ticket;
    }

    public function message(SupportTicket $ticket, ?User $author, string $body, bool $staff, string $kind = 'reply'): SupportMessage
    {
        $message = $ticket->messages()->create([
            'user_id' => $author?->id,
            'kind' => $kind,
            'is_staff' => $staff,
            'body' => $body,
        ]);
        $ticket->forceFill(['last_activity_at' => now()])->save();

        return $message;
    }

    /**
     * Mengubah status dan mencatatnya di riwayat. Mengembalikan true bila status memang berubah.
     * Resolved dan Closed digabung: menyelesaikan laporan berarti menutupnya, dan laporan yang ditutup terkunci.
     */
    public function setStatus(SupportTicket $ticket, string $status, User $actor, bool $notify = true): bool
    {
        if ($status === 'resolved') {
            $status = 'closed';
        }

        if ($ticket->status === $status) {
            return false;
        }

        $closing = $status === 'closed';
        $ticket->forceFill(['status' => $status, 'resolved_at' => $closing ? now() : null])->save();

        $this->message($ticket, $actor, $closing
            ? 'Laporan ditutup. Percakapan sekarang hanya bisa dibaca.'
            : 'Status diubah menjadi '.self::STATUS_LABELS[$status].'.', true, 'event');

        if ($notify) {
            if ($closing) {
                $this->notify($ticket, "Laporan {$ticket->code} sudah ditutup", 'Laporanmu sudah diselesaikan. Riwayat percakapan tetap bisa dilihat.');
                $this->mail($ticket, "Laporan {$ticket->code} sudah ditutup", "Laporanmu \"{$ticket->subject}\" sudah diselesaikan dan laporannya ditutup.\nMasih ada kendala? Kirim laporan baru lewat halaman Bantuan.");
            } else {
                $this->notify($ticket, "Status laporan {$ticket->code} berubah", 'Sekarang: '.self::STATUS_LABELS[$status].'.');
            }
        }

        return true;
    }

    public function notify(SupportTicket $ticket, string $title, ?string $body = null): void
    {
        $ticket->user?->appNotifications()->create(['category' => 'support', 'title' => $title, 'body' => $body, 'support_ticket_id' => $ticket->id]);
    }

    /** Pengunjung tanpa akun hanya bisa dihubungi lewat email, jadi balasan staf dikirim ke sana. Gagal kirim tidak boleh membatalkan balasan. */
    public function mail(SupportTicket $ticket, string $subject, string $text): void
    {
        if ($ticket->user_id) {
            return;
        }

        try {
            Mail::raw($text, fn ($m) => $m->to($ticket->contact_email)->subject($subject));
        } catch (\Throwable $e) {
            Log::warning('Email Helpdesk gagal dikirim', ['ticket' => $ticket->code, 'error' => $e->getMessage()]);
        }
    }

    /** @return array{attachment_name: string, attachment_path: string, attachment_size: int} */
    private function storeFile(UploadedFile $file): array
    {
        $stored = Str::random(40).'.'.($file->extension() ?: 'bin');
        Storage::disk()->putFileAs(self::DIR, $file, $stored);
        $clean = trim(preg_replace('/[\x00-\x1F\x7F\/\\:*?"<>|]+/u', '_', $file->getClientOriginalName()));

        return [
            'attachment_name' => Str::limit($clean !== '' ? $clean : 'screenshot', 160, ''),
            'attachment_path' => $stored,
            'attachment_size' => (int) $file->getSize(),
        ];
    }

    public static function maskEmail(string $email): string
    {
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');

        return Str::substr($local, 0, 2).'***@'.$domain;
    }
}
