<?php

namespace App\Anak;

use App\Models\Anak;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

/**
 * Kelompok umur penyaring Data Anak (FR-50; keputusan pemilik produk):
 * 0–5, 6–11, 12–23, 24–59 bulan, dan 60 bulan ke atas. Umur dalam bulan
 * penuh, sama dengan App\Support\Umur::bulanPenuh.
 */
enum KelompokUmur: string
{
    case Bulan0Sampai5 = '0-5';
    case Bulan6Sampai11 = '6-11';
    case Bulan12Sampai23 = '12-23';
    case Bulan24Sampai59 = '24-59';
    case Bulan60KeAtas = '60+';

    public function label(): string
    {
        return match ($this) {
            self::Bulan60KeAtas => '60 bulan ke atas',
            default => str_replace('-', '–', $this->value).' bulan',
        };
    }

    /** @return array{0: int, 1: int|null} Batas bawah dan atas umur (bulan). */
    public function batas(): array
    {
        return match ($this) {
            self::Bulan0Sampai5 => [0, 5],
            self::Bulan6Sampai11 => [6, 11],
            self::Bulan12Sampai23 => [12, 23],
            self::Bulan24Sampai59 => [24, 59],
            self::Bulan60KeAtas => [60, null],
        };
    }

    /**
     * Umur ≥ n bulan ⇔ tanggal lahir ≤ hari ini dikurangi n bulan (tanpa
     * melimpah ke bulan berikutnya), sehingga hasilnya sama dengan
     * Umur::bulanPenuh.
     *
     * @param  Builder<Anak>  $query
     * @return Builder<Anak>
     */
    public function terapkan(Builder $query, ?CarbonInterface $pada = null): Builder
    {
        $pada = ($pada ?? today())->toImmutable()->startOfDay();
        [$bawah, $atas] = $this->batas();

        $query->whereDate('tanggal_lahir', '<=', $pada->subMonthsNoOverflow($bawah)->toDateString());

        if ($atas !== null) {
            $query->whereDate('tanggal_lahir', '>', $pada->subMonthsNoOverflow($atas + 1)->toDateString());
        }

        return $query;
    }
}
