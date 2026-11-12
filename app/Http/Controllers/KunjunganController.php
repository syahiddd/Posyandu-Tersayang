<?php

namespace App\Http\Controllers;

use App\Antrean\LayananAntrean;
use App\Antrean\PanelAntrean;
use App\Antrean\TampilanKunjungan;
use App\Enums\Meja;
use App\Models\Kunjungan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Layar kerja satu anak di meja yang sedang ia tempati (S09 sampai S12).
 */
class KunjunganController extends Controller
{
    public function __construct(private LayananAntrean $antrean) {}

    public function layar(Request $request, Kunjungan $kunjungan): Response|RedirectResponse
    {
        if (! $kunjungan->tanggal->isToday() || ! $this->antrean->dipegangOleh($kunjungan, $request->user())) {
            return redirect()->route('meja', $kunjungan->meja_saat_ini->value)
                ->withErrors(['kunjungan' => 'Anak ini tidak sedang Anda layani. Buka lagi dari antrean.']);
        }

        $kunjungan->load(['anak', 'pengukuran', 'pendataan', 'penyuluhan']);

        // Kolom antrean di samping layar anak pada tablet/desktop (DESIGN bab 9).
        $panel = [
            'antreanMeja' => PanelAntrean::props($kunjungan->meja_saat_ini, $request->user()),
            'kunjunganAktif' => $kunjungan->id,
        ];

        return match ($kunjungan->meja_saat_ini) {
            Meja::Pengukuran => Inertia::render('kunjungan/pengukuran', [...PengukuranController::props($kunjungan), ...$panel]),
            Meja::Pendataan => Inertia::render('kunjungan/pendataan', [...PendataanController::props($kunjungan), ...$panel]),
            Meja::Pelayanan => Inertia::render('kunjungan/pelayanan', [...PelayananController::props($kunjungan), ...$panel]),
            Meja::Penyuluhan => Inertia::render('kunjungan/penyuluhan', [...PenyuluhanController::props($kunjungan), ...$panel]),
            default => Inertia::render('kunjungan/layar-sementara', [
                'anak' => TampilanKunjungan::header($kunjungan),
                'tahap' => $kunjungan->meja_saat_ini->tahap(),
                ...$panel,
            ]),
        };
    }
}
