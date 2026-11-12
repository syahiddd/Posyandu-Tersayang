<?php

namespace App\Antrean;

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Kunjungan;
use App\Models\User;

/**
 * Isi kolom antrean satu meja (S08, S13; FR-18, FR-47 sampai FR-49):
 * anak menunggu dan sedang dilayani urut waktu masuk, lalu daftar ditunda.
 * Dipakai layar antrean dan, di tablet/desktop, kolom antrean di samping
 * layar anak (DESIGN bab 9, Gambar 10).
 */
final class PanelAntrean
{
    /**
     * @return array{nomor: int, tahap: string, antrean: array<int, array<string, mixed>>, ditunda: array<int, array<string, mixed>>}
     */
    public static function props(Meja $meja, User $user): array
    {
        $kunjungan = Kunjungan::query()
            ->hariIni()
            ->where('meja_saat_ini', $meja)
            ->with(['anak', 'pembuka'])
            ->get();

        $kartu = fn (Kunjungan $k) => TampilanKunjungan::kartu($k, $user);

        return [
            'nomor' => $meja->value,
            'tahap' => $meja->tahap(),
            'antrean' => $kunjungan
                ->whereIn('status', [StatusAntrean::Menunggu, StatusAntrean::SedangDilayani])
                ->sortBy([['masuk_meja_pada', 'asc'], ['nomor_antrean', 'asc']])
                ->map($kartu)->values()->all(),
            'ditunda' => $kunjungan
                ->where('status', StatusAntrean::Ditunda)
                ->sortBy('ditunda_pada')
                ->map($kartu)->values()->all(),
        ];
    }
}
