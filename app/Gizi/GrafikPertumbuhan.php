<?php

namespace App\Gizi;

use App\Models\Anak;
use App\Support\Umur;

/**
 * Data grafik pertumbuhan digital (PRD 5.1 sampai 5.3, 5.7; DESIGN 7.1).
 * Rentang sumbu mengikuti PRD Tabel 23 dan 24, yaitu grafik Buku KIA 2024
 * halaman buku 131 sampai 153 (PDF 67 sampai 78).
 *
 * @phpstan-import-type RiwayatUkur from HasilAntropometri
 *
 * @phpstan-type Titik array{id: int, tanggal: string, umurBulan: int, zScore: float|null, kategori: string, dariBukuKia: bool, hariIni: bool, x: float|int, y: float}
 * @phpstan-type Grafik array{judul: string, indeks: string, sumbuX: string, sumbuY: string, dariX: int, sampaiX: int, minimumY: int, maksimumY: int, intervalX: int, intervalY: int, garis: list<array{z: int, terlihat: bool, titik: list<array{x: float, y: float}>}>, titik: list<Titik>}
 */
final class GrafikPertumbuhan
{
    /** Garis z yang dihitung; zona warna memakai semua garis ini. */
    private const SEMUA_GARIS = [-3, -2, -1, 0, 1, 2, 3];

    /** BB/U dan PB/U atau TB/U hanya menampilkan −3, −2, 0, +2, +3 (PRD 5.1). */
    private const GARIS_TANPA_SATU = [-3, -2, 0, 2, 3];

    /**
     * Enam grafik untuk tab KMS, BB/U, PB/U atau TB/U, BB/PB atau BB/TB,
     * IMT/U, dan LK. Kelompok umur ditentukan pengukuran terakhir: 0–23
     * bulan grafik 0–2 tahun, 24–60 bulan grafik 2–5 tahun (PRD 5.6).
     *
     * @param  list<RiwayatUkur>  $riwayat  Urut tanggal naik.
     * @return array{kms: Grafik, bb_u: Grafik, pb_tb_u: Grafik, bb_pb_tb: Grafik, imt_u: Grafik, lk_u: Grafik}
     */
    public static function daftar(Anak $anak, array $riwayat): array
    {
        $terakhir = $riwayat === [] ? null : $riwayat[count($riwayat) - 1];
        $umurBulan = $terakhir['umurBulan'] ?? Umur::bulanPenuh($anak->tanggal_lahir);
        $balita = $umurBulan < 24;
        $jk = $anak->jenis_kelamin->value;
        $perempuan = $jk === 'P';
        [$dari, $sampai] = $balita ? [0, 24] : [24, 60];

        return [
            // KMS memuat tujuh garis; garis merah (−2) dan oranye (+1) dipakai
            // aturan rujukan (PRD 5.5). BB 1–18 kg (0–2 th), 8–28/30 kg (2–5 th).
            'kms' => self::grafikUmur(
                $jk, 'KMS', 'bb_u', $dari, $sampai,
                $balita ? 1 : 8, $balita ? 18 : ($perempuan ? 30 : 28),
                'kg', $riwayat, self::SEMUA_GARIS,
            ),
            'bb_u' => self::grafikUmur(
                $jk, 'Berat badan menurut umur', 'bb_u', $dari, $sampai,
                $balita ? 2 : ($perempuan ? 7 : 8), $balita ? 17 : ($perempuan ? 30 : 28),
                'kg', $riwayat, self::GARIS_TANPA_SATU,
            ),
            'pb_tb_u' => self::grafikUmur(
                $jk, $balita ? 'Panjang badan menurut umur' : 'Tinggi badan menurut umur', 'pb_tb_u', $dari, $sampai,
                $balita ? 45 : 80, $balita ? 95 : 125,
                'cm', $riwayat, self::GARIS_TANPA_SATU,
            ),
            'bb_pb_tb' => self::grafikBeratMenurutPanjang($jk, $balita, $riwayat),
            'imt_u' => self::grafikUmur(
                $jk, 'Indeks massa tubuh menurut umur', 'imt_u', $dari, $sampai,
                $balita ? 10 : 12, $balita ? 22 : 21,
                'kg/m²', $riwayat, self::SEMUA_GARIS,
            ),
            'lk_u' => self::grafikUmur(
                $jk, 'Lingkar kepala menurut umur', 'lk_u', 0, 60,
                30, 54,
                'cm', $riwayat, self::SEMUA_GARIS,
            ),
        ];
    }

    /**
     * @param  list<RiwayatUkur>  $riwayat
     * @param  list<int>  $garisTerlihat
     * @return Grafik
     */
    private static function grafikUmur(
        string $jenisKelamin,
        string $judul,
        string $indeks,
        int $dari,
        int $sampai,
        int $minimumY,
        int $maksimumY,
        string $satuanY,
        array $riwayat,
        array $garisTerlihat,
    ): array {
        return [
            'judul' => $judul,
            'indeks' => $indeks,
            'sumbuX' => 'Umur (bulan penuh)',
            'sumbuY' => $satuanY,
            'dariX' => $dari,
            'sampaiX' => $sampai,
            'minimumY' => $minimumY,
            'maksimumY' => $maksimumY,
            'intervalX' => $sampai - $dari > 24 ? 6 : 4,
            'intervalY' => self::intervalY($minimumY, $maksimumY),
            'garis' => StandarWho::garis($jenisKelamin, $indeks, $dari, $sampai, self::SEMUA_GARIS, garisTerlihat: $garisTerlihat),
            'titik' => self::titik(
                $riwayat,
                $indeks,
                fn (array $ukur) => $ukur['umurBulan'],
                fn (array $ukur) => match ($indeks) {
                    'bb_u' => $ukur['bb'],
                    'pb_tb_u' => $ukur['pbTbAcuan'],
                    'imt_u' => $ukur['imt'],
                    'lk_u' => $ukur['lk'],
                    default => null,
                },
            ),
        ];
    }

    /**
     * BB/PB 0–2 tahun (PB 45–110 cm, BB 2–24 kg) atau BB/TB 2–5 tahun
     * (TB 65–120 cm, BB 6–30 kg laki-laki, 6–32 kg perempuan).
     *
     * @param  list<RiwayatUkur>  $riwayat
     * @return Grafik
     */
    private static function grafikBeratMenurutPanjang(string $jenisKelamin, bool $pakaiPanjang, array $riwayat): array
    {
        $minimumX = $pakaiPanjang ? 45 : 65;
        $maksimumX = $pakaiPanjang ? 110 : 120;

        return [
            'judul' => $pakaiPanjang ? 'Berat badan menurut panjang badan' : 'Berat badan menurut tinggi badan',
            'indeks' => 'bb_pb_tb',
            'sumbuX' => $pakaiPanjang ? 'Panjang badan (cm)' : 'Tinggi badan (cm)',
            'sumbuY' => 'kg',
            'dariX' => $minimumX,
            'sampaiX' => $maksimumX,
            'minimumY' => $pakaiPanjang ? 2 : 6,
            'maksimumY' => $pakaiPanjang ? 24 : ($jenisKelamin === 'P' ? 32 : 30),
            'intervalX' => 10,
            'intervalY' => 4,
            'garis' => StandarWho::garis($jenisKelamin, 'bb_pb_tb', $minimumX, $maksimumX, self::SEMUA_GARIS, $pakaiPanjang ? 'pb' : 'tb'),
            'titik' => self::titik(
                $riwayat,
                'bb_pb_tb',
                fn (array $ukur) => $ukur['pbTbAcuan'],
                fn (array $ukur) => $ukur['bb'],
            ),
        ];
    }

    /**
     * Titik anak yang punya nilai untuk indeks ini.
     *
     * @param  list<RiwayatUkur>  $riwayat
     * @param  callable(RiwayatUkur): (int|float|null)  $x
     * @param  callable(RiwayatUkur): (float|null)  $y
     * @return list<Titik>
     */
    private static function titik(array $riwayat, string $indeks, callable $x, callable $y): array
    {
        $hasil = [];

        foreach ($riwayat as $ukur) {
            $nilaiX = $x($ukur);
            $nilaiY = $y($ukur);

            if ($nilaiX === null || $nilaiY === null) {
                continue;
            }

            $kategori = $ukur['kategori'][$indeks] ?? null;

            $hasil[] = [
                'id' => $ukur['id'],
                'tanggal' => $ukur['tanggal'],
                'umurBulan' => $ukur['umurBulan'],
                'zScore' => $ukur['zscore'][$indeks] ?? null,
                'kategori' => $kategori['label'] ?? 'Belum dapat dinilai',
                'dariBukuKia' => $ukur['dariBukuKia'],
                'hariIni' => $ukur['hariIni'],
                'x' => $nilaiX,
                'y' => $nilaiY,
            ];
        }

        return $hasil;
    }

    private static function intervalY(int $minimum, int $maksimum): int
    {
        $rentang = $maksimum - $minimum;

        return $rentang <= 16 ? 2 : ($rentang <= 32 ? 4 : 10);
    }
}
