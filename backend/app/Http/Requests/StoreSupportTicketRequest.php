<?php

namespace App\Http\Requests;

use App\Models\SupportTicket;
use App\Rules\TurnstileToken;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Dipakai dua pintu: Student yang sudah masuk (identitas diambil dari sesi, bukan dari form)
 * dan pengunjung yang belum bisa masuk (wajib isi nama dan email kontak, plus captcha bila aktif).
 */
class StoreSupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function isGuest(): bool
    {
        return $this->user() === null;
    }

    public function rules(): array
    {
        $recovery = $this->input('category') === 'account_recovery';

        return [
            'category' => ['required', Rule::in($this->isGuest() ? SupportTicket::GUEST_CATEGORIES : SupportTicket::CATEGORIES)],
            'subject' => ['required', 'string', 'min:4', 'max:140'],
            'description' => ['required', 'string', 'min:10', 'max:4000'],
            'contact_email' => ['required', 'email:rfc', 'max:190'],
            'requester_name' => [Rule::requiredIf($this->isGuest()), 'nullable', 'string', 'max:80'],
            // Data bantuan akun, hanya dibaca untuk kategori account_recovery.
            'nim' => ['nullable', 'string', 'max:40'],
            'education_level' => [Rule::requiredIf($recovery), 'nullable', 'in:sd,smp,sma,college'],
            'old_email' => ['nullable', 'string', 'max:190'],
            'attachment' => ['nullable', 'file', 'max:5120', 'mimes:jpg,jpeg,png,webp,pdf'],
            'turnstile_token' => [
                Rule::requiredIf(fn () => $this->isGuest() && filled(config('services.turnstile.secret'))),
                'nullable',
                'string',
                new TurnstileToken(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'turnstile_token.required' => 'Selesaikan verifikasi captcha terlebih dahulu.',
            'education_level.required' => 'Pilih jenjang pendidikan.',
            'requester_name.required' => 'Isi nama lengkapmu.',
        ];
    }

    /** Data siap simpan; nama pelapor Student selalu dari akunnya. */
    public function ticketData(): array
    {
        $user = $this->user();
        $meta = $this->input('category') === 'account_recovery'
            ? array_filter([
                'nim' => $this->input('nim'),
                'education_level' => $this->input('education_level'),
                'old_email' => $this->input('old_email'),
            ], fn ($v) => filled($v))
            : null;

        return [
            'category' => $this->input('category'),
            'subject' => trim($this->input('subject')),
            'description' => trim($this->input('description')),
            'contact_email' => strtolower(trim($this->input('contact_email'))),
            'requester_name' => $user?->name ?? trim((string) $this->input('requester_name')),
            'meta' => $meta ?: null,
        ];
    }
}
