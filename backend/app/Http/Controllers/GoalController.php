<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Services\GoalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class GoalController extends Controller
{
    public function __construct(private readonly GoalService $goals) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => $user->goals()->orderBy('id')->get()->map(fn (Goal $g) => $this->goals->present($user, $g))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $goal = $request->user()->goals()->create($this->rules($request, true));

        return response()->json($this->goals->present($request->user(), $goal->refresh()), 201);
    }

    public function update(Request $request, int $goal): JsonResponse
    {
        $user = $request->user();
        $model = $user->goals()->findOrFail($goal);
        $data = $this->rules($request, false);

        // Goal otomatis (menit/tugas) dihitung dari data nyata, jadi progres manual diabaikan.
        if (in_array($data['unit'] ?? $model->unit, GoalService::AUTO_UNITS, true)) {
            unset($data['progress']);
        }

        $model->fill($data);
        $model->progress = min($model->progress, $model->target);
        $model->save();

        return response()->json($this->goals->present($user, $model));
    }

    public function destroy(Request $request, int $goal): Response
    {
        $request->user()->goals()->findOrFail($goal)->delete();

        return response()->noContent();
    }

    private function rules(Request $request, bool $creating): array
    {
        $presence = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'title' => [$presence, 'string', 'max:160'],
            'period' => [$presence, Rule::in(['daily', 'weekly', 'long'])],
            'unit' => [$presence, Rule::in(['menit', 'tugas', 'lainnya'])],
            'target' => [$presence, 'integer', 'between:1,100000'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'deadline' => ['nullable', 'date'],
        ]);
    }
}
