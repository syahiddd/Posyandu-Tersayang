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

    /** Contoh: "Kamis, 5 November 2026" (DESIGN Gambar 3). */
    public static function panjang(CarbonInterface|string $tanggal): string
    {
        return self::format($tanggal, 'l, j F Y');
    }

    private static function format(CarbonInterface|string $tanggal, string $pola): string
    {
        $tanggal = is_string($tanggal) ? CarbonImmutable::parse($tanggal) : $tanggal;

        return $tanggal->locale('id')->translatedFormat($pola);
    }
}
