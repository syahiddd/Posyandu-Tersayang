<?php

namespace App\Anak;

use App\Enums\JenisLayanan;
use App\Enums\StatusAntrean;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Support\Tanggal;
use App\Support\Umur;

/**
 * Isi halaman Detail Anak (FR-51, DESIGN S15): identitas lengkap termasuk
 * NIK (hanya di sini, NFR-05), riwayat kunjungan, pengukuran, dan layanan.
 * Riwayat dari Buku KIA ditandai (FR-66).
 */
final class TampilanDetailAnak
{
    /**
     * @return array<string, mixed>
     */
    public static function identitas(Anak $anak): array
    {
        return [
            'id' => $anak->id,
            'nama' => $anak->nama,
            'jenisKelamin' => $anak->jenis_kelamin->value,
            'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir),
            'tempatLahir' => $anak->tempat_lahir,
            'tanggalLahir' => Tanggal::singkat($anak->tanggal_lahir),
            'nik' => $anak->nik,
            'namaIbu' => $anak->nama_ibu,
            'nikIbu' => $anak->nik_ibu,
            'namaAyah' => $anak->nama_ayah,
            'nikAyah' => $anak->nik_ayah,
            'noHp' => $anak->no_hp,
            'alamat' => $anak->alamat,
            'rt' => $anak->rt,
            'rw' => $anak->rw,
            'dusun' => $anak->dusun,
        ];
    }

    /**
     * Pengukuran terbaru di atas; umur dihitung pada tanggal ukur.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function pengukuran(Anak $anak): array
    {
        return $anak->pengukuran()
            ->orderByDesc('tanggal_ukur')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Pengukuran $ukur) => [
                'id' => $ukur->id,
                'tanggal' => Tanggal::singkat($ukur->tanggal_ukur),
                'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir, $ukur->tanggal_ukur),
                'bb' => $ukur->bb,
                'pbTb' => $ukur->pb_tb,
                'caraUkur' => $ukur->cara_ukur?->value,
                'lila' => $ukur->lila,
                'lk' => $ukur->lk,
                'statusNt' => $ukur->status_nt?->value,
                'dariBukuKia' => $ukur->sumber === SumberData::BukuKia,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function kunjungan(Anak $anak): array
    {
        return $anak->kunjungan()
            ->orderByDesc('tanggal')
            ->get()
            ->map(fn (Kunjungan $kunjungan) => [
                'id' => $kunjungan->id,
                'tanggal' => Tanggal::singkat($kunjungan->tanggal),
                'nomorAntrean' => $kunjungan->nomor_antrean,
                'keadaan' => $kunjungan->status === StatusAntrean::Selesai
                    ? 'Selesai'
                    : "Meja {$kunjungan->meja_saat_ini->value} · ".match ($kunjungan->status) {
                        StatusAntrean::Menunggu => 'menunggu',
                        StatusAntrean::SedangDilayani => 'sedang dilayani',
                        StatusAntrean::Ditunda => 'ditunda',
                    },
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function layanan(Anak $anak): array
    {
        return $anak->layanan()
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Layanan $layanan) => [
                'id' => $layanan->id,
                'jenis' => match ($layanan->jenis) {
                    JenisLayanan::Imunisasi => 'Imunisasi',
                    JenisLayanan::VitaminA => 'Vitamin A',
                    JenisLayanan::ObatCacing => 'Obat cacing',
                },
                'detail' => $layanan->detail,
                'tanggal' => Tanggal::singkat($layanan->tanggal),
                'nomorBatch' => $layanan->nomor_batch,
                'dariBukuKia' => $layanan->sumber === SumberData::BukuKia,
            ])
            ->values()
            ->all();
    }
}
