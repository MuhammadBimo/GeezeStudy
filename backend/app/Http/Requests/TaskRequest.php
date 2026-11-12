<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $presence = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'title' => [$presence, 'string', 'max:160'],
            'course' => ['sometimes', 'nullable', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'priority' => ['sometimes', Rule::in(Task::PRIORITIES)],
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'due_at' => ['sometimes', 'nullable', 'date'],
            'attachment_name' => ['sometimes', 'nullable', 'string', 'max:160'],
        ];
    }
}
