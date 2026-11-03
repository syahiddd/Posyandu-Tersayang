<?php

namespace App\Gizi;

use App\Models\Kunjungan;
use App\Models\Pengukuran;

/**
 * Pengukuran pembanding untuk sebuah kunjungan (FR-22, FR-25): pengukuran
 * terakhir sebelum kunjungan ini, termasuk data yang disalin dari Buku KIA
 * saat pendaftaran (kriteria penerimaan 4.5).
 */
final class PengukuranSebelumnya
{
    public static function untuk(Kunjungan $kunjungan): ?Pengukuran
    {
        return Pengukuran::query()
            ->where('anak_id', $kunjungan->anak_id)
            ->whereDate('tanggal_ukur', '<=', $kunjungan->tanggal)
            ->where(fn ($q) => $q->whereNull('kunjungan_id')->orWhere('kunjungan_id', '!=', $kunjungan->id))
            ->orderByDesc('tanggal_ukur')
            ->orderByDesc('id')
            ->first();
    }
}
