<?php

namespace App\Rekap;

use App\Enums\JenisLayanan;
use App\Enums\StatusNT;
use App\Enums\SumberData;
use App\Models\Layanan;
use App\Models\Pengukuran;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Rekap kegiatan satu bulan untuk Data Posyandu (PRD 4.11; keputusan
 * pemilik produk):
 *
 * - S (FR-61): anak terdaftar (tidak terhapus) sampai akhir bulan, berumur
 *   0–59 bulan pada akhir bulan.
 * - K: anggota S yang punya Buku KIA (isian data anak).
 * - D: anggota S dengan BB tercatat pada bulan itu dari kunjungan posyandu;
 *   riwayat Buku KIA tidak dihitung.
 * - N: anggota D yang penimbangan terakhirnya di bulan itu berstatus N
 *   (StatusPenimbangan, KBM PRD Tabel 26).
 * - Jumlah pemberian imunisasi, vitamin A, dan obat cacing dari kunjungan
 *   posyandu pada bulan itu (FR-62). Jumlah per status gizi dan risiko
 *   stunting menunggu tabel standar WHO.
 */
final class RekapBulanan
{
    public readonly CarbonImmutable $awal;

    public readonly CarbonImmutable $akhir;

    public function __construct(CarbonInterface $bulan)
    {
        $this->awal = $bulan->toImmutable()->startOfMonth();
        $this->akhir = $this->awal->endOfMonth()->startOfDay();
    }

    /**
     * @return array{s: int, k: int, d: int, n: int, persenDS: string|null, persenND: string|null, imunisasi: int, vitaminABiru: int, vitaminAMerah: int, obatCacing: int}
     */
    public function hitung(): array
    {
        $sasaran = Balita::pada($this->akhir)
            ->where('created_at', '<=', $this->akhir->endOfDay())
            ->pluck('punya_buku_kia', 'id');

        // Penimbangan terakhir setiap anak sasaran pada bulan ini.
        /** @var array<int, Pengukuran> $terakhir */
        $terakhir = [];

        Pengukuran::query()
            ->where('sumber', SumberData::Posyandu)
            ->whereNotNull('bb')
            ->whereIn('anak_id', $sasaran->keys())
            ->whereBetween('tanggal_ukur', [$this->awal->toDateString(), $this->akhir->toDateString()])
            ->orderBy('tanggal_ukur')
            ->orderBy('id')
            ->get()
            ->each(function (Pengukuran $ukur) use (&$terakhir) {
                $terakhir[$ukur->anak_id] = $ukur;
            });

        $s = $sasaran->count();
        $d = count($terakhir);
        $n = collect($terakhir)->filter(fn (Pengukuran $ukur) => $ukur->status_nt === StatusNT::Naik)->count();

        $layanan = Layanan::query()
            ->whereHas('anak')
            ->where('sumber', SumberData::Posyandu)
            ->whereBetween('tanggal', [$this->awal->toDateString(), $this->akhir->toDateString()])
            ->get(['jenis', 'detail']);

        return [
            's' => $s,
            'k' => $sasaran->filter(fn ($punya) => (bool) $punya)->count(),
            'd' => $d,
            'n' => $n,
            'persenDS' => self::persen($d, $s),
            'persenND' => self::persen($n, $d),
            'imunisasi' => $layanan->where('jenis', JenisLayanan::Imunisasi)->count(),
            'vitaminABiru' => $layanan->where('jenis', JenisLayanan::VitaminA)->where('detail', 'Kapsul biru')->count(),
            'vitaminAMerah' => $layanan->where('jenis', JenisLayanan::VitaminA)->where('detail', 'Kapsul merah')->count(),
            'obatCacing' => $layanan->where('jenis', JenisLayanan::ObatCacing)->count(),
        ];
    }

    /** Persentase satu desimal dengan koma, misalnya "83,3"; null bila pembagi 0. */
    public static function persen(int $pembilang, int $penyebut): ?string
    {
        if ($penyebut === 0) {
            return null;
        }

        return number_format($pembilang / $penyebut * 100, 1, ',', '.');
    }
}
