<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'description', 'metric', 'threshold', 'reward_points', 'active'])]
class Achievement extends Model
{
    public const METRICS = ['tasks_completed', 'study_minutes', 'best_streak', 'level'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
