<?php

namespace App\Gizi;

use App\Models\Anak;
use App\Models\Pengukuran;
use App\Support\Umur;
use Illuminate\Support\Collection;

/** Data grafik digital mengikuti rentang dan label Buku KIA 2024 halaman PDF 67-78. */
final class GrafikPertumbuhan
{
    /**
     * @param  Collection<int, Pengukuran>  $pengukuran
     * @return array<string, mixed>
     */
    public static function props(Anak $anak, Collection $pengukuran, ?int $ukurHariIni = null): array
    {
        $riwayat = $pengukuran
            ->sortBy(fn (Pengukuran $ukur) => [$ukur->tanggal_ukur->toDateString(), $ukur->id])
            ->values()
            ->map(fn (Pengukuran $ukur) => HasilAntropometri::riwayat($anak, $ukur, $ukurHariIni === $ukur->id))
            ->all();

        $terbaru = $riwayat === [] ? null : $riwayat[array_key_last($riwayat)];
        $umurBulan = $terbaru['umurBulan'] ?? Umur::bulanPenuh($anak->tanggal_lahir);
        $rentangAwal = $umurBulan < 24 ? 0 : 24;
        $rentangAkhir = $umurBulan < 24 ? 24 : 60;
        $jenisKelamin = $anak->jenis_kelamin->value;
        $status = self::status($terbaru);
        $statusStunting = DeteksiStunting::nilai($riwayat);

        return [
            'riwayat' => $riwayat,
            'statusGizi' => $status,
            'deteksiStunting' => [...$statusStunting, 'hasil' => $statusStunting['hasil']->value],
            'tabAwal' => self::tabPalingPerluPerhatian($status),
            'grafik' => [
                'kms' => self::grafikBerat(
                    $jenisKelamin,
                    'KMS',
                    $rentangAwal,
                    $rentangAkhir,
                    $umurBulan < 24 ? 1 : ($jenisKelamin === 'P' ? 8 : 8),
                    $jenisKelamin === 'P' && $rentangAwal === 24 ? 30 : 28,
                    $riwayat,
                    'bb_u',
                    kms: true,
                ),
                'bb_u' => self::grafikBerat(
                    $jenisKelamin,
                    'Berat badan menurut umur',
                    $rentangAwal,
                    $rentangAkhir,
                    $rentangAwal === 0 ? 2 : ($jenisKelamin === 'P' ? 7 : 8),
                    $rentangAwal === 0 ? 17 : ($jenisKelamin === 'P' ? 30 : 28),
                    $riwayat,
                    'bb_u',
                ),
                'pb_tb_u' => self::grafikUmur(
                    $jenisKelamin,
                    $umurBulan < 24 ? 'Panjang badan menurut umur' : 'Tinggi badan menurut umur',
                    'pb_tb_u',
                    $rentangAwal,
                    $rentangAkhir,
                    $rentangAwal === 0 ? 45 : 80,
                    $rentangAwal === 0 ? 95 : 125,
                    'cm',
                    $riwayat,
                    // PB/U dan TB/U hanya −3, −2, 0, +2, +3 (PRD 5.1, DESIGN 7.1).
                    garisTerlihat: [-3, -2, 0, 2, 3],
                ),
                'bb_pb_tb' => self::grafikBeratMenurutPanjang(
                    $jenisKelamin,
                    $umurBulan < 24,
                    $riwayat,
                ),
                'imt_u' => self::grafikUmur(
                    $jenisKelamin,
                    'Indeks massa tubuh menurut umur',
                    'imt_u',
                    $rentangAwal,
                    $rentangAkhir,
                    $rentangAwal === 0 ? 10 : 12,
                    $rentangAwal === 0 ? 22 : 21,
                    'kg/m²',
                    $riwayat,
                ),
                'lk_u' => self::grafikUmur(
                    $jenisKelamin,
                    'Lingkar kepala menurut umur',
                    'lk_u',
                    0,
                    60,
                    30,
                    54,
                    'cm',
                    $riwayat,
                ),
            ],
        ];
    }

    /** @param array<string, mixed>|null $terbaru @return array<string, array<string, mixed>> */
    private static function status(?array $terbaru): array
    {
        if ($terbaru === null) {
            return [];
        }

        $z = $terbaru['zscore'];
        $kategori = $terbaru['kategori'];
        $label = [
            'bb_u' => 'Berat badan menurut umur (BB/U)',
            'pb_tb_u' => $terbaru['umurBulan'] < 24 ? 'Panjang badan menurut umur (PB/U)' : 'Tinggi badan menurut umur (TB/U)',
            'bb_pb_tb' => $terbaru['umurBulan'] < 24 ? 'Berat badan menurut panjang badan (BB/PB)' : 'Berat badan menurut tinggi badan (BB/TB)',
            'imt_u' => 'IMT menurut umur (IMT/U)',
            'lk_u' => 'Lingkar kepala menurut umur (LK/U)',
            'lila' => 'Lingkar lengan atas (LiLA)',
        ];
        $hasil = [];

        foreach ($label as $indeks => $nama) {
            $kategoriSatu = $kategori[$indeks] ?? null;

            if ($kategoriSatu === null) {
                continue;
            }

            $hasil[$indeks] = [
                'indeks' => $indeks,
                'label' => $nama,
                'nilai' => $indeks === 'bb_u' ? $terbaru['bb']
                    : ($indeks === 'pb_tb_u' ? $terbaru['pbTbAcuan']
                        : ($indeks === 'bb_pb_tb' ? $terbaru['bb']
                            : ($indeks === 'imt_u' ? $terbaru['imt']
                                : ($indeks === 'lk_u' ? $terbaru['lk'] : $terbaru['lila'])))),
                'satuan' => in_array($indeks, ['bb_u', 'bb_pb_tb'], true) ? 'kg'
                    : ($indeks === 'imt_u' ? 'kg/m²' : ($indeks === 'lila' ? 'cm' : 'cm')),
                'zScore' => $z[$indeks] ?? null,
                ...$kategoriSatu,
            ];
        }

        return $hasil;
    }

    /** @param array<string, mixed> $status */
    private static function tabPalingPerluPerhatian(array $status): string
    {
        $urutan = ['bb_u', 'pb_tb_u', 'bb_pb_tb', 'imt_u', 'lk_u'];
        $terpilih = 'kms';
        $tingkatTertinggi = 0;

        foreach ($urutan as $indeks) {
            $tingkat = $status[$indeks]['tingkat'] ?? 0;

            if ($tingkat > $tingkatTertinggi) {
                $tingkatTertinggi = $tingkat;
                $terpilih = $indeks;
            }
        }

        return $terpilih;
    }

    /** @param list<array<string, mixed>> $riwayat @param list<int> $garis @param list<int> $garisTerlihat */
    private static function grafikUmur(
        string $jenisKelamin,
        string $judul,
        string $indeks,
        int $dari,
        int $sampai,
        float $minimumY,
        float $maksimumY,
        string $satuanY,
        array $riwayat,
        array $garis = [-3, -2, -1, 0, 1, 2, 3],
        array $garisTerlihat = [-3, -2, -1, 0, 1, 2, 3],
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
            'garis' => StandarWho::garis($jenisKelamin, $indeks, $dari, $sampai, $garis, garisTerlihat: $garisTerlihat),
            'titik' => self::titikUmur($riwayat, $indeks),
        ];
    }

    /** @param list<array<string, mixed>> $riwayat */
    private static function grafikBerat(
        string $jenisKelamin,
        string $judul,
        int $dari,
        int $sampai,
        float $minimumY,
        float $maksimumY,
        array $riwayat,
        string $indeks,
        bool $kms = false,
    ): array {
        $grafik = self::grafikUmur(
            $jenisKelamin,
            $judul,
            $indeks,
            $dari,
            $sampai,
            $minimumY,
            $maksimumY,
            'kg',
            $riwayat,
            [-3, -2, -1, 0, 1, 2, 3],
            // KMS memuat tujuh garis; garis merah (−2) dan oranye (+1) dipakai
            // aturan rujukan (PRD 5.5). BB/U hanya −3, −2, 0, +2, +3 (PRD 5.1).
            $kms ? [-3, -2, -1, 0, 1, 2, 3] : [-3, -2, 0, 2, 3],
        );

        $grafik['intervalY'] = $minimumY < 4 ? 2 : 4;

        return $grafik;
    }

    /** @param list<array<string, mixed>> $riwayat */
    private static function grafikBeratMenurutPanjang(string $jenisKelamin, bool $pakaiPanjang, array $riwayat): array
    {
        $cara = $pakaiPanjang ? 'pb' : 'tb';
        $minimumX = $pakaiPanjang ? 45 : 65;
        $maksimumX = $pakaiPanjang ? 110 : 120;
        $minimumY = $pakaiPanjang ? 2 : 6;
        $maksimumY = $pakaiPanjang ? 24 : ($jenisKelamin === 'P' ? 32 : 30);

        return [
            'judul' => $pakaiPanjang ? 'Berat badan menurut panjang badan' : 'Berat badan menurut tinggi badan',
            'indeks' => 'bb_pb_tb',
            'sumbuX' => $pakaiPanjang ? 'Panjang badan (cm)' : 'Tinggi badan (cm)',
            'sumbuY' => 'kg',
            'dariX' => $minimumX,
            'sampaiX' => $maksimumX,
            'minimumY' => $minimumY,
            'maksimumY' => $maksimumY,
            'intervalX' => 10,
            'intervalY' => 4,
            'garis' => StandarWho::garis(
                $jenisKelamin,
                'bb_pb_tb',
                $minimumX,
                $maksimumX,
                [-3, -2, -1, 0, 1, 2, 3],
                $cara,
            ),
            'titik' => array_values(array_filter(array_map(function (array $ukur) {
                $x = $ukur['pbTbAcuan'];

                return $x === null || $ukur['bb'] === null ? null : [
                    ...self::metadataTitik($ukur, 'bb_pb_tb'),
                    'x' => $x,
                    'y' => $ukur['bb'],
                ];
            }, $riwayat), fn ($titik) => $titik !== null)),
        ];
    }

    /** @param list<array<string, mixed>> $riwayat @return list<array<string, mixed>> */
    private static function titikUmur(array $riwayat, string $indeks): array
    {
        return array_values(array_filter(array_map(function (array $ukur) use ($indeks) {
            $nilai = match ($indeks) {
                'bb_u' => $ukur['bb'],
                'pb_tb_u' => $ukur['pbTbAcuan'],
                'imt_u' => $ukur['imt'],
                'lk_u' => $ukur['lk'],
                default => null,
            };

            return $nilai === null ? null : [
                ...self::metadataTitik($ukur, $indeks),
                'x' => $ukur['umurBulan'],
                'y' => $nilai,
            ];
        }, $riwayat), fn ($titik) => $titik !== null));
    }

    /** @param array<string, mixed> $ukur @return array<string, mixed> */
    private static function metadataTitik(array $ukur, string $indeks): array
    {
        return [
            'id' => $ukur['id'],
            'tanggal' => $ukur['tanggal'],
            'umurBulan' => $ukur['umurBulan'],
            'zScore' => $ukur['zscore'][$indeks] ?? null,
            'kategori' => $ukur['kategori'][$indeks]['label'] ?? 'Belum dapat dinilai',
            'dariBukuKia' => $ukur['dariBukuKia'],
            'hariIni' => $ukur['hariIni'],
        ];
    }

    private static function intervalY(float $minimum, float $maksimum): int
    {
        $rentang = $maksimum - $minimum;

        return $rentang <= 16 ? 2 : ($rentang <= 32 ? 4 : 10);
    }
}
