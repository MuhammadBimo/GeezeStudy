<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'label', 'points'])]
class PointRule extends Model
{
    public static function value(string $key, int $default = 0): int
    {
        return (int) (static::where('key', $key)->value('points') ?? $default);
    }
}
