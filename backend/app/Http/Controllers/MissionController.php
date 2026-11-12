<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Mission;
use App\Services\MissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function index(Request $request, MissionService $missions): JsonResponse
    {
        $request->validate(['type' => ['nullable', 'in:daily,weekly']]);

        return response()->json(['data' => $missions->listFor($request->user(), $request->query('type'))]);
    }

    public function claim(Request $request, Mission $mission, MissionService $missions): JsonResponse
    {
        $reward = $missions->claim($request->user(), $mission);

        return response()->json([
            'reward_points' => $reward,
            'user' => new UserResource($request->user()->refresh()),
        ]);
    }
}
