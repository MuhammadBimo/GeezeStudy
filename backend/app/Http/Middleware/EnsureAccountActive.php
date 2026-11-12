<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Akun yang ditangguhkan Admin langsung kehilangan akses walau sesinya masih hidup. */
class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_if($request->user() && ! $request->user()->isActive(), 403, 'Akun ini sedang ditangguhkan.');

        return $next($request);
    }
}
