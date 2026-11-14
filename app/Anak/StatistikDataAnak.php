<?php

namespace App\Anak;

use App\Enums\JenisKelamin;
use App\Models\Anak;
use App\Models\Kunjungan;

/**
 * Ringkasan statistik seluruh anak untuk bagian atas daftar Data Anak
 * (FR-69). Angka bersifat global: tidak mengikuti pencarian dan penyaring,
 * supaya kader selalu melihat gambaran posyandu secara keseluruhan.
 */
final class StatistikDataAnak
{
    /**
     * @return array{total: int, lakiLaki: int, perempuan: int, belumDitimbangBulanIni: int}
     */
    public static function semua(): array
    {
        $perKelamin = Anak::query()
            ->selectRaw('jenis_kelamin, count(*) as jumlah')
            ->groupBy('jenis_kelamin')
            ->toBase()
            ->pluck('jumlah', 'jenis_kelamin');

        $total = (int) $perKelamin->sum();

        // Sudah ditimbang = kunjungan bulan ini yang selesai Meja 2 (FR-06).
        // Kunjungan anak yang sudah dihapus tidak ikut dihitung.
        $sudahDitimbang = Kunjungan::query()
            ->whereYear('tanggal', today()->year)
            ->whereMonth('tanggal', today()->month)
            ->whereNotNull('selesai_meja_2_pada')
            ->whereHas('anak')
            ->distinct()
            ->count('anak_id');

        return [
            'total' => $total,
            'lakiLaki' => (int) ($perKelamin[JenisKelamin::LakiLaki->value] ?? 0),
            'perempuan' => (int) ($perKelamin[JenisKelamin::Perempuan->value] ?? 0),
            'belumDitimbangBulanIni' => max(0, $total - $sudahDitimbang),
        ];
    }
}
