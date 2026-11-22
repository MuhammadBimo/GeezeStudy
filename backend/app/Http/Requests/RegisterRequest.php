<?php

namespace App\Http\Requests;

use App\Rules\TurnstileToken;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email:rfc', 'max:190', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'education_level' => ['nullable', 'in:sd,smp,sma,college'],
            'institution' => ['nullable', 'string', 'max:120'],
            'turnstile_token' => [
                Rule::requiredIf(fn () => filled(config('services.turnstile.secret'))),
                'nullable',
                'string',
                new TurnstileToken,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'turnstile_token.required' => 'Selesaikan verifikasi captcha terlebih dahulu.',
        ];
    }
}
