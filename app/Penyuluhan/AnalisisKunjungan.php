<?php

namespace App\Penyuluhan;

use App\Enums\HasilDeteksiStunting;
use App\Enums\StatusNT;
use App\Gizi\DeteksiStunting;
use App\Gizi\HasilAntropometri;
use App\Gizi\StatusPenimbangan;
use App\Models\Kunjungan;
use App\Models\Pengukuran;
use App\Pelayanan\RekomendasiLayanan;
use Illuminate\Support\Collection;

/**
 * Hasil kunjungan yang dibaca Meja 5 (PRD 4.7, bab 5): status gizi per
 * indeks, status N/T dan rujukan KMS, deteksi stunting, dan imunisasi yang
 * masih harus dikejar. Dihitung dari pengukuran sampai tanggal kunjungan.
 *
 * @phpstan-import-type RiwayatUkur from HasilAntropometri
 */
final class AnalisisKunjungan
{
    /** Urutan indeks di daftar status gizi bila tingkatnya sama. */
    private const URUTAN = ['pb_tb_u', 'bb_u', 'bb_pb_tb', 'imt_u', 'lk_u', 'lila'];

    /** @var Collection<int, Pengukuran> */
    public readonly Collection $pengukuran;

    /** @var list<RiwayatUkur> Riwayat antropometri, urut tanggal naik. */
    public readonly array $riwayat;

    /** @var RiwayatUkur|null Pengukuran hari ini. */
    public readonly ?array $hariIni;

    /** @var array{hasil: HasilDeteksiStunting, judul: string, alasan: string|null, tindakan: string} */
    public readonly array $stunting;

    public function __construct(public readonly Kunjungan $kunjungan)
    {
        $anak = $kunjungan->anak;
        $ukurHariIni = $kunjungan->pengukuran;

        $this->pengukuran = $anak->pengukuran()
            ->whereDate('tanggal_ukur', '<=', $kunjungan->tanggal)
            ->orderBy('tanggal_ukur')
            ->orderBy('id')
            ->get();

        $this->riwayat = array_values($this->pengukuran
            ->map(fn (Pengukuran $ukur) => HasilAntropometri::riwayat($anak, $ukur, $ukur->id === $ukurHariIni?->id))
            // Pengukuran hari ini menjadi titik terakhir walau ada entri
            // Buku KIA bertanggal sama.
            ->sortBy(fn (array $ukur) => [$ukur['tanggal'], $ukur['hariIni'] ? 1 : 0])
            ->all());

        $this->hariIni = collect($this->riwayat)->firstWhere('hariIni', true);

        // Deteksi hanya dari pengukuran sampai hari ini, dengan hari ini terakhir.
        $this->stunting = $this->hariIni === null
            ? DeteksiStunting::nilai([])
            : DeteksiStunting::nilai($this->riwayat);
    }

    public function perluUkurUlang(): bool
    {
        return (bool) ($this->hariIni['perluUkurUlang'] ?? false);
    }

    /**
     * Status gizi per indeks, paling bermasalah di atas (FR-38; DESIGN
     * Tabel 29). Kosong bila belum ada ukuran atau perlu ukur ulang.
     *
     * @return list<array{indeks: string, label: string, kode: string, kategori: string, varian: string, tingkat: int, zScore: float|null, nilai: float|null, satuan: string}>
     */
    public function statusGizi(): array
    {
        if ($this->hariIni === null || $this->perluUkurUlang()) {
            return [];
        }

        $ukur = $this->hariIni;
        $pakaiPanjang = $ukur['umurBulan'] < 24;
        $label = [
            'pb_tb_u' => $pakaiPanjang ? 'PB/U' : 'TB/U',
            'bb_u' => 'BB/U',
            'bb_pb_tb' => $pakaiPanjang ? 'BB/PB' : 'BB/TB',
            'imt_u' => 'IMT/U',
            'lk_u' => 'LK/U',
            'lila' => 'LiLA',
        ];
        $nilai = [
            'pb_tb_u' => [$ukur['pbTbAcuan'], 'cm'],
            'bb_u' => [$ukur['bb'], 'kg'],
            'bb_pb_tb' => [$ukur['bb'], 'kg'],
            'imt_u' => [$ukur['imt'], 'kg/m²'],
            'lk_u' => [$ukur['lk'], 'cm'],
            'lila' => [$ukur['lila'], 'cm'],
        ];

        $hasil = [];

        foreach (self::URUTAN as $urutan => $indeks) {
            $kategori = $ukur['kategori'][$indeks] ?? null;

            if ($kategori === null) {
                continue;
            }

            $hasil[] = [
                'indeks' => $indeks,
                'label' => $label[$indeks],
                'kode' => $kategori['kode'],
                'kategori' => $kategori['label'],
                'varian' => $kategori['varian'],
                'tingkat' => $kategori['tingkat'],
                'zScore' => $indeks === 'lila' ? null : ($ukur['zscore'][$indeks] ?? null),
                'nilai' => $nilai[$indeks][0],
                'satuan' => $nilai[$indeks][1],
                'urutan' => $urutan,
            ];
        }

        usort($hasil, fn (array $a, array $b) => [$b['tingkat'], $a['urutan']] <=> [$a['tingkat'], $b['urutan']]);

        return array_map(function (array $satu) {
            unset($satu['urutan']);

            return $satu;
        }, $hasil);
    }

    /**
     * Status N/T hari ini dan KBM (PRD 5.5, FR-40).
     *
     * @return array{status: string|null, kenaikanGram: int|null, kbmGram: int|null}|null
     */
    public function penimbangan(): ?array
    {
        $ukur = $this->kunjungan->pengukuran;

        if ($ukur?->bb === null) {
            return null;
        }

        $hitung = StatusPenimbangan::hitung($this->kunjungan->anak, $this->kunjungan->tanggal, (float) $ukur->bb, $ukur->id);

        return [
            'status' => ($ukur->status_nt ?? $hitung['status'])?->value,
            'kenaikanGram' => $hitung['kenaikanGram'],
            'kbmGram' => $hitung['kbmGram'],
        ];
    }

    /**
     * Alasan rujukan KMS Buku KIA: berat badan tidak naik (T), di bawah
     * garis merah (BB/U < −2 SD), atau di atas garis oranye (BB/U > +1 SD)
     * (PRD 5.5, FR-40; Buku KIA 2024 halaman 131–132 dan 143–144).
     *
     * @return list<string>
     */
    public function alasanRujukanKms(): array
    {
        if ($this->perluUkurUlang()) {
            return [];
        }

        $alasan = [];

        if (($this->penimbangan()['status'] ?? null) === StatusNT::TidakNaik->value) {
            $alasan[] = 'Berat badan tidak naik (T)';
        }

        $z = $this->hariIni['zscore']['bb_u'] ?? null;

        if ($z !== null && $z < -2) {
            $alasan[] = 'Berat badan di bawah garis merah KMS';
        } elseif ($z !== null && $z > 1) {
            $alasan[] = 'Berat badan di atas garis oranye KMS';
        }

        return $alasan;
    }

    /** @return list<array{kode: string, nama: string, alasan: string, terlambat: bool, tercentang: bool}> */
    public function imunisasiTertunda(): array
    {
        return (new RekomendasiLayanan($this->kunjungan, sertakanKunjunganIni: true))->imunisasiTertunda();
    }
}
