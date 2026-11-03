<?php

namespace App\Support;

/**
 * NIK tampil tersamar di daftar dan hasil pencarian, lengkap hanya di
 * halaman detail (NFR-05). Format mengikuti mockup DESIGN: 4 digit awal,
 * 8 titik, 4 digit akhir, misalnya 1871••••••••0042.
 */
final class Nik
{
    public static function samarkan(?string $nik): ?string
    {
        if ($nik === null || strlen($nik) !== 16) {
            return $nik === null ? null : str_repeat('•', strlen($nik));
        }

        return substr($nik, 0, 4).str_repeat('•', 8).substr($nik, -4);
    }
}
