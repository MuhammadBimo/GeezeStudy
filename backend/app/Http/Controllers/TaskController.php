<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\PointRule;
use App\Models\Task;
use App\Services\PointService;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskController extends Controller
{
    public function __construct(
        private readonly PointService $points,
        private readonly StreakService $streaks,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate(['status' => ['nullable', 'in:'.implode(',', Task::STATUSES)]]);

        $tasks = $request->user()->tasks()
            ->status($request->query('status'))
            ->orderByRaw('due_at is null')
            ->orderBy('due_at')
            ->paginate(50);

        return response()->json($tasks);
    }

    public function store(TaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->validated());

        if ($task->status === 'completed') {
            $this->onCompleted($request->user(), $task);
        }

        return response()->json($task->refresh(), 201);
    }

    public function show(Request $request, int $task): Task
    {
        return $request->user()->tasks()->findOrFail($task);
    }

    public function update(TaskRequest $request, int $task): Task
    {
        $model = $request->user()->tasks()->findOrFail($task);
        $wasCompleted = $model->status === 'completed';

        $model->fill($request->validated());

        if ($model->status === 'completed' && ! $wasCompleted) {
            $model->completed_at = now();
        } elseif ($model->status !== 'completed') {
            $model->completed_at = null;
        }
        $model->save();

        if ($model->status === 'completed' && ! $wasCompleted) {
            $this->onCompleted($request->user(), $model);
        }

        return $model->refresh();
    }

    public function destroy(Request $request, int $task): Response
    {
        $request->user()->tasks()->findOrFail($task)->delete();

        return response()->noContent();
    }

    /** Points tugas hanya diberikan sekali per tugas, jadi membuka-tutup status tidak bisa dimanfaatkan. */
    private function onCompleted($user, Task $task): void
    {
        if ($task->completed_at === null) {
            $task->forceFill(['completed_at' => now()])->save();
        }

        $this->streaks->touch($user);
        $this->points->award($user, PointRule::value('task_completed', 20), 'task', (string) $task->id, "Tugas selesai: {$task->title}");
    }
}
