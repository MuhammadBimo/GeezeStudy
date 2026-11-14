<?php

namespace App\Models;

use App\Models\Concerns\StoresInAppTimezone;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'period', 'unit', 'target', 'progress', 'deadline'])]
class Goal extends Model
{
    use StoresInAppTimezone;

    protected function casts(): array
    {
        return ['deadline' => 'date', 'completed_at' => 'datetime'];
    }
}
