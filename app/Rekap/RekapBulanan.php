<?php

namespace App\Rekap;

use App\Enums\HasilDeteksiStunting;
use App\Enums\JenisLayanan;
use App\Enums\StatusNT;
use App\Enums\SumberData;
use App\Gizi\DeteksiStunting;
use App\Gizi\HasilAntropometri;
use App\Models\Anak;
use App\Models\Layanan;
use App\Models\Pengukuran;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

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
 *   posyandu pada bulan itu (FR-62).
 * - Jumlah anak per kategori status gizi (PRD Tabel 25) dan hasil deteksi
 *   stunting (PRD Tabel 28) dari penimbangan terakhir anggota D (FR-62).
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
     * @return array{s: int, k: int, d: int, n: int, persenDS: string|null, persenND: string|null, imunisasi: int, vitaminABiru: int, vitaminAMerah: int, obatCacing: int, statusGizi: list<array{indeks: string, label: string, kategori: list<array{label: string, varian: string, jumlah: int}>}>, stunting: array{stunting: int, berisiko: int, diprediksi: int}, perluTindakLanjut: int}
     */
    public function hitung(): array
    {
        $sasaran = $this->sasaran();
        $terakhir = $this->penimbanganTerakhir(array_values($sasaran->keys()->all()));
        $hasilAnak = self::hasilAnak($terakhir);

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
            'statusGizi' => self::statusGizi($terakhir),
            'stunting' => [
                'stunting' => collect($hasilAnak)->where('stunting', HasilDeteksiStunting::Stunting)->count(),
                'berisiko' => collect($hasilAnak)->where('stunting', HasilDeteksiStunting::BerisikoStunting)->count(),
                'diprediksi' => collect($hasilAnak)->where('stunting', HasilDeteksiStunting::DiprediksiBerisiko)->count(),
            ],
            'perluTindakLanjut' => collect($hasilAnak)->where('perluTindakLanjut', true)->count(),
        ];
    }

    /**
     * Jumlah anak yang perlu tindak lanjut gizi bulan ini (Beranda, DESIGN
     * Tabel 24): penimbangan terakhirnya berstatus gizi di luar normal,
     * berstatus T, atau terdeteksi berisiko stunting. Aturan sama dengan
     * catatan tindak lanjut wajib di Meja 5 (FR-45).
     */
    public function perluTindakLanjut(): int
    {
        $terakhir = $this->penimbanganTerakhir(array_values($this->sasaran()->keys()->all()));

        return collect(self::hasilAnak($terakhir))->where('perluTindakLanjut', true)->count();
    }

    /**
     * S: anak terdaftar sampai akhir bulan, berumur 0–59 bulan.
     *
     * @return Collection<int, bool|null> id anak => punya Buku KIA
     */
    private function sasaran(): Collection
    {
        return Balita::pada($this->akhir)
            ->where('created_at', '<=', $this->akhir->endOfDay())
            ->pluck('punya_buku_kia', 'id');
    }

    /**
     * Penimbangan posyandu terakhir setiap anak pada bulan ini.
     *
     * @param  list<int>  $anakId
     * @return array<int, Pengukuran>
     */
    private function penimbanganTerakhir(array $anakId): array
    {
        $terakhir = [];

        Pengukuran::query()
            ->where('sumber', SumberData::Posyandu)
            ->whereNotNull('bb')
            ->whereIn('anak_id', $anakId)
            ->whereBetween('tanggal_ukur', [$this->awal->toDateString(), $this->akhir->toDateString()])
            ->orderBy('tanggal_ukur')
            ->orderBy('id')
            ->get()
            ->each(function (Pengukuran $ukur) use (&$terakhir) {
                $terakhir[$ukur->anak_id] = $ukur;
            });

        return $terakhir;
    }

    /** Indeks yang direkap: BB/U, PB/U atau TB/U, BB/PB atau BB/TB. */
    public const INDEKS_REKAP = [
        'bb_u' => 'BB/U',
        'pb_tb_u' => 'PB/U atau TB/U',
        'bb_pb_tb' => 'BB/PB atau BB/TB',
    ];

    /**
     * @param  array<int, Pengukuran>  $terakhir
     * @return list<array{indeks: string, label: string, kategori: list<array{label: string, varian: string, jumlah: int}>}>
     */
    private static function statusGizi(array $terakhir): array
    {
        $hasil = [];

        foreach (self::INDEKS_REKAP as $indeks => $label) {
            $jumlah = [];

            foreach ($terakhir as $ukur) {
                $z = $ukur->getAttribute("zscore_{$indeks}");
                $kategori = HasilAntropometri::kategori($indeks, $z === null ? null : (float) $z);

                if ($kategori !== null) {
                    $jumlah[$kategori['label']] = ($jumlah[$kategori['label']] ?? 0) + 1;
                }
            }

            $hasil[] = [
                'indeks' => $indeks,
                'label' => $label,
                'kategori' => array_map(fn (array $satu) => [
                    'label' => $satu['label'],
                    'varian' => $satu['varian'],
                    'jumlah' => $jumlah[$satu['label']] ?? 0,
                ], HasilAntropometri::daftarKategori($indeks)),
            ];
        }

        return $hasil;
    }

    /**
     * Deteksi stunting (PRD 5.8) dan kebutuhan tindak lanjut setiap anak dari
     * riwayat sampai penimbangan terakhirnya bulan itu.
     *
     * @param  array<int, Pengukuran>  $terakhir
     * @return array<int, array{stunting: HasilDeteksiStunting|null, perluTindakLanjut: bool}>
     */
    private static function hasilAnak(array $terakhir): array
    {
        if ($terakhir === []) {
            return [];
        }

        $anak = Anak::query()->withTrashed()->whereIn('id', array_keys($terakhir))->get()->keyBy('id');
        $semua = Pengukuran::query()
            ->whereIn('anak_id', array_keys($terakhir))
            ->orderBy('tanggal_ukur')
            ->orderBy('id')
            ->get()
            ->groupBy('anak_id');

        $hasil = [];

        foreach ($terakhir as $anakId => $ukur) {
            $riwayat = HasilAntropometri::daftarRiwayat(
                $anak[$anakId],
                $semua[$anakId]
                    ->filter(fn (Pengukuran $satu) => $satu->tanggal_ukur->lessThanOrEqualTo($ukur->tanggal_ukur))
                    ->values(),
                $ukur->id,
            );
            $stunting = DeteksiStunting::nilai($riwayat)['hasil'];
            $hariIni = $riwayat[count($riwayat) - 1];
            $giziDiLuarNormal = ! $hariIni['perluUkurUlang'] && collect($hariIni['kategori'])
                ->contains(fn (?array $kategori) => $kategori !== null && $kategori['kode'] !== 'normal');

            $hasil[$anakId] = [
                'stunting' => $stunting,
                'perluTindakLanjut' => $giziDiLuarNormal
                    || $hariIni['perluUkurUlang']
                    || $ukur->status_nt === StatusNT::TidakNaik
                    || ($stunting !== null && $stunting !== HasilDeteksiStunting::Normal),
            ];
        }

        return $hasil;
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
