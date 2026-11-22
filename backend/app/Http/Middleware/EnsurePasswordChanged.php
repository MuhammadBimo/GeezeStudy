<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Dipakai sebagai `password.changed`. Selama pengguna masih memakai password sementara dari Admin,
 * fitur aplikasi ditolak; yang boleh hanya melihat akun, mengganti password, dan keluar.
 */
class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->must_change_password) {
            return response()->json([
                'message' => 'Buat password baru terlebih dahulu. Password sementara dari Admin hanya untuk masuk.',
                'code' => 'password_change_required',
            ], 403);
        }

        return $next($request);
    }
}
