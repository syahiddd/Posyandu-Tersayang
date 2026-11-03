<?php

namespace App\Antrean;

use App\Enums\StatusAntrean;
use App\Models\Kunjungan;
use App\Models\User;
use App\Support\Nik;
use App\Support\Umur;

/**
 * Data kunjungan yang dikirim ke layar. NIK selalu tersamar (NFR-05).
 */
final class TampilanKunjungan
{
    /**
     * Kartu anak di antrean (DESIGN bab 7, Kartu anak).
     *
     * @return array<string, mixed>
     */
    public static function kartu(Kunjungan $kunjungan, User $user): array
    {
        $anak = $kunjungan->anak;
        $dibukaOrangLain = $kunjungan->status === StatusAntrean::SedangDilayani
            && $kunjungan->dibuka_oleh !== $user->id;
        $kunciMasihBerlaku = $kunjungan->dibuka_pada !== null
            && $kunjungan->dibuka_pada->greaterThan(now()->subMinutes(LayananAntrean::MENIT_KUNCI));

        return [
            'id' => $kunjungan->id,
            'nomorAntrean' => $kunjungan->nomor_antrean,
            'nama' => $anak->nama,
            'jenisKelamin' => $anak->jenis_kelamin->value,
            'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir, $kunjungan->tanggal),
            'namaIbu' => $anak->nama_ibu,
            'status' => $kunjungan->status->value,
            'terkunci' => $dibukaOrangLain && $kunciMasihBerlaku,
            'dibukaOleh' => $dibukaOrangLain ? $kunjungan->pembuka?->name : null,
            'dibukaPada' => $kunjungan->dibuka_pada?->toIso8601String(),
            'ditundaPada' => $kunjungan->ditunda_pada?->toIso8601String(),
            'perluUkurUlang' => $kunjungan->perlu_ukur_ulang,
        ];
    }

    /**
     * Header anak di layar meja (DESIGN bab 7, Header anak).
     *
     * @return array<string, mixed>
     */
    public static function header(Kunjungan $kunjungan): array
    {
        $anak = $kunjungan->anak;

        return [
            'id' => $kunjungan->id,
            'meja' => $kunjungan->meja_saat_ini->value,
            'nomorAntrean' => $kunjungan->nomor_antrean,
            'nama' => $anak->nama,
            'jenisKelamin' => $anak->jenis_kelamin->value,
            'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir, $kunjungan->tanggal),
            'nikSamar' => Nik::samarkan($anak->nik),
            'perluUkurUlang' => $kunjungan->perlu_ukur_ulang,
            'alasanKembali' => $kunjungan->alasan_kembali,
        ];
    }
}
