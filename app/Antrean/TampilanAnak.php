<?php

namespace App\Antrean;

use App\Models\Anak;
use App\Support\Nik;
use App\Support\Tanggal;
use App\Support\Umur;
use Illuminate\Database\Eloquent\Builder;

/**
 * Ringkasan anak untuk hasil pencarian dan kartu pembanding Meja 1
 * (FR-11, FR-12, FR-15). NIK selalu tersamar (NFR-05).
 */
final class TampilanAnak
{
    /**
     * @return array<string, mixed>
     */
    public static function ringkas(Anak $anak): array
    {
        // Daftar panjang memuat keduanya lewat denganRingkasan() agar tidak N+1.
        $terakhir = array_key_exists('kunjungan_terakhir', $anak->getAttributes())
            ? $anak->getAttribute('kunjungan_terakhir')
            : $anak->kunjungan()->max('tanggal');
        $hariIni = array_key_exists('di_antrean_hari_ini', $anak->getAttributes())
            ? (bool) $anak->getAttribute('di_antrean_hari_ini')
            : $anak->kunjungan()->whereDate('tanggal', today())->exists();

        return [
            'id' => $anak->id,
            'nama' => $anak->nama,
            'jenisKelamin' => $anak->jenis_kelamin->value,
            'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir),
            'tanggalLahir' => Tanggal::singkat($anak->tanggal_lahir),
            'namaIbu' => $anak->nama_ibu,
            'nikSamar' => Nik::samarkan($anak->nik),
            'kunjunganTerakhir' => is_string($terakhir) ? Tanggal::singkat($terakhir) : null,
            'sudahDiAntrean' => $hariIni,
        ];
    }

    /**
     * Memuat kunjungan terakhir dan status antrean hari ini dalam satu query.
     *
     * @param  Builder<Anak>  $query
     * @return Builder<Anak>
     */
    public static function denganRingkasan(Builder $query): Builder
    {
        return $query
            ->withMax('kunjungan as kunjungan_terakhir', 'tanggal')
            ->withExists(['kunjungan as di_antrean_hari_ini' => fn (Builder $q) => $q->whereDate('tanggal', today())]);
    }
}
