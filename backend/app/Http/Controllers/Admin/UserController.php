<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
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

    /**
     * Mengatur password SEMENTARA untuk pengguna yang tidak bisa memakai "Lupa password" (mis. email tidak bisa dibuka).
     * Pengguna wajib membuat password sendiri saat masuk, jadi Admin tidak mengetahui password akhirnya.
     */
    public function sendReset(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'must_change_password' => true,
            'remember_token' => Str::random(60),
        ])->save();

        $user->tokens()->delete();
        if (config('session.driver') === 'database') {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        AuditLog::record($request->user(), "Mengatur password sementara untuk {$user->name}", ['user_id' => $user->id], 'warning');

        return response()->json(['message' => 'Password sementara diatur. Pengguna wajib membuat password baru saat masuk.']);
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
