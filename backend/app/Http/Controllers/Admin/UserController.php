<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['q' => ['nullable', 'string', 'max:80'], 'status' => ['nullable', 'in:active,suspended']]);

        $users = User::query()
            ->when($request->query('q'), fn ($q, $term) => $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")))
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderBy('id')
            ->paginate(25, ['id', 'name', 'email', 'role', 'status', 'level', 'points', 'created_at']);

        return response()->json($users);
    }

    /** Admin hanya boleh menangguhkan/mengaktifkan akun, bukan mengubah Points atau peran. */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:active,suspended']]);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['status' => 'Kamu tidak bisa mengubah status akunmu sendiri.']);
        }

        $user->forceFill($data)->save();

        if ($data['status'] === 'suspended') {
            $user->tokens()->delete();
        }

        AuditLog::record($request->user(), "Mengubah status akun {$user->name} menjadi {$data['status']}", ['user_id' => $user->id], 'warning');

        return response()->json($user->only('id', 'name', 'email', 'role', 'status'));
    }
}
