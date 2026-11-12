<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class MissionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Mission::orderBy('type')->orderBy('id')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $mission = Mission::create($this->rules($request, true));
        AuditLog::record($request->user(), "Membuat misi \"{$mission->title}\"", ['mission_id' => $mission->id]);

        return response()->json($mission->refresh(), 201);
    }

    public function update(Request $request, Mission $mission): Mission
    {
        $mission->update($this->rules($request, false));
        AuditLog::record($request->user(), "Mengubah misi \"{$mission->title}\"", ['mission_id' => $mission->id]);

        return $mission;
    }

    public function destroy(Request $request, Mission $mission): Response
    {
        AuditLog::record($request->user(), "Menghapus misi \"{$mission->title}\"", ['mission_id' => $mission->id], 'warning');
        $mission->delete();

        return response()->noContent();
    }

    private function rules(Request $request, bool $creating): array
    {
        $presence = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'title' => [$presence, 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => [$presence, Rule::in(Mission::TYPES)],
            'metric' => [$presence, Rule::in(Mission::METRICS)],
            'target' => [$presence, 'integer', 'between:1,10000'],
            'reward_points' => [$presence, 'integer', 'between:0,1000'],
            'active' => ['sometimes', 'boolean'],
        ]);
    }
}
