<?php

namespace App\Http\Controllers;

use App\Enums\Meja;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Layar meja. Fase 1 baru berupa halaman sementara; isi Meja 1–5
 * (PRD 4.3 sampai 4.7) dikerjakan pada fase berikutnya.
 */
class MejaController extends Controller
{
    public function __invoke(int $nomor): Response
    {
        // Nomor sudah dibatasi 1–5 oleh constraint route.
        $meja = Meja::from($nomor);

        return Inertia::render('meja', [
            'nomor' => $meja->value,
            'tahap' => $meja->tahap(),
        ]);
    }
}
