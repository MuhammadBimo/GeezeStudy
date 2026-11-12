<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class StreakService
{
    /** Catat aktivitas nyata pada hari ini (tugas selesai atau sesi belajar). */
    public function touch(User $user, ?Carbon $day = null): void
    {
        $today = ($day ?? now())->copy()->startOfDay();
        $last = $user->last_active_on?->copy()->startOfDay();

        if ($last && $last->equalTo($today)) {
            return;
        }

        $user->current_streak = ($last && $last->copy()->addDay()->equalTo($today)) ? $user->current_streak + 1 : 1;
        $user->best_streak = max($user->best_streak, $user->current_streak);
        $user->last_active_on = $today;
        $user->save();
    }

    /** Streak yang ditampilkan: jika kemarin pun tidak aktif, streak sudah putus. */
    public function effective(User $user): int
    {
        $last = $user->last_active_on?->copy()->startOfDay();
        if (! $last || $last->lt(now()->startOfDay()->subDay())) {
            return 0;
        }

        return $user->current_streak;
    }
}
