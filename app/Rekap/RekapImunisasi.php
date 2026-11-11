<?php

namespace App\Rekap;

use App\Enums\JenisLayanan;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Layanan;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

/**
 * Rekapitulasi imunisasi per anak (FR-55, FR-56): baris = semua balita pada
 * akhir periode (sesuai saringan dusun), kolom = dosis vaksin Tabel 29 (atau
 * dosis satu kelompok vaksin), sel = tanggal pemberian dalam periode.
 * Riwayat dari Buku KIA ikut dihitung dan ditandai (FR-66).
 *
 * @phpstan-type Sel array{tanggal: CarbonImmutable, dariBukuKia: bool}
 * @phpstan-type Baris array{anak: Anak, sel: array<string, Sel|null>}
 */
final class RekapImunisasi
{
    public function __construct(
        public readonly CarbonImmutable $dari,
        public readonly CarbonImmutable $sampai,
        public readonly ?string $kelompok = null,
        public readonly ?string $dusun = null,
    ) {}

    /** @return array<string, string> Kode kelompok vaksin => nama (config/imunisasi.php). */
    public static function daftarKelompok(): array
    {
        /** @var array<string, string> */
        return config('imunisasi.kelompok_vaksin');
    }

    /** @return array<string, array{nama: string, umur_bulan: int, kelompok: string}> */
    private static function vaksin(): array
    {
        /** @var array<string, array{nama: string, umur_bulan: int, kelompok: string}> */
        return config('imunisasi.vaksin');
    }

    /** @return array<string, string> Kode dosis => nama, urut jadwal Tabel 29. */
    public function kolom(): array
    {
        return collect(self::vaksin())
            ->filter(fn (array $satu) => $this->kelompok === null || $satu['kelompok'] === $this->kelompok)
            ->map(fn (array $satu) => $satu['nama'])
            ->all();
    }

    /** @return Builder<Anak> */
    public function queryAnak(): Builder
    {
        return Balita::pada($this->sampai)
            ->when($this->dusun, fn (Builder $query, string $dusun) => $query->where('dusun', $dusun))
            ->orderBy('nama')
            ->orderBy('id');
    }

    /**
     * Dosis yang tercatat lebih dari sekali memakai tanggal paling awal
     * dalam periode.
     *
     * @return list<Baris>
     */
    public function baris(): array
    {
        $kolom = array_keys($this->kolom());
        $anak = $this->queryAnak()->get();

        /** @var array<int, array<string, Sel>> $tercatat Anak => dosis => sel. */
        $tercatat = [];

        Layanan::query()
            ->where('jenis', JenisLayanan::Imunisasi)
            ->whereIn('anak_id', $anak->modelKeys())
            ->whereIn('detail', $kolom)
            ->whereBetween('tanggal', [$this->dari->toDateString(), $this->sampai->toDateString()])
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get()
            ->each(function (Layanan $pemberian) use (&$tercatat) {
                $tercatat[$pemberian->anak_id][$pemberian->detail] ??= [
                    'tanggal' => $pemberian->tanggal->toImmutable(),
                    'dariBukuKia' => $pemberian->sumber === SumberData::BukuKia,
                ];
            });

        $baris = [];

        foreach ($anak as $satu) {
            $sel = [];

            foreach ($kolom as $dosis) {
                $sel[$dosis] = $tercatat[$satu->id][$dosis] ?? null;
            }

            $baris[] = ['anak' => $satu, 'sel' => $sel];
        }

        return $baris;
    }

    /**
     * Jumlah anak yang menerima setiap dosis dalam periode.
     *
     * @param  list<Baris>  $baris
     * @return array<string, int>
     */
    public function jumlahPerDosis(array $baris): array
    {
        return collect($this->kolom())
            ->map(fn (string $nama, string $kode) => collect($baris)
                ->filter(fn (array $satu) => $satu['sel'][$kode] !== null)
                ->count())
            ->all();
    }

    /**
     * Ringkasan cakupan (FR-56): jumlah anak yang menerima minimal satu
     * dosis setiap kelompok vaksin dalam periode.
     *
     * @param  list<Baris>  $baris
     * @return array<string, int>
     */
    public function jumlahPerKelompok(array $baris): array
    {
        $vaksin = self::vaksin();

        return collect(self::daftarKelompok())
            ->filter(fn (string $nama, string $kode) => $this->kelompok === null || $kode === $this->kelompok)
            ->map(fn (string $nama, string $kode) => collect($baris)
                ->filter(fn (array $satu) => collect($satu['sel'])
                    ->contains(fn (?array $sel, string $dosis) => $sel !== null && $vaksin[$dosis]['kelompok'] === $kode))
                ->count())
            ->all();
    }
}
