<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'type', 'starts_at', 'ends_at', 'repeat', 'reminder_minutes'])]
class CalendarEvent extends Model
{
    public const TYPES = ['class', 'deadline', 'exam', 'presentation', 'meeting', 'personal'];

    public const REPEATS = ['none', 'daily', 'weekly', 'monthly'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }
}
