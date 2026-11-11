<?php

namespace App\Rekap;

use App\Models\Anak;
use App\Support\Umur;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

/**
 * Balita sasaran rekap: anak terdaftar (tidak terhapus) berumur 0–59 bulan
 * penuh pada tanggal tertentu. Dipakai sebagai baris Rekap Imunisasi
 * (FR-55) dan huruf S pada SKDN (FR-61; keputusan pemilik produk).
 */
final class Balita
{
    /**
     * Umur 0–59 bulan ⇔ lahir paling lambat pada tanggal itu dan sesudah
     * tanggal itu dikurangi 60 bulan, sama dengan Umur::bulanPenuh.
     *
     * @return Builder<Anak>
     */
    public static function pada(CarbonInterface $pada): Builder
    {
        $pada = $pada->toImmutable()->startOfDay();

        return Anak::query()
            ->whereDate('tanggal_lahir', '<=', $pada->toDateString())
            ->whereDate('tanggal_lahir', '>', $pada->subMonthsNoOverflow(Umur::MAKS_BULAN)->toDateString());
    }
}
