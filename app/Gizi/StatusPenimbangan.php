<?php

namespace App\Gizi;

use App\Enums\StatusNT;
use App\Models\Anak;
use App\Models\Pengukuran;
use App\Support\Tanggal;
use App\Support\Umur;
use Carbon\CarbonInterface;

/**
 * Status penimbangan KMS (PRD 5.5, FR-26).
 *
 * - N: kenaikan BB sama dengan KBM atau lebih.
 * - T: kenaikan BB kurang dari KBM.
 * - "Tidak ditimbang bulan lalu" bila tidak ada penimbangan pada bulan
 *   kalender sebelumnya; tidak dihitung sebagai N maupun T.
 *
 * Syarat "grafik BB mengikuti garis pertumbuhan" memerlukan tabel WHO dan
 * dikerjakan bersama z-score; di sini hanya pembandingan dengan KBM.
 */
final class StatusPenimbangan
{
    /** KBM dalam gram menurut umur (config/kms.php, PRD Tabel 26). */
    public static function kbmGram(int $umurBulan): ?int
    {
        /** @var list<array{dari: int, sampai: int, gram: int}> $tabel */
        $tabel = config('kms.kbm');

        foreach ($tabel as $baris) {
            if ($umurBulan >= $baris['dari'] && $umurBulan <= $baris['sampai']) {
                return $baris['gram'];
            }
        }

        return null;
    }

    /**
     * @return array{status: StatusNT|null, kenaikanGram: int|null, kbmGram: int|null, tanggalSebelumnya: string|null}
     */
    public static function hitung(
        Anak $anak,
        CarbonInterface $tanggal,
        float $bbSekarang,
        ?int $kecualiPengukuranId = null,
    ): array {
        $kbm = self::kbmGram(Umur::bulanPenuh($anak->tanggal_lahir, $tanggal));

        $bulanLalu = $tanggal->subMonthNoOverflow();
        $sebelumnya = Pengukuran::query()
            ->where('anak_id', $anak->id)
            ->whereNotNull('bb')
            ->whereBetween('tanggal_ukur', [
                $bulanLalu->startOfMonth()->toDateString(),
                $bulanLalu->endOfMonth()->toDateString(),
            ])
            ->when($kecualiPengukuranId, fn ($q) => $q->whereKeyNot($kecualiPengukuranId))
            ->orderByDesc('tanggal_ukur')
            ->orderByDesc('id')
            ->first();

        if ($sebelumnya === null || $kbm === null) {
            return [
                'status' => $sebelumnya === null ? StatusNT::TidakDitimbangBulanLalu : null,
                'kenaikanGram' => null,
                'kbmGram' => $kbm,
                'tanggalSebelumnya' => null,
            ];
        }

        $kenaikan = (int) round(($bbSekarang - (float) $sebelumnya->bb) * 1000);

        return [
            'status' => $kenaikan >= $kbm ? StatusNT::Naik : StatusNT::TidakNaik,
            'kenaikanGram' => $kenaikan,
            'kbmGram' => $kbm,
            'tanggalSebelumnya' => Tanggal::singkat($sebelumnya->tanggal_ukur),
        ];
    }
}
