<?php

use App\Kia\PanduanKia;

/*
|--------------------------------------------------------------------------
| Panduan KIA (Buku KIA 2024)
|--------------------------------------------------------------------------
|
| Isi config/kia.php disalin dari Buku KIA 2024. Tes ini menjaga aturan
| pemilihan bagian menurut umur dan status gizi, bukan isi teksnya.
|
*/

test('anjuran umur dipilih menurut kelompok umur Buku KIA', function (int $umur, string $label) {
    expect(PanduanKia::anjuranUmur($umur)['label'] ?? null)->toBe($label);
})->with([
    'bayi baru lahir' => [0, 'Bayi baru lahir (0–28 hari)'],
    'bayi 1 bulan' => [1, 'Bayi 1–5 bulan'],
    'batas ASI eksklusif' => [5, 'Bayi 1–5 bulan'],
    'mulai MPASI' => [6, 'Bayi 6–8 bulan'],
    'bayi 9 bulan' => [9, 'Bayi 9–11 bulan'],
    'baduta' => [12, 'Anak 12–23 bulan'],
    'batas baduta' => [23, 'Anak 12–23 bulan'],
    'balita' => [24, 'Anak 2–5 tahun'],
    'batas balita' => [60, 'Anak 2–5 tahun'],
]);

test('tanda bahaya bayi baru lahir tidak memakai daftar balita (Buku KIA hlm. 40–41)', function () {
    $baruLahir = PanduanKia::tandaBahaya(0);
    $balita = PanduanKia::tandaBahaya(1);

    expect($baruLahir['label'])->toBe('Bayi baru lahir (0–28 hari)')
        ->and($baruLahir['daftar'])->toContain('Tidak mau menyusu')
        ->and($balita['label'])->toBe('Balita 29 hari – 5 tahun')
        ->and($balita['daftar'])->toContain('Tidak bisa minum');
});

test('porsi MPASI mengikuti umur anak', function (int $umur, ?string $label) {
    expect(PanduanKia::porsiMpasi($umur)['label'] ?? null)->toBe($label);
})->with([
    'sebelum 6 bulan' => [5, null],
    '6–8 bulan' => [6, '6–8 bulan'],
    '9–11 bulan' => [11, '9–11 bulan'],
    '12–23 bulan' => [12, '12–23 bulan'],
    'setelah 23 bulan' => [24, null],
]);

test('tindak lanjut hanya untuk status gizi di luar normal dan urut paling berat', function () {
    $statusGizi = [
        ['indeks' => 'bb_u', 'label' => 'BB/U', 'kode' => 'kurang', 'kategori' => 'Berat badan kurang', 'varian' => 'bahaya', 'tingkat' => 4],
        ['indeks' => 'pb_tb_u', 'label' => 'PB/U', 'kode' => 'normal', 'kategori' => 'Normal', 'varian' => 'normal', 'tingkat' => 0],
        ['indeks' => 'bb_pb_tb', 'label' => 'BB/PB', 'kode' => 'gizi_buruk', 'kategori' => 'Gizi buruk', 'varian' => 'bahaya-berat', 'tingkat' => 5],
    ];

    $hasil = PanduanKia::tindakLanjut(10, $statusGizi);

    expect($hasil)->toHaveCount(2)
        ->and($hasil[0]['kode'])->toBe('gizi_buruk')
        ->and($hasil[0]['tingkat'])->toBe('rujuk')
        ->and($hasil[1]['kode'])->toBe('kurang')
        ->and($hasil[1]['tingkat'])->toBe('tindak_lanjut')
        // Anjuran umur ikut menempel pada setiap tindak lanjut.
        ->and($hasil[0]['anjuran'])->not->toBeEmpty()
        ->and($hasil[0]['halamanAnjuran'])->toBe('Buku KIA hlm. 56–65');
});

test('gizi buruk pada BB/TB dan IMT/U digabung menjadi satu tindak lanjut', function () {
    $statusGizi = [
        ['indeks' => 'bb_pb_tb', 'label' => 'BB/PB', 'kode' => 'gizi_buruk', 'kategori' => 'Gizi buruk', 'varian' => 'bahaya-berat', 'tingkat' => 5],
        ['indeks' => 'imt_u', 'label' => 'IMT/U', 'kode' => 'gizi_buruk', 'kategori' => 'Gizi buruk', 'varian' => 'bahaya-berat', 'tingkat' => 5],
    ];

    $hasil = PanduanKia::tindakLanjut(30, $statusGizi);

    expect($hasil)->toHaveCount(1)
        ->and($hasil[0]['label'])->toBe('BB/PB & IMT/U')
        ->and($hasil[0]['tindakan'])->toContain('Rujuk ke puskesmas hari ini untuk konfirmasi dan tata laksana gizi buruk.');
});

test('setiap tindak lanjut punya sumber halaman Buku KIA', function () {
    foreach ((array) config('kia.tindak_lanjut') as $kode => $aturan) {
        expect($aturan['sumber'] ?? null)->not->toBeEmpty("Tindak lanjut {$kode} belum punya sumber.");
        expect($aturan['tindakan'])->not->toBeEmpty("Tindak lanjut {$kode} belum punya tindakan.");
    }
});

test('stimulasi mengikuti sebelas kelompok umur Buku KIA', function (int $umur, string $label) {
    expect(PanduanKia::stimulasi($umur)['label'] ?? null)->toBe($label);
})->with([
    'bayi baru lahir' => [0, '0–28 hari'],
    '29 hari' => [1, '29 hari–3 bulan'],
    'batas 3 bulan' => [2, '29 hari–3 bulan'],
    '3 bulan' => [3, '3–6 bulan'],
    'mulai MPASI' => [6, '6–9 bulan'],
    '9 bulan' => [9, '9–12 bulan'],
    '12 bulan' => [12, '12–18 bulan'],
    '18 bulan' => [18, '18–24 bulan'],
    '2 tahun' => [24, '2–3 tahun'],
    '3 tahun' => [36, '3–4 tahun'],
    '4 tahun' => [48, '4–5 tahun'],
    '5 tahun' => [60, '5–6 tahun'],
]);

test('setiap umur 0–60 bulan punya anjuran, tanda bahaya, dan stimulasi', function () {
    $tanpa = [];

    for ($umur = 0; $umur <= 60; $umur++) {
        if (PanduanKia::anjuranUmur($umur) === null) {
            $tanpa[] = "anjuran {$umur}";
        }

        if (PanduanKia::tandaBahaya($umur) === null) {
            $tanpa[] = "tanda bahaya {$umur}";
        }

        if (PanduanKia::stimulasi($umur) === null) {
            $tanpa[] = "stimulasi {$umur}";
        }
    }

    expect($tanpa)->toBe([]);
});

test('kelompok stimulasi berurutan dan tidak tumpang tindih', function () {
    $kelompok = (array) config('kia.stimulasi');

    expect($kelompok[0]['dari'])->toBe(0);

    foreach ($kelompok as $indeks => $satu) {
        expect($satu['daftar'])->not->toBeEmpty("Stimulasi {$satu['label']} belum punya daftar.")
            ->and($satu['halaman'])->not->toBeEmpty("Stimulasi {$satu['label']} belum punya halaman.");

        if ($indeks === 0) {
            continue;
        }

        // Kelompok berikutnya mulai tepat setelah kelompok sebelumnya.
        expect($satu['dari'])->toBe($kelompok[$indeks - 1]['sampai'] + 1);
    }
});

test('anjuranUntukUmur mengembalikan daftar anjuran kelompok umur anak', function () {
    $anjuran = PanduanKia::anjuranUntukUmur(7);

    expect($anjuran)->not->toBeEmpty()
        ->and($anjuran)->toContain('Mulai MPASI lumat dan kental 2–3 kali makanan utama serta 1–2 kali makanan selingan setiap hari.')
        // Umur di luar jangkauan tidak melempar galat, hanya kosong.
        ->and(PanduanKia::anjuranUntukUmur(61))->toBe([]);
});

test('halaman() memuat seluruh bagian yang dipakai halaman Panduan KIA', function () {
    $halaman = PanduanKia::halaman(7);

    expect($halaman)->toHaveKeys([
        'umurBulan',
        'asi',
        'mpasi',
        'porsiMpasi',
        'anjuranUmur',
        'anjuranSemua',
        'tandaBahaya',
        'tandaBahayaSemua',
        'pemantauanBulanan',
        'perawatanSakit',
        'cairan',
        'gigi',
        'stimulasi',
        'stimulasiSemua',
        'tidur',
        'tindakLanjut',
        'tindakLanjutLila',
    ])
        ->and($halaman['umurBulan'])->toBe(7)
        ->and($halaman['porsiMpasi']['label'])->toBe('6–8 bulan')
        ->and($halaman['stimulasi']['label'])->toBe('6–9 bulan')
        ->and($halaman['tindakLanjut'])->not->toBeEmpty();
});

test('setiap kategori tindak lanjut memakai tingkat yang dikenal', function () {
    foreach ((array) config('kia.tindak_lanjut') as $kode => $aturan) {
        expect($aturan['tingkat'])->toBeIn(['rujuk', 'tindak_lanjut', 'pantau'], "Tingkat {$kode} tidak dikenal.");
    }
});
