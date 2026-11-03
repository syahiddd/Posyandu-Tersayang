<?php

namespace App\Antrean;

use App\Models\Anak;
use App\Support\Nik;
use App\Support\Tanggal;
use App\Support\Umur;

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
        $terakhir = $anak->kunjungan()->max('tanggal');

        return [
            'id' => $anak->id,
            'nama' => $anak->nama,
            'jenisKelamin' => $anak->jenis_kelamin->value,
            'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir),
            'tanggalLahir' => Tanggal::singkat($anak->tanggal_lahir),
            'namaIbu' => $anak->nama_ibu,
            'nikSamar' => Nik::samarkan($anak->nik),
            'kunjunganTerakhir' => is_string($terakhir) ? Tanggal::singkat($terakhir) : null,
            'sudahDiAntrean' => $anak->kunjungan()->whereDate('tanggal', today())->exists(),
        ];
    }
}
