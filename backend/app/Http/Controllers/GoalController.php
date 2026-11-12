<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->goals()->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $goal = $request->user()->goals()->create($this->rules($request, true));

        return response()->json($goal->refresh(), 201);
    }

    public function update(Request $request, int $goal): Goal
    {
        $model = $request->user()->goals()->findOrFail($goal);
        $model->fill($this->rules($request, false));

        $model->completed_at = $model->progress >= $model->target ? ($model->completed_at ?? now()) : null;
        $model->save();

        return $model;
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
            'unit' => ['sometimes', 'string', 'max:24'],
            'target' => [$presence, 'integer', 'between:1,100000'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'deadline' => ['nullable', 'date'],
        ]);
    }
}
