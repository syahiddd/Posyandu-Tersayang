<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Format tanggal bahasa Indonesia untuk tampilan.
 */
final class Tanggal
{
    /** Contoh: "8 Okt 2026" (DESIGN Gambar 4). */
    public static function singkat(CarbonInterface|string $tanggal): string
    {
        return self::format($tanggal, 'j M Y');
    }

    /** Contoh: "8 Okt" untuk nilai lalu di petunjuk isian (DESIGN Gambar 4). */
    public static function pendek(CarbonInterface|string $tanggal): string
    {
        return self::format($tanggal, 'j M');
    }

    /** Contoh: "Kamis, 5 November 2026" (DESIGN Gambar 3). */
    public static function panjang(CarbonInterface|string $tanggal): string
    {
        return self::format($tanggal, 'l, j F Y');
    }

    /** Contoh: "November 2026" untuk judul rekap bulanan. */
    public static function bulan(CarbonInterface|string $tanggal): string
    {
        return self::format($tanggal, 'F Y');
    }

    /** Contoh: 2 → "Februari" (nama bulan bahasa Indonesia). */
    public static function namaBulan(int $bulan): string
    {
        return self::format(CarbonImmutable::create(2000, $bulan, 1), 'F');
    }

    private static function format(CarbonInterface|string $tanggal, string $pola): string
    {
        $tanggal = is_string($tanggal) ? CarbonImmutable::parse($tanggal) : $tanggal;

        return $tanggal->locale('id')->translatedFormat($pola);
    }
}
