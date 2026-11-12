<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class AchievementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Achievement::orderBy('id')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $achievement = Achievement::create($this->rules($request, true));
        AuditLog::record($request->user(), "Membuat achievement \"{$achievement->title}\"", ['achievement_id' => $achievement->id]);

        return response()->json($achievement->refresh(), 201);
    }

    public function update(Request $request, Achievement $achievement): Achievement
    {
        $achievement->update($this->rules($request, false));
        AuditLog::record($request->user(), "Mengubah achievement \"{$achievement->title}\"", ['achievement_id' => $achievement->id]);

        return $achievement;
    }

    public function destroy(Request $request, Achievement $achievement): Response
    {
        AuditLog::record($request->user(), "Menghapus achievement \"{$achievement->title}\"", ['achievement_id' => $achievement->id], 'warning');
        $achievement->delete();

        return response()->noContent();
    }

    private function rules(Request $request, bool $creating): array
    {
        $presence = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'title' => [$presence, 'string', 'max:120'],
            'description' => [$presence, 'string', 'max:255'],
            'metric' => [$presence, Rule::in(Achievement::METRICS)],
            'threshold' => [$presence, 'integer', 'between:1,1000000'],
            'reward_points' => ['sometimes', 'integer', 'between:0,1000'],
            'active' => ['sometimes', 'boolean'],
        ]);
    }
}
