<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\LevelThreshold;
use App\Models\Mission;
use App\Models\PointRule;
use Illuminate\Database\Seeder;

/** Data awal gamifikasi. Aman dijalankan berulang (idempotent). */
class GamificationSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['task_completed', 'Menyelesaikan tugas', 20],
            ['study_per_25_min', 'Sesi belajar per 25 menit', 25],
            ['study_daily_cap', 'Batas Points belajar per hari', 200],
        ] as [$key, $label, $points]) {
            PointRule::firstOrCreate(['key' => $key], ['label' => $label, 'points' => $points]);
        }

        foreach ([1 => 0, 2 => 100, 3 => 250, 4 => 500, 5 => 900, 6 => 1400, 7 => 2000, 8 => 2800, 9 => 3800, 10 => 5000] as $level => $required) {
            LevelThreshold::firstOrCreate(['level' => $level], ['points_required' => $required]);
        }

        foreach ([
            ['Selesaikan 2 tugas', 'daily', 'tasks_completed', 2, 20],
            ['Belajar 25 menit', 'daily', 'study_minutes', 25, 15],
            ['Capai target belajar 90 menit', 'daily', 'study_minutes', 90, 30],
            ['Selesaikan 8 tugas minggu ini', 'weekly', 'tasks_completed', 8, 80],
            ['Belajar 6 jam minggu ini', 'weekly', 'study_minutes', 360, 100],
        ] as [$title, $type, $metric, $target, $reward]) {
            Mission::firstOrCreate(['title' => $title], ['type' => $type, 'metric' => $metric, 'target' => $target, 'reward_points' => $reward]);
        }

        foreach ([
            ['Langkah Pertama', 'Selesaikan tugas pertama', 'tasks_completed', 1, 10],
            ['Pelari Tugas', 'Selesaikan 20 tugas', 'tasks_completed', 20, 50],
            ['Api Menyala', 'Streak 5 hari', 'best_streak', 5, 50],
            ['Seminggu Penuh', 'Streak 7 hari', 'best_streak', 7, 75],
            ['Fokus Penuh', 'Belajar total 10 jam', 'study_minutes', 600, 75],
            ['Level 5', 'Capai Level 5', 'level', 5, 100],
        ] as [$title, $desc, $metric, $threshold, $reward]) {
            Achievement::firstOrCreate(['title' => $title], ['description' => $desc, 'metric' => $metric, 'threshold' => $threshold, 'reward_points' => $reward]);
        }
    }
}
