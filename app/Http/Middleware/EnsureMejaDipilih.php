<?php

namespace App\Http\Middleware;

use App\Support\MejaAktif;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Kader memilih meja sebelum masuk Beranda dan layar lain (FR-03).
 */
class EnsureMejaDipilih
{
    public function handle(Request $request, Closure $next): Response
    {
        if (MejaAktif::dari($request) === null) {
            return redirect()->route('pilih-meja');
        }

        return $next($request);
    }
}
