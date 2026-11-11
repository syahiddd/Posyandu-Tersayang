<?php

namespace App\Gizi;

use App\Enums\CaraUkur;
use App\Enums\JenisKelamin;
use App\Enums\StatusNT;
use App\Models\Anak;
use App\Models\Pengukuran;
use App\Support\Umur;
use Carbon\CarbonInterface;

/** Kalkulasi skrining antropometri dari nilai LMS WHO. */
final class HasilAntropometri
{
    /**
     * Hitung nilai turunan dan skor untuk satu waktu pengukuran.
     *
     * @return array{
     *   umurBulan: int,
     *   umurHari: int,
     *   pbTbAcuan: ?float,
     *   imt: ?float,
     *   zscore: array{bb_u: ?float, pb_tb_u: ?float, bb_pb_tb: ?float, imt_u: ?float, lk_u: ?float},
     *   kategori: array<string, array{kode: string, label: string, varian: string, tingkat: int}|null>,
     *   perluUkurUlang: bool,
     *   kolom: array<string, int|float|string|null>
     * }
     */
    public static function hitung(
        Anak $anak,
        ?float $bb,
        ?float $pbTb,
        ?CaraUkur $caraUkur,
        ?float $lila,
        ?float $lk,
        CarbonInterface $tanggal,
    ): array {
        $umurBulan = Umur::bulanPenuh($anak->tanggal_lahir, $tanggal);
        $umurHari = (int) $anak->tanggal_lahir->startOfDay()->diffInDays($tanggal->copy()->startOfDay());
        $pbTbAcuan = self::koreksiPanjangTinggi($pbTb, $caraUkur, $umurBulan);
        $jenisKelamin = $anak->jenis_kelamin->value;
        $imt = $bb !== null && $pbTbAcuan !== null && $pbTbAcuan > 0
            ? round($bb / (($pbTbAcuan / 100) ** 2), 1)
            : null;

        $zscore = [
            'bb_u' => $bb !== null
                ? StandarWho::zScore($jenisKelamin, 'bb_u', $bb, $umurBulan)
                : null,
            'pb_tb_u' => $pbTbAcuan !== null
                ? StandarWho::zScore($jenisKelamin, 'pb_tb_u', $pbTbAcuan, $umurHari, perpanjangBerat: false)
                : null,
            'bb_pb_tb' => $bb !== null && $pbTbAcuan !== null
                ? StandarWho::zScore($jenisKelamin, 'bb_pb_tb', $bb, $pbTbAcuan, $umurBulan < 24 ? 'pb' : 'tb')
                : null,
            'imt_u' => $imt !== null
                ? StandarWho::zScore($jenisKelamin, 'imt_u', $imt, $umurHari)
                : null,
            'lk_u' => $lk !== null
                ? StandarWho::zScore($jenisKelamin, 'lk_u', $lk, $umurHari, perpanjangBerat: false)
                : null,
        ];

        $kategori = [
            'bb_u' => self::kategori('bb_u', $zscore['bb_u']),
            'pb_tb_u' => self::kategori('pb_tb_u', $zscore['pb_tb_u']),
            'bb_pb_tb' => self::kategori('bb_pb_tb', $zscore['bb_pb_tb']),
            'imt_u' => self::kategori('imt_u', $zscore['imt_u']),
            'lk_u' => self::kategori('lk_u', $zscore['lk_u']),
            'lila' => self::kategoriLila($lila, $umurBulan),
        ];

        $perluUkurUlang = ($zscore['bb_u'] !== null && ($zscore['bb_u'] < -6 || $zscore['bb_u'] > 5))
            || ($zscore['pb_tb_u'] !== null && ($zscore['pb_tb_u'] < -6 || $zscore['pb_tb_u'] > 6))
            || ($zscore['bb_pb_tb'] !== null && ($zscore['bb_pb_tb'] < -5 || $zscore['bb_pb_tb'] > 5))
            || ($zscore['imt_u'] !== null && ($zscore['imt_u'] < -5 || $zscore['imt_u'] > 5));

        return [
            'umurBulan' => $umurBulan,
            'umurHari' => $umurHari,
            'pbTbAcuan' => $pbTbAcuan === null ? null : round($pbTbAcuan, 1),
            'imt' => $imt,
            'zscore' => $zscore,
            'kategori' => $kategori,
            'perluUkurUlang' => $perluUkurUlang,
            'kolom' => [
                'imt' => $imt,
                'zscore_bb_u' => $zscore['bb_u'],
                'zscore_pb_tb_u' => $zscore['pb_tb_u'],
                'zscore_bb_pb_tb' => $zscore['bb_pb_tb'],
                'zscore_imt_u' => $zscore['imt_u'],
                'zscore_lk_u' => $zscore['lk_u'],
            ],
        ];
    }

    /**
     * Siapkan nilai riwayat untuk grafik dan ringkasan Meja 5.
     *
     * @return array<string, mixed>
     */
    public static function riwayat(Anak $anak, Pengukuran $ukur, bool $hariIni = false): array
    {
        $hasil = self::hitung(
            $anak,
            $ukur->bb === null ? null : (float) $ukur->bb,
            $ukur->pb_tb === null ? null : (float) $ukur->pb_tb,
            $ukur->cara_ukur,
            $ukur->lila === null ? null : (float) $ukur->lila,
            $ukur->lk === null ? null : (float) $ukur->lk,
            $ukur->tanggal_ukur,
        );

        return [
            'id' => $ukur->id,
            'tanggal' => $ukur->tanggal_ukur->format('Y-m-d'),
            'umurBulan' => $hasil['umurBulan'],
            'umurHari' => $hasil['umurHari'],
            'bb' => $ukur->bb === null ? null : (float) $ukur->bb,
            'pbTb' => $ukur->pb_tb === null ? null : (float) $ukur->pb_tb,
            'pbTbAcuan' => $hasil['pbTbAcuan'],
            'caraUkur' => $ukur->cara_ukur?->value,
            'lila' => $ukur->lila === null ? null : (float) $ukur->lila,
            'lk' => $ukur->lk === null ? null : (float) $ukur->lk,
            'imt' => $hasil['imt'],
            'zscore' => $hasil['zscore'],
            'kategori' => $hasil['kategori'],
            'statusNt' => $ukur->status_nt?->value,
            'dariBukuKia' => $ukur->sumber->value === 'buku_kia',
            'hariIni' => $hariIni,
            'perluUkurUlang' => $hasil['perluUkurUlang'],
        ];
    }

    /** @return array{kode: string, label: string, varian: string, tingkat: int}|null */
    public static function kategori(string $indeks, ?float $z): ?array
    {
        if ($z === null) {
            return null;
        }

        if ($indeks === 'bb_u') {
            return match (true) {
                $z < -3 => self::status('sangat_kurang', 'Berat badan sangat kurang', 'bahaya-berat', 5),
                $z < -2 => self::status('kurang', 'Berat badan kurang', 'bahaya', 4),
                $z <= 1 => self::status('normal', 'Berat badan normal', 'normal', 0),
                default => self::status('risiko_lebih', 'Risiko berat badan lebih', 'waspada', 2),
            };
        }

        if ($indeks === 'pb_tb_u') {
            return match (true) {
                $z < -3 => self::status('sangat_pendek', 'Sangat pendek', 'bahaya-berat', 5),
                $z < -2 => self::status('pendek', 'Pendek', 'bahaya', 4),
                $z <= 3 => self::status('normal', 'Normal', 'normal', 0),
                default => self::status('tinggi', 'Tinggi', 'info', 1),
            };
        }

        if ($indeks === 'lk_u') {
            return match (true) {
                $z < -2 => self::status('mikrosefali', 'Mikrosefali', 'bahaya', 4),
                $z <= 2 => self::status('normal', 'Normal', 'normal', 0),
                default => self::status('makrosefali', 'Makrosefali', 'bahaya', 4),
            };
        }

        return match (true) {
            $z < -3 => self::status('gizi_buruk', 'Gizi buruk', 'bahaya-berat', 5),
            $z < -2 => self::status('gizi_kurang', 'Gizi kurang', 'bahaya', 4),
            $z <= 1 => self::status('normal', 'Gizi baik', 'normal', 0),
            $z <= 2 => self::status('risiko_lebih', 'Berisiko gizi lebih', 'waspada', 2),
            $z <= 3 => self::status('gizi_lebih', 'Gizi lebih', 'bahaya', 4),
            default => self::status('obesitas', 'Obesitas', 'bahaya-berat', 5),
        };
    }

    /** @return array{kode: string, label: string, varian: string, tingkat: int}|null */
    public static function kategoriLila(?float $lila, int $umurBulan): ?array
    {
        if ($lila === null || $umurBulan < 6 || $umurBulan > 59) {
            return null;
        }

        return match (true) {
            $lila < 11.5 => self::status('gizi_buruk', 'Gizi buruk', 'bahaya-berat', 5),
            $lila < 12.5 => self::status('gizi_kurang', 'Gizi kurang', 'bahaya', 4),
            default => self::status('normal', 'Gizi baik', 'normal', 0),
        };
    }

    /** @return array{kode: string, label: string, varian: string, tingkat: int} */
    private static function status(string $kode, string $label, string $varian, int $tingkat): array
    {
        return compact('kode', 'label', 'varian', 'tingkat');
    }

    private static function koreksiPanjangTinggi(?float $nilai, ?CaraUkur $cara, int $umurBulan): ?float
    {
        if ($nilai === null || $cara === null) {
            return $nilai;
        }

        if ($umurBulan < 24 && $cara === CaraUkur::Berdiri) {
            return $nilai + 0.7;
        }

        if ($umurBulan >= 24 && $cara === CaraUkur::Telentang) {
            return $nilai - 0.7;
        }

        return $nilai;
    }
}
