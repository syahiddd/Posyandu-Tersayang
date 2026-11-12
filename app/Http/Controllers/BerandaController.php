<?php

namespace App\Http\Controllers;

use App\Rekap\RekapBulanan;
use App\Support\RingkasanHariIni;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S03 Beranda (FR-06, FR-07, FR-08, DESIGN Tabel 24), termasuk kartu
 * Perhatian: jumlah anak yang perlu tindak lanjut gizi bulan ini.
 */
class BerandaController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('beranda', [
            'tanggal' => RingkasanHariIni::tanggalPanjang(),
            'ringkasan' => RingkasanHariIni::kartu(),
            'antrean' => RingkasanHariIni::antreanPerMeja(),
            'perluTindakLanjut' => (new RekapBulanan(today()))->perluTindakLanjut(),
        ]);
    }
}
