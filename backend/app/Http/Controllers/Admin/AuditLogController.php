<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['level' => ['nullable', 'in:info,warning,error']]);

        return response()->json(
            AuditLog::with('actor:id,name')
                ->when($request->query('level'), fn ($q, $l) => $q->where('level', $l))
                ->latest('created_at')->latest('id')
                ->paginate(30),
        );
    }
}
