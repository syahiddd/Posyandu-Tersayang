<?php

use App\Enums\HasilDeteksiStunting;
use App\Gizi\DeteksiStunting;
use App\Gizi\StandarWho;
use App\Penyuluhan\MateriPenyuluhan;

/*
| Perhitungan gizi (PRD 5.4 sampai 5.8, NFR-08) dan rekomendasi materi
| (PRD 6.4). Nilai acuan diambil dari berkas tabel WHO di aplikasi sendiri,
| bukan diketik ulang.
*/

/** Baris L, M, S tabel WHO dari berkas data aplikasi. */
function baris_who(string $kelompok, string $indeks, int $posisi): array
{
    $data = json_decode(file_get_contents(resource_path('data/standar-antropometri-who.json')), true);
    $baris = collect($data[$kelompok][$indeks]['rows'])->firstWhere(0, $posisi);

    return [$baris[1], $baris[2], $baris[3]];
}

/** Nilai ukur pada z tertentu: M × (1 + L·S·z)^(1/L). */
function nilai_pada_z(array $lms, float $z): float
{
    [$l, $m, $s] = $lms;

    return $m * ((1 + $l * $s * $z) ** (1 / $l));
}

test('z-score sama dengan tabel WHO dengan selisih paling besar 0,01 (NFR-08)', function (string $jk, string $kelompok, string $indeks, int $posisi, float $z) {
    $nilai = nilai_pada_z(baris_who($kelompok, $indeks, $posisi), $z);

    expect(abs(StandarWho::zScore($jk, $indeks, $nilai, $posisi, perpanjangBerat: false) - $z))->toBeLessThanOrEqual(0.01);
})->with([
    'BB/U laki-laki 12 bulan, median' => ['L', 'laki', 'bb_u', 12, 0.0],
    'BB/U perempuan 30 bulan, −2 SD' => ['P', 'perempuan', 'bb_u', 30, -2.0],
    'PB/U laki-laki 365 hari, +1,5 SD' => ['L', 'laki', 'pb_tb_u', 365, 1.5],
    'TB/U perempuan 1186 hari, −2,31 SD' => ['P', 'perempuan', 'pb_tb_u', 1186, -2.31],
    'LK/U laki-laki 200 hari, +2 SD' => ['L', 'laki', 'lk_u', 200, 2.0],
]);

test('z-score berat di luar ±3 SD memakai penyesuaian WHO (PRD 5.6)', function () {
    $lms = baris_who('laki', 'bb_u', 12);
    $sd3 = nilai_pada_z($lms, 3);
    $sd2 = nilai_pada_z($lms, 2);
    $nilai = $sd3 + ($sd3 - $sd2) * 0.5;

    expect(StandarWho::zScore('L', 'bb_u', $nilai, 12))->toBe(3.5);
});

function riwayat_z(array $zPanjang, array $statusNt = [], ?float $zBerat = 0.0, int $umurAkhir = 30): array
{
    $jumlah = count($zPanjang);

    return array_map(fn (int $i) => [
        'tanggal' => today()->subMonthsNoOverflow($jumlah - 1 - $i)->toDateString(),
        'umurBulan' => $umurAkhir - ($jumlah - 1 - $i),
        'zscore' => ['pb_tb_u' => $zPanjang[$i], 'bb_u' => $i === $jumlah - 1 ? $zBerat : 0.0],
        'statusNt' => $statusNt[$i] ?? 'N',
    ], range(0, $jumlah - 1));
}

test('PB/U atau TB/U < −2 SD terdeteksi stunting dengan tindakan rujuk (PRD Tabel 28)', function () {
    $hasil = DeteksiStunting::nilai(riwayat_z([-2.31]));

    expect($hasil['hasil'])->toBe(HasilDeteksiStunting::Stunting)
        ->and($hasil['alasan'])->toBe('TB/U z −2,31 (pendek)')
        ->and($hasil['tindakan'])->toContain('Rujuk ke puskesmas');
});

test('berisiko stunting bila z −2 sampai −1 turun dua kunjungan berturut-turut', function () {
    expect(DeteksiStunting::nilai(riwayat_z([-1.1, -1.4, -1.7]))['hasil'])->toBe(HasilDeteksiStunting::BerisikoStunting)
        ->and(DeteksiStunting::nilai(riwayat_z([-1.4, -1.7]))['hasil'])->not->toBe(HasilDeteksiStunting::BerisikoStunting)
        ->and(DeteksiStunting::nilai(riwayat_z([-1.1, -1.7, -1.4]))['hasil'])->toBe(HasilDeteksiStunting::Normal);
});

test('berisiko stunting bila status T dua bulan berturut-turut atau BB/U < −2', function () {
    expect(DeteksiStunting::nilai(riwayat_z([0.1, 0.0], ['T', 'T']))['hasil'])->toBe(HasilDeteksiStunting::BerisikoStunting)
        ->and(DeteksiStunting::nilai(riwayat_z([0.1, 0.0], ['T', 'N']))['hasil'])->toBe(HasilDeteksiStunting::Normal)
        ->and(DeteksiStunting::nilai(riwayat_z([0.0], zBerat: -2.4))['hasil'])->toBe(HasilDeteksiStunting::BerisikoStunting);
});

test('tren tiga pengukuran 6 bulan terakhir diprediksi < −2 SD (PRD Tabel 28)', function () {
    // Turun ±0,3 per bulan: 3 bulan lagi sekitar −2,1.
    $riwayat = riwayat_z([-0.6, -0.9, -1.2]);
    // Hindari syarat "berisiko" (z masih di atas −1 pada pengukuran kedua).
    $riwayat[2]['zscore']['pb_tb_u'] = -0.95;
    $riwayat[1]['zscore']['pb_tb_u'] = -0.5;
    $riwayat[0]['zscore']['pb_tb_u'] = 0.05;

    $hasil = DeteksiStunting::nilai($riwayat);

    expect($hasil['hasil'])->toBe(HasilDeteksiStunting::DiprediksiBerisiko)
        ->and(DeteksiStunting::perkiraan($riwayat))->toBeLessThan(-2.0)
        ->and(DeteksiStunting::perkiraan(riwayat_z([-0.5, -0.6])))->toBeNull();
});

test('anak tanpa tanda risiko dinilai normal dengan pemantauan rutin', function () {
    $hasil = DeteksiStunting::nilai(riwayat_z([0.2, 0.1, 0.3]));

    expect($hasil['hasil'])->toBe(HasilDeteksiStunting::Normal)
        ->and($hasil['tindakan'])->toBe('Lanjutkan pemantauan rutin');
});

test('materi penyuluhan direkomendasikan sesuai kondisi anak (PRD Tabel 32)', function () {
    $normal = ['bb_u' => ['kode' => 'normal'], 'pb_tb_u' => ['kode' => 'normal']];

    expect(MateriPenyuluhan::rekomendasi(3, $normal, 'N', HasilDeteksiStunting::Normal, false))->toBe(['asi_eksklusif'])
        ->and(MateriPenyuluhan::rekomendasi(18, $normal, 'N', HasilDeteksiStunting::Normal, false))->toBe(['mpasi'])
        ->and(MateriPenyuluhan::rekomendasi(30, $normal, 'N', HasilDeteksiStunting::Normal, false))->toBe([])
        ->and(MateriPenyuluhan::rekomendasi(30, ['pb_tb_u' => ['kode' => 'pendek']], 'T', HasilDeteksiStunting::Stunting, true))
        ->toBe(['pemenuhan_gizi', 'cegah_stunting', 'imunisasi_lengkap'])
        ->and(MateriPenyuluhan::rekomendasi(30, ['imt_u' => ['kode' => 'obesitas']], 'N', HasilDeteksiStunting::Normal, false, ['demam'], ['belum_sesuai_umur']))
        ->toBe(['pola_makan_seimbang', 'perawatan_anak_sakit', 'stimulasi_motorik']);
});
