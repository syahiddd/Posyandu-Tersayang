<?php

namespace App\Auth;

/**
 * Kata sandi sementara untuk akun baru dan atur ulang kata sandi (FR-02,
 * DESIGN 5.10). Dibacakan langsung kepada kader, jadi huruf yang mirip
 * (0/O, 1/l/I) tidak dipakai. Memuat huruf besar, huruf kecil, angka, dan
 * simbol agar lolos aturan kata sandi produksi (Password::defaults).
 */
final class SandiSementara
{
    public const PANJANG = 12;

    private const KELOMPOK = [
        'ABCDEFGHJKLMNPQRSTUVWXYZ',
        'abcdefghijkmnpqrstuvwxyz',
        '23456789',
        '#@%+=?',
    ];

    public static function buat(): string
    {
        $semua = implode('', self::KELOMPOK);
        $huruf = array_map(fn (string $kelompok) => self::acak($kelompok), self::KELOMPOK);

        while (count($huruf) < self::PANJANG) {
            $huruf[] = self::acak($semua);
        }

        // Fisher–Yates dengan random_int agar urutan juga acak kriptografis.
        for ($i = count($huruf) - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            [$huruf[$i], $huruf[$j]] = [$huruf[$j], $huruf[$i]];
        }

        return implode('', $huruf);
    }

    private static function acak(string $kumpulan): string
    {
        return $kumpulan[random_int(0, strlen($kumpulan) - 1)];
    }
}
