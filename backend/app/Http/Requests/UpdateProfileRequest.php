<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:80'],
            'email' => ['sometimes', 'email:rfc', 'max:190', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'education_level' => ['sometimes', 'nullable', 'in:sd,smp,sma,college'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:120'],
            'daily_goal_minutes' => ['sometimes', 'integer', 'between:10,600'],
            'privacy_show_progress' => ['sometimes', 'boolean'],
            'calendar_sync' => ['sometimes', 'boolean'],
            'notification_prefs' => ['sometimes', 'array'],
            'notification_prefs.*' => ['boolean'],
            'quiet_hours' => ['sometimes', 'nullable', 'array'],
            'quiet_hours.from' => ['required_with:quiet_hours', 'date_format:H:i'],
            'quiet_hours.to' => ['required_with:quiet_hours', 'date_format:H:i'],
        ];
    }
}
