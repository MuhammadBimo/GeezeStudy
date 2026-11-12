<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Achievement;
use App\Models\Announcement;
use App\Services\AchievementService;
use App\Services\GoalService;
use App\Services\MissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgressController extends Controller
{
    /** Ringkasan untuk Dashboard dalam satu permintaan. */
    public function dashboard(Request $request, MissionService $missions, GoalService $goalService): JsonResponse
    {
        $user = $request->user();
        $weekStart = now()->startOfWeek();

        $minutesByDay = $user->studySessions()
            ->where('started_at', '>=', $weekStart)
            ->get(['started_at', 'focus_minutes'])
            ->groupBy(fn ($s) => $s->started_at->dayOfWeekIso)
            ->map->sum('focus_minutes');

        $completedDays = $user->tasks()->where('completed_at', '>=', $weekStart)->pluck('completed_at')
            ->map(fn ($d) => $d->dayOfWeekIso)->unique();
        $weekActive = collect(range(1, 7))->map(fn ($d) => isset($minutesByDay[$d]) || $completedDays->contains($d))->all();

        $unlocked = DB::table('user_achievements')->where('user_id', $user->id)->pluck('unlocked_at', 'achievement_id');
        $achievementPreview = Achievement::where('active', true)->orderBy('id')->get()
            ->sortBy(fn ($a) => isset($unlocked[$a->id]) ? 0 : 1)->take(3)->values()
            ->map(fn ($a) => ['id' => $a->id, 'title' => $a->title, 'description' => $a->description, 'unlocked' => isset($unlocked[$a->id])]);

        return response()->json([
            'user' => new UserResource($user),
            'week_active' => $weekActive,
            'achievements' => $achievementPreview,
            'open_tasks_count' => $user->tasks()->where('status', '!=', 'completed')->count(),
            'tasks_completed_today' => $user->tasks()->where('status', 'completed')->where('completed_at', '>=', now()->startOfDay())->count(),
            'study_minutes_today' => (int) $user->studySessions()->whereDate('started_at', today())->sum('focus_minutes'),
            'study_minutes_week' => collect(range(1, 7))->map(fn ($d) => (int) ($minutesByDay[$d] ?? 0))->all(),
            'open_tasks' => $user->tasks()->where('status', '!=', 'completed')->orderByRaw('due_at is null')->orderBy('due_at')->limit(6)->get(),
            'upcoming_events' => $user->calendarEvents()->where('starts_at', '>=', now())->orderBy('starts_at')->limit(5)->get(),
            'goals' => $user->goals()->orderBy('id')->get()->map(fn ($g) => $goalService->present($user, $g))
                ->filter(fn ($g) => $g['progress'] < $g['target'])->take(4)->values(),
            'daily_missions' => $missions->listFor($user, 'daily'),
            'announcements' => Announcement::whereNotNull('published_at')->where('published_at', '<=', now())->latest('published_at')->limit(3)->get(['id', 'title', 'body', 'published_at']),
        ]);
    }

    /** Halaman Progres: Points, riwayat, sesi, dan achievements beserta statusnya. */
    public function progress(Request $request, AchievementService $achievements): JsonResponse
    {
        $user = $request->user();
        $metrics = $achievements->metrics($user);
        $unlocked = DB::table('user_achievements')->where('user_id', $user->id)->pluck('unlocked_at', 'achievement_id');

        return response()->json([
            'user' => new UserResource($user),
            'total_study_minutes' => $metrics['study_minutes'],
            'tasks_completed' => $metrics['tasks_completed'],
            'points_history' => $user->pointTransactions()->latest()->limit(20)->get(['id', 'points', 'description', 'created_at']),
            'recent_sessions' => $user->studySessions()->with('task:id,title')->latest('started_at')->limit(10)->get(),
            'achievements' => Achievement::where('active', true)->orderBy('id')->get()->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'description' => $a->description,
                'reward_points' => $a->reward_points,
                'unlocked_at' => $unlocked[$a->id] ?? null,
                'progress' => min($metrics[$a->metric] ?? 0, $a->threshold),
                'threshold' => $a->threshold,
            ]),
        ]);
    }

    public function announcements(): JsonResponse
    {
        return response()->json([
            'data' => Announcement::whereNotNull('published_at')->where('published_at', '<=', now())
                ->latest('published_at')->limit(10)->get(['id', 'title', 'body', 'published_at']),
        ]);
    }
}
