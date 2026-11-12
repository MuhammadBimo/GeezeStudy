<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:80'],
            'status' => ['nullable', 'in:active,suspended'],
            'role' => ['nullable', 'in:student,admin'],
        ]);

        $users = User::query()
            ->when($request->query('q'), fn ($q, $term) => $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")))
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('role'), fn ($q, $r) => $q->where('role', $r))
            ->orderBy('id')
            ->paginate(25, ['id', 'name', 'email', 'role', 'status', 'education_level', 'level', 'points', 'created_at']);

        return response()->json($users);
    }

    /** Kirim tautan reset password ke pengguna. Admin tidak pernah melihat atau mengatur password. */
    public function sendReset(Request $request, User $user): JsonResponse
    {
        Password::sendResetLink(['email' => $user->email]);
        AuditLog::record($request->user(), "Mengirim tautan reset password ke {$user->name}", ['user_id' => $user->id]);

        return response()->json(['message' => 'Tautan reset dikirim.']);
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
