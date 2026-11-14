<?php

namespace App\Pelayanan;

use App\Enums\JenisLayanan;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Layanan;
use App\Support\Tanggal;
use App\Support\Umur;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Layanan yang ditawarkan Meja 4 untuk satu kunjungan (PRD 4.6, 6.1, 6.2;
 * FR-30, FR-33, FR-34). Jadwal dan batas umur dibaca dari
 * config/imunisasi.php (Buku KIA 2024 halaman 123 sampai 125).
 *
 * Untuk Meja 4, layanan yang tercatat pada kunjungan ini sendiri tidak
 * dihitung sebagai riwayat, sehingga layar dapat dibuka ulang setelah Batal
 * atau Tunda. Meja 5 menyertakannya untuk imunisasi yang masih harus
 * dikejar setelah layanan hari ini (FR-41).
 *
 * @phpstan-import-type Dosis from JadwalImunisasi
 * @phpstan-import-type Vaksin from JadwalImunisasi
 *
 * @phpstan-type AcuanVitaminObat array{jenis: string, nama: string, umur_min: int, umur_maks: int|null}
 */
final class RekomendasiLayanan
{
    public readonly Anak $anak;

    public readonly int $umur;

    public readonly CarbonImmutable $tanggal;

    /** @var Collection<int, Layanan> Riwayat layanan anak di luar kunjungan ini, terbaru di atas. */
    private Collection $riwayat;

    public function __construct(private Kunjungan $kunjungan, bool $sertakanKunjunganIni = false)
    {
        $this->anak = $kunjungan->anak;
        $this->tanggal = $kunjungan->tanggal->toImmutable();
        $this->umur = Umur::bulanPenuh($this->anak->tanggal_lahir, $kunjungan->tanggal);

        $this->riwayat = $this->anak->layanan()
            ->when(! $sertakanKunjunganIni, fn (Builder $query) => $query->where(fn (Builder $q) => $q
                ->whereNull('kunjungan_id')
                ->orWhere('kunjungan_id', '!=', $kunjungan->id)))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Imunisasi jatuh tempo hari ini, termasuk yang terlambat (kejar).
     * Tiap rangkaian vaksin hanya menawarkan dosis berikutnya yang belum
     * tercatat (FR-30), selama umur anak masih dalam batas yang
     * diperbolehkan tabel Pelayanan Imunisasi Buku KIA (PRD 6.1).
     *
     * @return list<array{kode: string, nama: string, alasan: string, terlambat: bool, tercentang: bool}>
     */
    public function imunisasi(): array
    {
        $sudah = array_values($this->riwayat
            ->where('jenis', JenisLayanan::Imunisasi)
            ->map(fn (Layanan $layanan) => $layanan->detail)
            ->all());

        return array_map(
            fn (array $satu) => [
                'kode' => $satu['kode'],
                'nama' => $satu['nama'],
                'alasan' => $satu['terlambat']
                    ? "Imunisasi kejar · jadwal umur {$satu['umurBulan']} bulan"
                    : "Umur {$this->umur} bulan",
                'terlambat' => $satu['terlambat'],
                'tercentang' => ! $satu['khususEndemis'],
            ],
            JadwalImunisasi::jatuhTempo($this->umur, $sudah),
        );
    }

    /**
     * Imunisasi yang masih harus dikejar (FR-41): dosis jatuh tempo yang
     * belum tercatat, tanpa JE yang khusus daerah endemis.
     *
     * @return list<array{kode: string, nama: string, alasan: string, terlambat: bool, tercentang: bool}>
     */
    public function imunisasiTertunda(): array
    {
        /** @var array<string, Vaksin> $vaksin */
        $vaksin = config('imunisasi.vaksin');

        return array_values(array_filter(
            $this->imunisasi(),
            fn (array $satu) => ! ($vaksin[$satu['kode']]['khusus_endemis'] ?? false),
        ));
    }

    /**
     * Vitamin A sesuai umur (FR-33): kotak centang pada bulan pemberian,
     * selain itu info kapsul berikutnya. Null bila anak di luar umur 6
     * sampai 59 bulan.
     *
     * @return array{pilihan: array{kode: string, nama: string, keterangan: string}|null, info: string|null}|null
     */
    public function vitaminA(): ?array
    {
        $kapsulSekarang = $this->kapsul($this->umur);

        if ($kapsulSekarang === null) {
            return null;
        }

        /** @var list<int> $bulanPemberian */
        $bulanPemberian = config('imunisasi.bulan_vitamin_a');
        $namaBulan = collect($bulanPemberian)
            ->map(fn (int $bulan) => Tanggal::namaBulan($bulan))
            ->join(' dan ');

        $terakhirBulanIni = $this->riwayat
            ->where('jenis', JenisLayanan::VitaminA)
            ->first(fn (Layanan $layanan) => $layanan->tanggal->isSameMonth($this->tanggal));

        if (in_array($this->tanggal->month, $bulanPemberian, true) && $terakhirBulanIni === null) {
            return [
                'pilihan' => [
                    'kode' => $kapsulSekarang['kode'],
                    'nama' => $kapsulSekarang['nama'],
                    'keterangan' => "Umur {$this->umur} bulan · diberikan setiap {$namaBulan}",
                ],
                'info' => null,
            ];
        }

        $berikutnya = $this->vitaminABerikutnya($bulanPemberian);
        $sudah = $terakhirBulanIni !== null
            ? 'Sudah diberikan '.Tanggal::singkat($terakhirBulanIni->tanggal).'. '
            : '';

        return [
            'pilihan' => null,
            'info' => $sudah.($berikutnya ?? "Diberikan setiap {$namaBulan} sampai umur 59 bulan."),
        ];
    }

    /**
     * Obat cacing untuk anak 12 bulan ke atas (FR-34). Null bila belum
     * cukup umur.
     *
     * @return array{boleh: bool, kode: string, nama: string, keterangan: string}|null
     */
    public function obatCacing(): ?array
    {
        /** @var AcuanVitaminObat $acuan */
        $acuan = config('imunisasi.vitamin_obat.Obat cacing');

        if ($this->umur < $acuan['umur_min']) {
            return null;
        }

        $perTahun = (int) config('imunisasi.obat_cacing_per_tahun');
        $pemberian = $this->riwayat->where('jenis', JenisLayanan::ObatCacing);
        $terakhir = $pemberian->first();
        $tahunIni = $pemberian
            ->filter(fn (Layanan $layanan) => $layanan->tanggal->year === $this->tanggal->year)
            ->count();

        $bagianTerakhir = $terakhir !== null
            ? 'Terakhir '.Tanggal::singkat($terakhir->tanggal)
            : 'Belum pernah tercatat';

        return [
            'boleh' => $tahunIni < $perTahun,
            'kode' => 'Obat cacing',
            'nama' => $acuan['nama'],
            'keterangan' => $tahunIni < $perTahun
                ? "{$bagianTerakhir} · jatah ke-".($tahunIni + 1)." dari {$perTahun} tahun ini"
                : "{$bagianTerakhir} · sudah {$perTahun} kali tahun ini",
        ];
    }

    /**
     * Riwayat imunisasi dikelompokkan per tanggal, terbaru di atas (FR-31).
     *
     * @return list<array{tanggal: string, vaksin: string}>
     */
    public function riwayatImunisasi(): array
    {
        return array_values($this->riwayat
            ->where('jenis', JenisLayanan::Imunisasi)
            ->groupBy(fn (Layanan $layanan) => $layanan->tanggal->toDateString())
            ->map(fn (Collection $kelompok) => [
                'tanggal' => Tanggal::singkat($kelompok->first()->tanggal),
                'vaksin' => $kelompok->map(fn (Layanan $layanan) => $layanan->detail)->sort()->join(', '),
            ])
            ->all());
    }

    /**
     * Kapsul vitamin A untuk umur tertentu (PRD Tabel 30).
     *
     * @return array{kode: string, nama: string}|null
     */
    private function kapsul(int $umur): ?array
    {
        /** @var array<string, AcuanVitaminObat> $acuan */
        $acuan = config('imunisasi.vitamin_obat');

        foreach ($acuan as $kode => $satu) {
            if ($satu['jenis'] === JenisLayanan::VitaminA->value
                && $umur >= $satu['umur_min']
                && ($satu['umur_maks'] === null || $umur <= $satu['umur_maks'])) {
                return ['kode' => $kode, 'nama' => $satu['nama']];
            }
        }

        return null;
    }

    /**
     * Contoh: "Kapsul merah berikutnya: Februari 2027" (DESIGN Gambar 5).
     *
     * @param  list<int>  $bulanPemberian
     */
    private function vitaminABerikutnya(array $bulanPemberian): ?string
    {
        $bulan = $this->tanggal->startOfMonth();

        for ($i = 1; $i <= 12; $i++) {
            $bulan = $bulan->addMonth();

            if (! in_array($bulan->month, $bulanPemberian, true)) {
                continue;
            }

            $kapsul = $this->kapsul(Umur::bulanPenuh($this->anak->tanggal_lahir, $bulan));

            return $kapsul === null
                ? null
                : "{$kapsul['kode']} berikutnya: ".Tanggal::bulan($bulan);
        }

        return null;
    }
}
