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
    /** Meja yang memiliki layar kerja aktif. */
    public const MEJA_TERSEDIA = [
        Meja::Pengukuran,
        Meja::Pendataan,
        Meja::Pelayanan,
    ];

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

    /**
     * Kembali ke antrean tanpa menyimpan. Dengan `buka`, anak lain di meja
     * yang sama langsung dibuka (kolom antrean tablet/desktop, DESIGN bab 9).
     */
    public function lepas(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        $berikutnya = $this->berikutnya($request, $kunjungan);
        $this->antrean->lepas($kunjungan, $request->user());

        return $berikutnya
            ? $this->bukaBerikutnya($request, $berikutnya)
            : redirect()->route('meja', $kunjungan->meja_saat_ini->value);
    }

    /**
     * Menunda anak (FR-47). Dengan `buka`, anak lain di meja yang sama
     * langsung dibuka setelah kader menyetujui dialog di kolom antrean;
     * pada alur itu notifikasi tanpa Batal agar kader tidak memegang dua
     * anak sekaligus.
     */
    public function tunda(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        $data = $request->validate(['draf' => ['nullable', 'array']]);
        $berikutnya = $this->berikutnya($request, $kunjungan);

        $sebelum = Urungan::potret($kunjungan);
        $this->antrean->tunda($kunjungan, $request->user(), $data['draf'] ?? []);

        if ($berikutnya) {
            Inertia::flash('toast', ['pesan' => "{$kunjungan->anak->nama} ditunda"]);

            return $this->bukaBerikutnya($request, $berikutnya);
        }

        Urungan::catat($request, $kunjungan, $sebelum);

        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} ditunda",
            'batal' => true,
        ]);

        return redirect()->route('meja', $kunjungan->meja_saat_ini->value);
    }

    /**
     * Anak yang diminta dibuka sesudahnya: kunjungan lain hari ini di meja
     * yang sama. Diperiksa sebelum anak sekarang dilepas atau ditunda.
     */
    private function berikutnya(Request $request, Kunjungan $kunjungan): ?Kunjungan
    {
        $request->validate(['buka' => ['nullable', 'integer']]);

        if (! $request->filled('buka')) {
            return null;
        }

        $berikutnya = Kunjungan::query()->hariIni()->whereKey($request->integer('buka'))->first();

        if ($berikutnya === null || $berikutnya->is($kunjungan) || $berikutnya->meja_saat_ini !== $kunjungan->meja_saat_ini) {
            throw ValidationException::withMessages(['kunjungan' => 'Anak itu tidak ada di antrean meja ini.']);
        }

        return $berikutnya;
    }

    /** Bila anak berikutnya sudah dibuka kader lain, kader kembali ke antrean dengan pesan. */
    private function bukaBerikutnya(Request $request, Kunjungan $berikutnya): RedirectResponse
    {
        try {
            $this->antrean->buka($berikutnya, $request->user());
        } catch (ValidationException $galat) {
            return redirect()->route('meja', $berikutnya->meja_saat_ini->value)->withErrors($galat->errors());
        }

        return redirect()->route('kunjungan.layar', $berikutnya);
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
