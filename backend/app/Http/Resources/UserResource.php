<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Services\PointService;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $summary = app(PointService::class)->summary($this->resource);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'email_verified' => $this->hasVerifiedEmail(),
            'onboarded' => $this->onboarded_at !== null,
            'education_level' => $this->education_level,
            'institution' => $this->institution,
            'avatar_url' => $this->avatar_path ? route('avatars.show', $this->avatar_path) : null,
            'daily_goal_minutes' => $this->daily_goal_minutes,
            'privacy_show_progress' => $this->privacy_show_progress,
            'calendar_sync' => $this->calendar_sync,
            'notification_prefs' => $this->notification_prefs ?? [],
            'quiet_hours' => $this->quiet_hours,
            'points' => $summary['points'],
            'level' => $summary['level'],
            'level_floor' => $summary['current_floor'],
            'next_level_at' => $summary['next_level_at'],
            'streak' => app(StreakService::class)->effective($this->resource),
            'best_streak' => $this->best_streak,
        ];
    }
}
