<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\LevelThreshold;
use App\Models\PointRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PointSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'rules' => PointRule::orderBy('id')->get(),
            'levels' => LevelThreshold::orderBy('level')->get(),
        ]);
    }

    public function updateRules(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rules' => ['required', 'array', 'min:1'],
            'rules.*.key' => ['required', 'exists:point_rules,key'],
            'rules.*.points' => ['required', 'integer', 'between:0,1000'],
        ]);

        foreach ($data['rules'] as $rule) {
            PointRule::where('key', $rule['key'])->update(['points' => $rule['points']]);
        }
        AuditLog::record($request->user(), 'Mengubah aturan Points', ['rules' => $data['rules']]);

        return $this->show();
    }

    /** Ambang level harus dimulai dari level 1 = 0 Points dan naik terus. */
    public function updateLevels(Request $request): JsonResponse
    {
        $data = $request->validate([
            'levels' => ['required', 'array', 'min:2', 'max:50'],
            'levels.*.level' => ['required', 'integer', 'min:1', 'distinct'],
            'levels.*.points_required' => ['required', 'integer', 'min:0'],
        ]);

        $levels = collect($data['levels'])->sortBy('level')->values();

        if ($levels->first()['level'] !== 1 || $levels->first()['points_required'] !== 0) {
            throw ValidationException::withMessages(['levels' => 'Level 1 harus dimulai dari 0 Points.']);
        }
        foreach ($levels->slice(1) as $i => $row) {
            if ($row['points_required'] <= $levels[$i - 1]['points_required']) {
                throw ValidationException::withMessages(['levels' => 'Ambang Points harus naik di setiap level.']);
            }
        }

        DB::transaction(function () use ($levels) {
            LevelThreshold::query()->delete();
            $levels->each(fn ($row) => LevelThreshold::create($row));
        });
        AuditLog::record($request->user(), 'Mengubah ambang level', ['count' => $levels->count()]);

        return $this->show();
    }
}
