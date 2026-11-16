<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Hidden(['attachment_path'])]
class SupportTicket extends Model
{
    public const CATEGORIES = ['bug', 'login', 'account_recovery', 'password', 'feature', 'general', 'other'];

    /** Kategori yang boleh dikirim pengunjung yang belum masuk. */
    public const GUEST_CATEGORIES = ['login', 'account_recovery', 'password', 'general'];

    public const STATUSES = ['pending', 'in_progress', 'waiting_user', 'resolved', 'closed'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'last_activity_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportMessage::class, 'ticket_id');
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}
