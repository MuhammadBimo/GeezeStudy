<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// role, status, points, level, dan streak sengaja TIDAK di $fillable: hanya server yang boleh mengubahnya.
#[Fillable([
    'name', 'email', 'password', 'education_level', 'institution', 'daily_goal_minutes',
    'privacy_show_progress', 'calendar_sync', 'notification_prefs', 'quiet_hours',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_STUDENT = 'student';

    public const ROLE_ADMIN = 'admin';

    /** Nilai awal di level model, supaya objek baru (sebelum di-refresh) sama dengan default database. */
    protected $attributes = [
        'role' => self::ROLE_STUDENT,
        'status' => 'active',
        'daily_goal_minutes' => 60,
        'privacy_show_progress' => true,
        'calendar_sync' => false,
        'points' => 0,
        'level' => 1,
        'current_streak' => 0,
        'best_streak' => 0,
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'privacy_show_progress' => 'boolean',
            'calendar_sync' => 'boolean',
            'notification_prefs' => 'array',
            'quiet_hours' => 'array',
            'onboarded_at' => 'datetime',
            'last_active_on' => 'date',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function calendarEvents(): HasMany
    {
        return $this->hasMany(CalendarEvent::class);
    }

    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }
}
