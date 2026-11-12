<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['level', 'points_required'])]
class LevelThreshold extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'level';

    public $incrementing = false;
}
