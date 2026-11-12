<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'unit', 'target', 'progress', 'deadline'])]
class Goal extends Model
{
    protected function casts(): array
    {
        return ['deadline' => 'date', 'completed_at' => 'datetime'];
    }
}
