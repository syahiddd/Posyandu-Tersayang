<?php

namespace App\Support;

use Carbon\CarbonInterface;

/**
 * Umur anak dalam bulan penuh dari tanggal lahir sampai tanggal kunjungan,
 * sesuai sumbu "Umur (bulan penuh)" pada grafik Buku KIA (PRD 5.6).
 */
final class Umur
{
    /** Umur maksimal saat kunjungan dibuka (PRD 7.2). */
    public const MAKS_BULAN = 60;

    public static function bulanPenuh(CarbonInterface $lahir, ?CarbonInterface $pada = null): int
    {
        $pada = ($pada ?? today())->startOfDay();
        $lahir = $lahir->startOfDay();

        if ($lahir->greaterThan($pada)) {
            return 0;
        }

        return (int) floor($lahir->diffInMonths($pada));
    }
}
