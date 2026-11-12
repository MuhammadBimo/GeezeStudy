<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AchievementService
{
    /** Nilai metrik pengguna, dihitung dari data nyata (bukan dari input klien). */
    public function metrics(User $user): array
    {
        return [
            'tasks_completed' => $user->tasks()->where('status', 'completed')->count(),
            'study_minutes' => (int) $user->studySessions()->sum('focus_minutes'),
            'best_streak' => $user->best_streak,
            'level' => $user->level,
        ];
    }

    /** Buka achievement yang sudah memenuhi syarat. Mengembalikan daftar yang baru terbuka. */
    public function evaluate(User $user): array
    {
        $unlocked = [];
        $metrics = $this->metrics($user);

        $owned = DB::table('user_achievements')->where('user_id', $user->id)->pluck('achievement_id')->all();

        foreach (Achievement::where('active', true)->whereNotIn('id', $owned)->get() as $achievement) {
            if (($metrics[$achievement->metric] ?? 0) < $achievement->threshold) {
                continue;
            }

            $inserted = DB::table('user_achievements')->insertOrIgnore([
                'user_id' => $user->id,
                'achievement_id' => $achievement->id,
                'unlocked_at' => now(),
            ]);

            if ($inserted) {
                $unlocked[] = $achievement;
                if ($achievement->reward_points > 0) {
                    app(PointService::class)->award(
                        $user, $achievement->reward_points, 'achievement', (string) $achievement->id,
                        "Achievement: {$achievement->title}",
                    );
                }
                $user->appNotifications()->create([
                    'category' => 'achievement',
                    'title' => "Achievement terbuka: {$achievement->title}",
                    'body' => $achievement->description,
                ]);
            }
        }

        return $unlocked;
    }
}
