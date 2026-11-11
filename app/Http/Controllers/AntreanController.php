<?php

namespace App\Http\Controllers;

use App\Antrean\LayananAntrean;
use App\Antrean\PanelAntrean;
use App\Antrean\Urungan;
use App\Enums\Meja;
use App\Models\Kunjungan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S08 Antrean Meja 2–5 dan S13 Daftar Ditunda (PRD 3.2, 3.3; FR-18,
 * FR-47 sampai FR-49).
 */
class AntreanController extends Controller
{
    /** Meja yang layarnya sudah dikerjakan; Meja 4–5 menyusul. */
    public const MEJA_TERSEDIA = [Meja::Pengukuran, Meja::Pendataan];

    public function __construct(private LayananAntrean $antrean) {}

    public function index(Request $request, Meja $meja): Response
    {
        return Inertia::render('meja/antrean', [
            'antreanMeja' => PanelAntrean::props($meja, $request->user()),
        ]);
    }

    public function buka(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        if (! in_array($kunjungan->meja_saat_ini, self::MEJA_TERSEDIA, true)) {
            throw ValidationException::withMessages(['kunjungan' => 'Layar meja ini dikerjakan pada fase berikutnya.']);
        }

        $this->antrean->buka($kunjungan, $request->user());

        return redirect()->route('kunjungan.layar', $kunjungan);
    }

    public function lepas(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        $this->antrean->lepas($kunjungan, $request->user());

        return redirect()->route('meja', $kunjungan->meja_saat_ini->value);
    }

    public function tunda(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        $data = $request->validate(['draf' => ['nullable', 'array']]);

        $sebelum = Urungan::potret($kunjungan);
        $this->antrean->tunda($kunjungan, $request->user(), $data['draf'] ?? []);
        Urungan::catat($request, $kunjungan, $sebelum);

        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} ditunda",
            'batal' => true,
        ]);

        return redirect()->route('meja', $kunjungan->meja_saat_ini->value);
    }

    public function lanjutkan(Kunjungan $kunjungan): RedirectResponse
    {
        $this->antrean->lanjutkan($kunjungan);

        Inertia::flash('toast', ['pesan' => "{$kunjungan->anak->nama} kembali ke antrean"]);

        return back();
    }

    public function urungkan(Request $request): RedirectResponse
    {
        try {
            $kunjungan = Urungan::urungkan($request);
        } catch (ValidationException $galat) {
            Inertia::flash('toast', [
                'jenis' => 'error',
                'pesan' => collect($galat->errors())->flatten()->first(),
            ]);

            return back();
        }

        Inertia::flash('toast', ['pesan' => 'Dibatalkan']);

        if ($kunjungan !== null && $this->antrean->dipegangOleh($kunjungan, $request->user())) {
            return redirect()->route('kunjungan.layar', $kunjungan);
        }

        return back();
    }
}
