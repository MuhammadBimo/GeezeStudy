<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class TurnstileToken implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $secret = config('services.turnstile.secret');
        if (blank($secret)) {
            return;
        }

        if (! is_string($value) || trim($value) === '') {
            $fail('Selesaikan verifikasi captcha terlebih dahulu.');

            return;
        }

        $response = Http::asForm()
            ->timeout(5)
            ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secret,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

        if (! $response->successful() || ! $response->json('success')) {
            $fail('Verifikasi captcha gagal. Silakan coba lagi.');
        }
    }
}
