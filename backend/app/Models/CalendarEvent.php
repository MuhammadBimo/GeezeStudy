<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'type', 'starts_at', 'ends_at', 'repeat', 'reminder'])]
class CalendarEvent extends Model
{
    public const TYPES = ['class', 'exam', 'presentation', 'deadline', 'activity'];

    public const REPEATS = ['none', 'daily', 'weekly'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'reminder' => 'boolean'];
    }
}
