<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;

class GoalService
{
    public const AUTO_UNITS = ['menit', 'tugas'];

    public function isAuto(Goal $goal): bool
    {
        return in_array($goal->unit, self::AUTO_UNITS, true);
    }

    /** Goal beserta progres terkini. Untuk goal otomatis, progres dihitung server dari aktivitas nyata. */
    public function present(User $user, Goal $goal): array
    {
        $auto = $this->isAuto($goal);
        $progress = $goal->progress;

        if ($auto) {
            $from = match ($goal->period) {
                'daily' => now()->startOfDay(),
                'weekly' => now()->startOfWeek(),
                default => $goal->created_at,
            };

            $progress = $goal->unit === 'menit'
                ? (int) $user->studySessions()->where('started_at', '>=', $from)->sum('focus_minutes')
                : $user->tasks()->where('status', 'completed')->where('completed_at', '>=', $from)->count();
        }

        return [
            'id' => $goal->id,
            'title' => $goal->title,
            'period' => $goal->period,
            'unit' => $goal->unit,
            'target' => $goal->target,
            'progress' => min($progress, $goal->target),
            'auto' => $auto,
            'deadline' => $goal->deadline?->toDateString(),
        ];
    }
}
