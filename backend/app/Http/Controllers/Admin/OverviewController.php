<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\StudySession;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class OverviewController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $week = collect(range(6, 0))->map(fn ($d) => now()->subDays($d)->startOfDay());

        return response()->json([
            'total_users' => User::where('role', User::ROLE_STUDENT)->count(),
            'active_today' => User::where('last_active_on', today())->count(),
            'sessions_today' => StudySession::whereDate('started_at', today())->count(),
            'errors_24h' => AuditLog::where('level', 'error')->where('created_at', '>=', now()->subDay())->count(),
            'new_users_week' => $week->map(fn ($day) => User::whereBetween('created_at', [$day, $day->copy()->endOfDay()])->count())->all(),
            'recent_activity' => AuditLog::with('actor:id,name')->latest('created_at')->limit(8)->get(),
        ]);
    }
}
