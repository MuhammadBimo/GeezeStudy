<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Dibuat hanya oleh PointService, jadi tidak ada $fillable untuk input pengguna.
class PointTransaction extends Model
{
    protected $guarded = [];
}
