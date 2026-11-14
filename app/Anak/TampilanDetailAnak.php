<?php

namespace App\Anak;

use App\Enums\JenisLayanan;
use App\Enums\StatusAntrean;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Models\User;
use App\Support\Tanggal;
use App\Support\Umur;
use Spatie\Activitylog\Models\Activity;

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
            'punyaBukuKia' => $anak->punya_buku_kia,
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
                // Catatan Meja 4, misalnya alasan imunisasi tidak diberikan.
                'catatanPelayanan' => $kunjungan->catatan_pelayanan,
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

    /**
     * Nilai isian formulir Ubah Data Anak, dalam format yang sama dengan
     * formulir Tambah Anak (tanggal Y-m-d, angka sebagai teks).
     *
     * @return array<string, string|int>
     */
    public static function isian(Anak $anak): array
    {
        return [
            'id' => $anak->id,
            'nama' => $anak->nama,
            'jenis_kelamin' => $anak->jenis_kelamin->value,
            'tempat_lahir' => $anak->tempat_lahir ?? '',
            'tanggal_lahir' => $anak->tanggal_lahir->toDateString(),
            'nik' => $anak->nik ?? '',
            'punya_buku_kia' => match ($anak->punya_buku_kia) {
                true => '1',
                false => '0',
                null => '',
            },
            'nama_ibu' => $anak->nama_ibu,
            'nik_ibu' => $anak->nik_ibu ?? '',
            'nama_ayah' => $anak->nama_ayah ?? '',
            'nik_ayah' => $anak->nik_ayah ?? '',
            'no_hp' => $anak->no_hp ?? '',
            'alamat' => $anak->alamat,
            'rt' => $anak->rt === null ? '' : (string) $anak->rt,
            'rw' => $anak->rw === null ? '' : (string) $anak->rw,
            'dusun' => $anak->dusun,
        ];
    }

    /**
     * "Diubah terakhir oleh … pada …" dari log aktivitas (NFR-06).
     *
     * @return array{oleh: string, pada: string}|null
     */
    public static function perubahanTerakhir(Anak $anak): ?array
    {
        $aktivitas = $anak->activitiesAsSubject()
            ->where('event', 'updated')
            ->latest('id')
            ->first();

        if (! $aktivitas instanceof Activity) {
            return null;
        }

        $causer = $aktivitas->causer;

        return [
            'oleh' => $causer instanceof User ? $causer->name : 'sistem',
            'pada' => Tanggal::singkat($aktivitas->created_at).' '.$aktivitas->created_at->format('H.i'),
        ];
    }
}
