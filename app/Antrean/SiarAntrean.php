<?php

namespace App\Antrean;

use App\Events\AntreanBerubah;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Menyiarkan perubahan antrean setelah transaksi database selesai.
 *
 * Kegagalan siaran (misalnya server Reverb mati) hanya dicatat; data yang
 * sudah disimpan kader tidak boleh ikut gagal karenanya.
 */
final class SiarAntrean
{
    public static function kabari(int ...$meja): void
    {
        $meja = array_values(array_unique($meja));

        DB::afterCommit(function () use ($meja): void {
            try {
                broadcast(new AntreanBerubah($meja))->toOthers();
            } catch (Throwable $galat) {
                report($galat);
            }
        });
    }
}
