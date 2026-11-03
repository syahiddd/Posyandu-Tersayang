<?php

namespace App\Support;

use App\Enums\Meja;
use Illuminate\Http\Request;

/**
 * Meja yang dipegang kader hari ini (FR-03). Disimpan di sesi; meja terakhir
 * juga diingat di cookie perangkat agar terpilih otomatis (DESIGN Tabel 23).
 */
final class MejaAktif
{
    public const KUNCI_SESI = 'meja_aktif';

    public const COOKIE_TERAKHIR = 'meja_terakhir';

    /** Satu tahun, dalam menit. */
    public const UMUR_COOKIE = 60 * 24 * 365;

    public static function dari(Request $request): ?Meja
    {
        return Meja::tryFrom((int) $request->session()->get(self::KUNCI_SESI));
    }

    public static function terakhirDipakai(Request $request): ?Meja
    {
        return Meja::tryFrom((int) $request->cookie(self::COOKIE_TERAKHIR));
    }
}
