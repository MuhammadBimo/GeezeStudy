<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Services\StudySessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudySessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->studySessions()->with('task:id,title')->latest('started_at')->paginate(30),
        );
    }

    public function store(Request $request, StudySessionService $service): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'task_id' => ['nullable', Rule::exists('tasks', 'id')->where('user_id', $user->id)],
            'focus_minutes' => ['required', 'integer', 'between:1,180'],
            'started_at' => ['required', 'date', 'before_or_equal:now'],
            'ended_at' => ['required', 'date', 'after:started_at', 'before_or_equal:+2 minutes'],
        ]);

        $session = $service->record($user, $data);

        return response()->json([
            'session' => $session,
            'user' => new UserResource($user->refresh()),
        ], 201);
    }
}
