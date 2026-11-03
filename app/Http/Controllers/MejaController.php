<?php

namespace App\Http\Controllers;

use App\Enums\Meja;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Layar meja. Meja 2–5 menampilkan antrean (S08); Meja 1 Pendaftaran tidak
 * memiliki antrean karena kunjungan langsung masuk antrean Meja 2.
 */
class MejaController extends Controller
{
    public function __invoke(
        Request $request,
        AntreanController $antrean,
        Meja1Controller $pendaftaran,
        int $nomor,
    ): Response {
        // Nomor sudah dibatasi 1–5 oleh constraint route.
        $meja = Meja::from($nomor);

        return $meja === Meja::Pendaftaran
            ? $pendaftaran->index($request)
            : $antrean->index($request, $meja);
    }
}
