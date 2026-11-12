<?php

namespace App\Gizi;

use App\Enums\StatusNT;
use App\Models\Anak;
use App\Models\Pengukuran;
use App\Support\Umur;
use Carbon\CarbonImmutable;
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
        $statusStunting = self::deteksiStunting($riwayat);

        return [
            'riwayat' => $riwayat,
            'statusGizi' => $status,
            'deteksiStunting' => $statusStunting,
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

    /** @param list<array<string, mixed>> $riwayat @return array<string, mixed> */
    private static function deteksiStunting(array $riwayat): array
    {
        if ($riwayat === []) {
            return ['hasil' => 'normal', 'label' => 'Belum ada hasil skrining', 'perluKonfirmasi' => false, 'pesan' => null];
        }

        $valid = array_values(array_filter($riwayat, fn (array $ukur) => $ukur['zscore']['pb_tb_u'] !== null));
        $terbaru = $riwayat[array_key_last($riwayat)];
        $zTerkini = $terbaru['zscore']['pb_tb_u'];

        if ($zTerkini !== null && $zTerkini < -2) {
            return [
                'hasil' => 'stunting',
                'label' => 'Perlu konfirmasi pertumbuhan ke tenaga kesehatan',
                'perluKonfirmasi' => true,
                'pesan' => 'Hasil skrining PB/U atau TB/U berada di bawah -2 SD. Minta tenaga kesehatan mengonfirmasi hasil ukur dan tindak lanjut.',
            ];
        }

        $duaTerbaru = array_slice($riwayat, -2);
        $duaSkor = array_slice($valid, -2);
        $duaTidakNaik = count($duaTerbaru) === 2
            && $duaTerbaru[0]['statusNt'] === StatusNT::TidakNaik->value
            && $duaTerbaru[1]['statusNt'] === StatusNT::TidakNaik->value;
        $turunDuaKali = count($duaSkor) === 2
            && $duaSkor[0]['zscore']['pb_tb_u'] >= -2
            && $duaSkor[0]['zscore']['pb_tb_u'] < -1
            && $duaSkor[1]['zscore']['pb_tb_u'] < $duaSkor[0]['zscore']['pb_tb_u'];
        $bbKurang = ($terbaru['zscore']['bb_u'] ?? 0) < -2;

        if ($duaTidakNaik || $turunDuaKali || $bbKurang) {
            return [
                'hasil' => 'berisiko_stunting',
                'label' => 'Perlu pemantauan dan penyuluhan gizi',
                'perluKonfirmasi' => true,
                'pesan' => 'Hasil ini merupakan skrining. Diskusikan pemantauan bulanan dengan tenaga kesehatan.',
            ];
        }

        $batasEnamBulan = CarbonImmutable::parse($terbaru['tanggal'])->subMonths(6)->toDateString();
        $tigaSkor = array_values(array_filter(
            $valid,
            fn (array $ukur) => $ukur['tanggal'] >= $batasEnamBulan && $ukur['tanggal'] <= $terbaru['tanggal'],
        ));

        if (count($tigaSkor) >= 3) {
            $perkiraan = self::perkiraanTigaBulan($tigaSkor);

            if ($perkiraan !== null && $perkiraan < -2) {
                return [
                    'hasil' => 'diprediksi_berisiko',
                    'label' => 'Tren perlu dipantau lebih dekat',
                    'perluKonfirmasi' => true,
                    'pesan' => 'Perkiraan mengikuti tren pengukuran, bukan diagnosis. Diskusikan dengan tenaga kesehatan.',
                ];
            }
        }

        return ['hasil' => 'normal', 'label' => 'Lanjutkan pemantauan rutin', 'perluKonfirmasi' => false, 'pesan' => null];
    }

    /** @param list<array<string, mixed>> $riwayat */
    private static function perkiraanTigaBulan(array $riwayat): ?float
    {
        $x = array_map(fn (array $ukur) => $ukur['umurBulan'], $riwayat);
        $y = array_map(fn (array $ukur) => $ukur['zscore']['pb_tb_u'], $riwayat);
        $rataX = array_sum($x) / count($x);
        $rataY = array_sum($y) / count($y);
        $atas = 0.0;
        $bawah = 0.0;

        foreach ($x as $k => $nilaiX) {
            $atas += ($nilaiX - $rataX) * ($y[$k] - $rataY);
            $bawah += ($nilaiX - $rataX) ** 2;
        }

        if ($bawah === 0.0) {
            return null;
        }

        $kemiringan = $atas / $bawah;
        $bulanTarget = $x[array_key_last($x)] + 3;

        return $rataY + ($kemiringan * ($bulanTarget - $rataX));
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
            [-3, -2, 0, 2, 3],
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
