<?php

namespace App\Services;

use App\Models\LevelThreshold;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * Satu-satunya pintu untuk menambah Points. Semua aturan ada di server:
 * setiap sumber (tugas, sesi, misi, achievement) hanya bisa memberi Points sekali.
 */
class PointService
{
    public function __construct(private readonly AchievementService $achievements) {}

    /** @return bool true bila Points benar-benar diberikan, false bila sumber ini sudah pernah dihitung. */
    public function award(User $user, int $points, string $sourceType, string $sourceKey, string $description): bool
    {
        if ($points <= 0) {
            return false;
        }

        $granted = DB::transaction(function () use ($user, $points, $sourceType, $sourceKey, $description) {
            try {
                PointTransaction::create([
                    'user_id' => $user->id,
                    'points' => $points,
                    'source_type' => $sourceType,
                    'source_key' => $sourceKey,
                    'description' => $description,
                ]);
            } catch (UniqueConstraintViolationException) {
                return false;
            }

            $locked = User::whereKey($user->id)->lockForUpdate()->first();
            $locked->points += $points;
            $locked->level = $this->levelFor($locked->points);
            $locked->save();

            $user->setRawAttributes($locked->getAttributes(), true);

            return true;
        });

        if ($granted) {
            $this->achievements->evaluate($user);
        }

        return $granted;
    }

    public function levelFor(int $points): int
    {
        return (int) (LevelThreshold::where('points_required', '<=', $points)->max('level') ?? 1);
    }

    /** @return array{level:int, points:int, current_floor:int, next_level_at:int|null} */
    public function summary(User $user): array
    {
        $next = LevelThreshold::where('level', '>', $user->level)->orderBy('level')->first();
        $floor = (int) (LevelThreshold::where('level', $user->level)->value('points_required') ?? 0);

        return [
            'level' => $user->level,
            'points' => $user->points,
            'current_floor' => $floor,
            'next_level_at' => $next?->points_required,
        ];
    }
}
