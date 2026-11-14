<?php

namespace App\Models\Concerns;

use Illuminate\Support\Carbon;

/**
 * Waktu dari klien datang sebagai ISO 8601 UTC (mis. 2026-11-14T16:59:00Z).
 * Tanpa trait ini Eloquent menyimpan jamnya apa adanya tanpa konversi zona, sehingga
 * waktu bergeser 7 jam untuk WIB. Di sini setiap nilai tanggal diubah ke zona aplikasi dulu.
 */
trait StoresInAppTimezone
{
    protected function asDateTime($value): Carbon
    {
        return parent::asDateTime($value)->setTimezone(config('app.timezone'));
    }
}
