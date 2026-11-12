<?php

namespace App\Gizi;

use RuntimeException;

/**
 * Tabel L, M, S resmi WHO untuk grafik dan skrining antropometri.
 * Grafik pada Buku KIA 2024 (PDF hlm. 67-78) mengikuti standar ini.
 */
final class StandarWho
{
    /** @var array<string, mixed>|null */
    private static ?array $data = null;

    /**
     * Hitung z-score LMS pada umur (bulan/hari) atau panjang/tinggi badan.
     * Umur untuk BB/U memakai bulan penuh; indeks lain menerima umur dalam hari.
     */
    public static function zScore(
        string $jenisKelamin,
        string $indeks,
        float $nilai,
        float $posisi,
        ?string $cara = null,
        bool $perpanjangBerat = true,
    ): ?float {
        if ($nilai <= 0) {
            return null;
        }

        $lms = self::lms($jenisKelamin, $indeks, $posisi, $cara);

        if ($lms === null) {
            return null;
        }

        [$l, $m, $s] = $lms;
        $z = self::hitungLms($nilai, $l, $m, $s);

        if ($perpanjangBerat && in_array($indeks, ['bb_u', 'bb_pb_tb', 'imt_u'], true)) {
            $batasBawah3 = self::nilaiZ(-3, $l, $m, $s);
            $batasBawah2 = self::nilaiZ(-2, $l, $m, $s);
            $batasAtas2 = self::nilaiZ(2, $l, $m, $s);
            $batasAtas3 = self::nilaiZ(3, $l, $m, $s);

            if ($z < -3 && $batasBawah3 !== null && $batasBawah2 !== null && $batasBawah2 > $batasBawah3) {
                $z = -3 + (($nilai - $batasBawah3) / ($batasBawah2 - $batasBawah3));
            } elseif ($z > 3 && $batasAtas2 !== null && $batasAtas3 !== null && $batasAtas3 > $batasAtas2) {
                $z = 3 + (($nilai - $batasAtas3) / ($batasAtas3 - $batasAtas2));
            }
        }

        return is_finite($z) ? round($z, 2) : null;
    }

    /**
     * Susun garis acuan untuk SVG. Posisi grafik dinyatakan dalam bulan atau cm.
     *
     * @param  list<int>  $garis
     * @param  list<int>|null  $garisTerlihat
     * @return list<array{z: int, terlihat: bool, titik: list<array{x: float, y: float}>}>
     */
    public static function garis(
        string $jenisKelamin,
        string $indeks,
        float $dari,
        float $sampai,
        array $garis,
        ?string $cara = null,
        ?array $garisTerlihat = null,
    ): array {
        $tabel = self::tabel($jenisKelamin, $indeks, $cara);
        $sumbu = $tabel['xAxis'];
        $jarak = $sumbu === 'Month' ? 0.5 : ($sumbu === 'Day' ? 0.5 : 1.0);
        $kelipatan = $sumbu === 'Day' ? 365.25 / 12 : 1.0;
        $hasil = [];

        foreach ($garis as $z) {
            $titik = [];

            for ($x = $dari; $x <= $sampai + 0.0001; $x += $jarak) {
                $posisi = $x * $kelipatan;
                $lms = self::lmsDariTabel($tabel, $posisi);

                if ($lms === null) {
                    continue;
                }

                $nilai = self::nilaiZ($z, ...$lms);

                if ($nilai !== null) {
                    $titik[] = ['x' => round($x, 2), 'y' => round($nilai, 2)];
                }
            }

            $hasil[] = [
                'z' => $z,
                'terlihat' => in_array($z, $garisTerlihat ?? $garis, true),
                'titik' => $titik,
            ];
        }

        return $hasil;
    }

    /** @return array{xAxis: string, rows: array<int, array{0: float, 1: float, 2: float, 3: float}>} */
    private static function tabel(string $jenisKelamin, string $indeks, ?string $cara): array
    {
        $data = self::data();
        $kelompok = $jenisKelamin === 'L' ? 'laki' : 'perempuan';

        if (! isset($data[$kelompok])) {
            throw new RuntimeException('Jenis kelamin tidak memiliki tabel standar WHO.');
        }

        if ($indeks === 'bb_pb_tb') {
            $tabel = $data[$kelompok][$indeks][$cara === 'tb' ? 'tb' : 'pb'] ?? null;
        } else {
            $tabel = $data[$kelompok][$indeks] ?? null;
        }

        if (! is_array($tabel) || ! isset($tabel['xAxis'], $tabel['rows'])) {
            throw new RuntimeException("Tabel WHO untuk indeks {$indeks} tidak tersedia.");
        }

        return $tabel;
    }

    /** @return array<string, mixed> */
    private static function data(): array
    {
        if (self::$data !== null) {
            return self::$data;
        }

        $path = resource_path('data/standar-antropometri-who.json');
        $isi = file_get_contents($path);

        if ($isi === false) {
            throw new RuntimeException('Data standar antropometri WHO tidak dapat dibaca.');
        }

        /** @var array<string, mixed> $data */
        $data = json_decode($isi, true, flags: JSON_THROW_ON_ERROR);

        return self::$data = $data;
    }

    /** @return array{0: float, 1: float, 2: float}|null */
    private static function lms(string $jenisKelamin, string $indeks, float $posisi, ?string $cara): ?array
    {
        return self::lmsDariTabel(self::tabel($jenisKelamin, $indeks, $cara), $posisi);
    }

    /**
     * @param  array{xAxis: string, rows: array<int, array{0: float, 1: float, 2: float, 3: float}>}  $tabel
     * @return array{0: float, 1: float, 2: float}|null
     */
    private static function lmsDariTabel(array $tabel, float $posisi): ?array
    {
        $baris = $tabel['rows'];
        $jumlah = count($baris);

        if ($jumlah === 0 || $posisi < $baris[0][0] || $posisi > $baris[$jumlah - 1][0]) {
            return null;
        }

        $kiri = 0;
        $kanan = $jumlah - 1;

        while ($kiri <= $kanan) {
            $tengah = intdiv($kiri + $kanan, 2);
            $x = $baris[$tengah][0];

            if (abs($x - $posisi) < 0.000001) {
                return [$baris[$tengah][1], $baris[$tengah][2], $baris[$tengah][3]];
            }

            if ($x < $posisi) {
                $kiri = $tengah + 1;
            } else {
                $kanan = $tengah - 1;
            }
        }

        if ($kanan < 0 || $kiri >= $jumlah) {
            return null;
        }

        $bawah = $baris[$kanan];
        $atas = $baris[$kiri];
        $rasio = ($posisi - $bawah[0]) / ($atas[0] - $bawah[0]);

        return [
            $bawah[1] + (($atas[1] - $bawah[1]) * $rasio),
            $bawah[2] + (($atas[2] - $bawah[2]) * $rasio),
            $bawah[3] + (($atas[3] - $bawah[3]) * $rasio),
        ];
    }

    private static function hitungLms(float $nilai, float $l, float $m, float $s): float
    {
        if (abs($l) < 0.000000001) {
            return log($nilai / $m) / $s;
        }

        return ((($nilai / $m) ** $l) - 1) / ($l * $s);
    }

    private static function nilaiZ(int $z, float $l, float $m, float $s): ?float
    {
        if (abs($l) < 0.000000001) {
            return $m * exp($s * $z);
        }

        $dasar = 1 + ($l * $s * $z);

        return $dasar > 0 ? $m * ($dasar ** (1 / $l)) : null;
    }
}
