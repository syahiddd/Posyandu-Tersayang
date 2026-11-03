<?php

namespace App\Anak;

use App\Models\Anak;
use Illuminate\Database\Eloquent\Builder;

/**
 * Pencarian anak dengan nama anak, nama ibu, NIK anak, atau NIK ibu, dipakai
 * Meja 1 (FR-14) dan Data Anak (FR-50). Setiap kata harus cocok, sehingga
 * kombinasi seperti "nayla dewi" dapat dipakai.
 */
final class PencarianAnak
{
    /** Minimal huruf untuk mencari sebagian nama (PRD 4.3). */
    public const MIN_HURUF = 3;

    /** Minimal angka untuk mencari sebagian NIK. */
    public const MIN_ANGKA = 4;

    /**
     * Kata pencarian yang cukup panjang: huruf minimal 3, angka minimal 4.
     *
     * @return list<string>
     */
    public static function kata(string $cari): array
    {
        return array_values(array_filter(
            preg_split('/\s+/', trim($cari)) ?: [],
            fn (string $kata) => ctype_digit($kata)
                ? strlen($kata) >= self::MIN_ANGKA
                : mb_strlen($kata) >= self::MIN_HURUF,
        ));
    }

    /**
     * @param  Builder<Anak>  $query
     * @param  list<string>  $kata
     * @return Builder<Anak>
     */
    public static function terapkan(Builder $query, array $kata): Builder
    {
        foreach ($kata as $satu) {
            $pola = '%'.addcslashes($satu, '\%_').'%';

            $query->where(fn (Builder $q) => ctype_digit($satu)
                ? $q->where('nik', 'like', $pola)->orWhere('nik_ibu', 'like', $pola)
                : $q->where('nama', 'like', $pola)->orWhere('nama_ibu', 'like', $pola));
        }

        return $query;
    }
}
