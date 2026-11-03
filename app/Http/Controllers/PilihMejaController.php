<?php

namespace App\Http\Controllers;

use App\Enums\Meja;
use App\Support\MejaAktif;
use App\Support\RingkasanHariIni;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S02 Pilih Meja (FR-03, DESIGN Tabel 23).
 */
class PilihMejaController extends Controller
{
    public function edit(Request $request): Response
    {
        $terpilih = MejaAktif::dari($request) ?? MejaAktif::terakhirDipakai($request);

        return Inertia::render('pilih-meja', [
            'tanggal' => RingkasanHariIni::tanggalPanjang(),
            'meja' => RingkasanHariIni::antreanPerMeja(),
            'terpilih' => $terpilih?->value,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'meja' => ['required', 'integer', Rule::enum(Meja::class)],
        ]);

        $request->session()->put(MejaAktif::KUNCI_SESI, (int) $data['meja']);
        Cookie::queue(MejaAktif::COOKIE_TERAKHIR, (string) $data['meja'], MejaAktif::UMUR_COOKIE);

        return redirect()->route('beranda');
    }
}
