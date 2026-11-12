<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MissionService
{
    public function __construct(private readonly PointService $points) {}

    /** @return array{0:Carbon,1:Carbon,2:string} awal, akhir, dan kunci periode */
    public function period(Mission $mission, ?Carbon $now = null): array
    {
        $now ??= now();

        return $mission->type === 'weekly'
            ? [$now->copy()->startOfWeek(), $now->copy()->endOfWeek(), $now->format('o-\WW')]
            : [$now->copy()->startOfDay(), $now->copy()->endOfDay(), $now->format('Y-m-d')];
    }

    public function progress(User $user, Mission $mission): int
    {
        [$from, $to] = $this->period($mission);

        $value = match ($mission->metric) {
            'tasks_completed' => $user->tasks()->where('status', 'completed')->whereBetween('completed_at', [$from, $to])->count(),
            'study_minutes' => (int) $user->studySessions()->whereBetween('started_at', [$from, $to])->sum('focus_minutes'),
            default => 0,
        };

        return min($value, $mission->target);
    }

    /** Misi aktif beserta progres dan status klaim periode berjalan. */
    public function listFor(User $user, ?string $type = null): array
    {
        $missions = Mission::where('active', true)->when($type, fn ($q) => $q->where('type', $type))->orderBy('id')->get();

        $claimed = DB::table('mission_claims')->where('user_id', $user->id)->get()
            ->map(fn ($c) => $c->mission_id.'|'.$c->period_key)->flip();

        return $missions->map(function (Mission $m) use ($user, $claimed) {
            [, , $key] = $this->period($m);
            $done = $this->progress($user, $m);

            return [
                'id' => $m->id,
                'title' => $m->title,
                'description' => $m->description,
                'type' => $m->type,
                'target' => $m->target,
                'progress' => $done,
                'reward_points' => $m->reward_points,
                'claimable' => $done >= $m->target && ! $claimed->has($m->id.'|'.$key),
                'claimed' => $claimed->has($m->id.'|'.$key),
            ];
        })->all();
    }

    public function claim(User $user, Mission $mission): int
    {
        if (! $mission->active) {
            throw ValidationException::withMessages(['mission' => 'Misi ini tidak aktif.']);
        }

        [, , $key] = $this->period($mission);

        if ($this->progress($user, $mission) < $mission->target) {
            throw ValidationException::withMessages(['mission' => 'Misi belum selesai.']);
        }

        $inserted = DB::table('mission_claims')->insertOrIgnore([
            'user_id' => $user->id, 'mission_id' => $mission->id, 'period_key' => $key, 'claimed_at' => now(),
        ]);

        if (! $inserted) {
            throw ValidationException::withMessages(['mission' => 'Hadiah misi ini sudah diklaim.']);
        }

        $this->points->award($user, $mission->reward_points, 'mission', "{$mission->id}:{$key}", "Misi: {$mission->title}");

        return $mission->reward_points;
    }
}
