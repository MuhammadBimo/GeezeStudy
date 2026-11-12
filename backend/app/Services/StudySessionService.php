<?php

namespace App\Services;

use App\Models\PointRule;
use App\Models\StudySession;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class StudySessionService
{
    public function __construct(
        private readonly PointService $points,
        private readonly StreakService $streaks,
    ) {}

    /**
     * Simpan sesi belajar dan beri Points. Server memeriksa ulang semuanya:
     * durasi harus masuk akal terhadap waktu mulai/selesai, tidak boleh tumpang tindih
     * dengan sesi lain, dan Points harian dibatasi aturan Admin.
     */
    public function record(User $user, array $data): StudySession
    {
        $start = now()->parse($data['started_at']);
        $end = now()->parse($data['ended_at']);
        $elapsed = (int) floor($start->diffInSeconds($end, true) / 60);

        if ($elapsed + 1 < $data['focus_minutes']) {
            throw ValidationException::withMessages(['focus_minutes' => 'Durasi fokus lebih panjang dari waktu sesi yang tercatat.']);
        }

        $overlaps = $user->studySessions()->where('started_at', '<', $end)->where('ended_at', '>', $start)->exists();
        if ($overlaps) {
            throw ValidationException::withMessages(['started_at' => 'Sesi ini tumpang tindih dengan sesi belajar lain.']);
        }

        $session = $user->studySessions()->create($data);

        $per25 = PointRule::value('study_per_25_min', 25);
        $cap = PointRule::value('study_daily_cap', 200);
        $earnedToday = (int) $user->studySessions()->whereDate('started_at', $start->toDateString())
            ->where('id', '!=', $session->id)->sum('points_awarded');

        $points = max(0, min((int) round($data['focus_minutes'] / 25 * $per25), $cap - $earnedToday));

        if ($points > 0 && $this->points->award($user, $points, 'study_session', (string) $session->id, "Sesi belajar {$data['focus_minutes']} menit")) {
            $session->forceFill(['points_awarded' => $points])->save();
        }

        $this->streaks->touch($user, $start);

        return $session->refresh();
    }
}
