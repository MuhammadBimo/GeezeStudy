<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'description', 'type', 'metric', 'target', 'reward_points', 'active'])]
class Mission extends Model
{
    public const TYPES = ['daily', 'weekly'];

    public const METRICS = ['tasks_completed', 'study_minutes'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
