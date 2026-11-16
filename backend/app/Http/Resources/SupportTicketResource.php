<?php

namespace App\Http\Resources;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Bentuk tiket untuk API. `staff` menambahkan data akun pelapor yang relevan bagi Admin;
 * Student tidak pernah menerimanya.
 *
 * @mixin SupportTicket
 */
class SupportTicketResource extends JsonResource
{
    public function __construct($resource, private readonly bool $staff = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'code' => $this->code,
            'category' => $this->category,
            'subject' => $this->subject,
            'status' => $this->status,
            'requester_name' => $this->requester_name,
            'contact_email' => $this->contact_email,
            'has_attachment' => $this->attachment_path !== null,
            'attachment_name' => $this->attachment_name,
            'attachment_size' => $this->attachment_size,
            'created_at' => $this->created_at,
            'last_activity_at' => $this->last_activity_at,
            'resolved_at' => $this->resolved_at,
            'is_guest' => $this->user_id === null,
        ];

        if ($this->relationLoaded('messages')) {
            $data['messages'] = $this->messages->map(fn ($m) => [
                'id' => $m->id,
                'kind' => $m->kind,
                'is_staff' => $m->is_staff,
                'author' => $m->is_staff ? 'Tim GeezeStudy' : ($m->author?->name ?? $this->requester_name),
                'body' => $m->body,
                'created_at' => $m->created_at,
            ])->all();
        }

        if ($this->staff) {
            $data['meta'] = $this->meta;
            $data['user'] = $this->user
                ? $this->user->only('id', 'name', 'email', 'role', 'status', 'education_level', 'institution', 'created_at')
                    + ['email_verified' => $this->user->hasVerifiedEmail()]
                : null;
        }

        return $data;
    }
}
