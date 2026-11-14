<?php

namespace App\Http\Controllers;

use App\Kia\PanduanKia;
use App\Models\Anak;
use App\Support\Umur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Panduan KIA: materi edukasi dari Buku KIA 2024 yang dapat dibaca kader
 * bersama ibu, disaring menurut umur anak. Isi seluruhnya berasal dari
 * config/kia.php (hlm. 38–87, 122–125) dan tidak menambah anjuran di luar
 * buku.
 *
 * Halaman ini bersifat rujukan, bukan diagnosis: kader tetap merujuk ke
 * tenaga kesehatan untuk konfirmasi (PRD 5.8).
 */
class PanduanKiaController extends Controller
{
    public function index(Request $request): Response
    {
        // Umur dipilih kader lewat chip kelompok umur; bawaan 0–2 tahun.
        $umur = $request->integer('umur', 0);
        $umur = max(0, min($umur, Umur::MAKS_BULAN));

        return Inertia::render('panduan-kia/index', [
            'umurBulan' => $umur,
            'panduan' => PanduanKia::halaman($umur),
            'kelompokUmur' => collect((array) config('kia.anjuran_umur'))
                ->map(fn (array $satu) => [
                    'dari' => $satu['dari'],
                    'label' => $satu['label'],
                ])
                ->values(),
        ]);
    }
}
