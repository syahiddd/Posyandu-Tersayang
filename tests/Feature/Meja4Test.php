<?php

use App\Enums\JenisLayanan;
use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Layanan;
use App\Models\User;
use App\Support\MejaAktif;

/*
| Meja 4 Pelayanan (PRD 4.6): FR-30 sampai FR-36; jadwal PRD 6.1 dan 6.2,
| batas umur imunisasi kejar dari Buku KIA 2024 halaman 125.
*/

afterEach(fn () => $this->travelBack());

/** @param  list<string>  $sudah  Dosis yang sudah tercatat dari Buku KIA. */
function buka_di_meja4(int $umurBulan = 18, array $sudah = []): Kunjungan
{
    $anak = Anak::factory()->create([
        'tanggal_lahir' => today()->subMonths($umurBulan)->toDateString(),
    ]);

    foreach ($sudah as $dosis) {
        Layanan::factory()->for($anak)->create([
            'detail' => $dosis,
            'tanggal' => today()->subMonth()->toDateString(),
            'nomor_batch' => null,
        ]);
    }

    $k = Kunjungan::factory()->for($anak)->diMeja(Meja::Pelayanan)->create();

    test()->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 4]);
    test()->post(route('kunjungan.buka', $k));

    return $k->fresh();
}

/** Semua dosis sebelum 18 bulan (PRD Tabel 29), kecuali JE. */
function dosis_sampai_12_bulan(): array
{
    return [
        'HB0', 'BCG', 'OPV 1', 'DPT-HB-Hib 1', 'OPV 2', 'PCV 1', 'RV 1',
        'DPT-HB-Hib 2', 'OPV 3', 'PCV 2', 'RV 2', 'DPT-HB-Hib 3', 'OPV 4',
        'IPV 1', 'RV 3', 'MR 1', 'IPV 2', 'JE', 'PCV 3',
    ];
}

function isian_meja4(array $ubah = []): array
{
    return [
        'tanggal' => today()->toDateString(),
        'imunisasi' => [],
        'vitamin_a' => '',
        'obat_cacing' => false,
        'catatan_pelayanan' => '',
        'catatan_penyuluhan' => '',
        ...$ubah,
    ];
}

test('layar Meja 4 menawarkan imunisasi jatuh tempo sesuai umur dalam keadaan tercentang (FR-30)', function () {
    $k = buka_di_meja4(18, dosis_sampai_12_bulan());

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->component('kunjungan/pelayanan')
        ->has('jatuhTempo', 2)
        ->where('jatuhTempo.0.kode', 'DPT-HB-Hib 4')
        ->where('jatuhTempo.0.alasan', 'Umur 18 bulan')
        ->where('jatuhTempo.0.terlambat', false)
        ->where('jatuhTempo.0.tercentang', true)
        ->where('jatuhTempo.1.kode', 'MR 2')
        ->where('nilaiAwal', null));
});

test('dosis yang sudah tercatat tidak ditawarkan lagi (kriteria 4.6)', function () {
    $k = buka_di_meja4(18, [...dosis_sampai_12_bulan(), 'MR 2']);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->has('jatuhTempo', 1)
        ->where('jatuhTempo.0.kode', 'DPT-HB-Hib 4'));

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4([
        'imunisasi' => [['kode' => 'MR 2', 'batch' => '']],
    ]))->assertSessionHasErrors('imunisasi.0.kode');

    expect($k->layanan()->count())->toBe(0);
});

test('imunisasi yang terlambat ditawarkan sebagai kejar, satu dosis per rangkaian (FR-30)', function () {
    $k = buka_di_meja4(5, ['HB0', 'BCG', 'OPV 1', 'DPT-HB-Hib 1', 'OPV 2', 'PCV 1']);

    $this->get(route('kunjungan.layar', $k))->assertInertia(function ($page) {
        $page->where('jatuhTempo', fn ($daftar) => collect($daftar)->pluck('kode')->all() === [
            'RV 1', 'DPT-HB-Hib 2', 'OPV 3', 'PCV 2', 'IPV 1',
        ]);
        $page->where('jatuhTempo.0.terlambat', true);
        $page->where('jatuhTempo.0.alasan', 'Imunisasi kejar · jadwal umur 2 bulan');
    });
});

test('imunisasi di luar batas umur Buku KIA tidak ditawarkan (PRD 6.1)', function () {
    // 12 bulan tanpa riwayat: HB0, BCG, dan rotavirus sudah lewat batas umurnya.
    $k = buka_di_meja4(12);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('jatuhTempo', function ($daftar) {
            $kode = collect($daftar)->pluck('kode');

            return $kode->intersect(['HB0', 'BCG', 'RV 1', 'RV 2', 'RV 3'])->isEmpty()
                && $kode->contains('OPV 1')
                && $kode->contains('MR 1');
        }));
});

test('JE khusus daerah endemis ditawarkan tanpa centang bawaan', function () {
    $k = buka_di_meja4(10, array_diff(dosis_sampai_12_bulan(), ['JE', 'PCV 3']));

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->has('jatuhTempo', 1)
        ->where('jatuhTempo.0.kode', 'JE')
        ->where('jatuhTempo.0.tercentang', false));
});

test('vitamin A dan obat cacing tidak ditampilkan sebelum umur minimalnya (kriteria 4.6)', function () {
    $this->travelTo(today()->setDate(2026, 8, 10));
    $k = buka_di_meja4(5);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('vitaminA', null)
        ->where('obatCacing', null));

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4([
        'vitamin_a' => 'Kapsul biru',
        'obat_cacing' => true,
    ]))->assertSessionHasErrors(['vitamin_a', 'obat_cacing']);
});

test('vitamin A dapat dicentang pada Februari dan Agustus sesuai umur (FR-33)', function (int $umur, string $kapsul) {
    $this->travelTo(today()->setDate(2026, 8, 10));
    $k = buka_di_meja4($umur);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('vitaminA.pilihan.kode', $kapsul)
        ->where('vitaminA.info', null));
})->with([[8, 'Kapsul biru'], [30, 'Kapsul merah']]);

test('di luar bulan pemberian, vitamin A menampilkan jadwal berikutnya (FR-33)', function () {
    $this->travelTo(today()->setDate(2026, 11, 12));
    $k = buka_di_meja4(18);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('vitaminA.pilihan', null)
        ->where('vitaminA.info', 'Kapsul merah berikutnya: Februari 2027'));
});

test('obat cacing menampilkan pemberian terakhir dan jatah tahun ini (FR-34)', function () {
    $this->travelTo(today()->setDate(2026, 11, 12));
    $k = buka_di_meja4(18);
    Layanan::factory()->for($k->anak)->create([
        'jenis' => JenisLayanan::ObatCacing,
        'detail' => 'Obat cacing',
        'tanggal' => '2026-05-12',
    ]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('obatCacing.boleh', true)
        ->where('obatCacing.keterangan', 'Terakhir 12 Mei 2026 · jatah ke-2 dari 2 tahun ini'));
});

test('obat cacing tidak dapat dicatat lagi setelah dua kali dalam setahun (FR-34)', function () {
    $this->travelTo(today()->setDate(2026, 11, 12));
    $k = buka_di_meja4(30);

    foreach (['2026-02-10', '2026-08-11'] as $tanggal) {
        Layanan::factory()->for($k->anak)->create([
            'jenis' => JenisLayanan::ObatCacing,
            'detail' => 'Obat cacing',
            'tanggal' => $tanggal,
        ]);
    }

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page->where('obatCacing.boleh', false));
    $this->post(route('kunjungan.pelayanan', $k), isian_meja4(['obat_cacing' => true]))
        ->assertSessionHasErrors('obat_cacing');
});

test('riwayat menampilkan dua tanggal imunisasi terakhir (FR-31)', function () {
    $k = buka_di_meja4(18);
    $anak = $k->anak;

    Layanan::factory()->for($anak)->create(['detail' => 'PCV 3', 'tanggal' => today()->subMonths(6)->toDateString()]);
    Layanan::factory()->for($anak)->create(['detail' => 'MR 1', 'tanggal' => today()->subMonths(9)->toDateString()]);
    Layanan::factory()->for($anak)->create(['detail' => 'IPV 2', 'tanggal' => today()->subMonths(9)->toDateString()]);
    Layanan::factory()->for($anak)->create(['detail' => 'BCG', 'tanggal' => today()->subMonths(17)->toDateString()]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->has('riwayatTerakhir', 2)
        ->where('riwayatTerakhir.0.vaksin', 'PCV 3')
        ->where('riwayatTerakhir.1.vaksin', 'IPV 2, MR 1')
        ->has('semuaRiwayat', 3));
});

test('simpan mencatat layanan dan catatan lalu mengirim anak ke antrean Meja 5 (FR-32, FR-35, FR-36)', function () {
    $this->travelTo(today()->setDate(2026, 8, 10));
    $k = buka_di_meja4(18, dosis_sampai_12_bulan());

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4([
        'imunisasi' => [
            ['kode' => 'DPT-HB-Hib 4', 'batch' => ' AB1234 '],
            ['kode' => 'MR 2', 'batch' => ''],
        ],
        'vitamin_a' => 'Kapsul merah',
        'obat_cacing' => true,
        'catatan_pelayanan' => 'Imunisasi di paha kiri',
        'catatan_penyuluhan' => 'Anak sedikit demam',
    ]))->assertRedirect(route('meja', 4))->assertSessionHasNoErrors();

    $k->refresh();

    expect($k->meja_saat_ini)->toBe(Meja::Penyuluhan)
        ->and($k->status)->toBe(StatusAntrean::Menunggu)
        ->and($k->selesai_meja_4_pada)->not->toBeNull()
        ->and($k->catatan_pelayanan)->toBe('Imunisasi di paha kiri')
        ->and($k->catatan_penyuluhan)->toBe('Anak sedikit demam');

    $layanan = $k->layanan()->orderBy('id')->get();

    expect($layanan->pluck('detail')->all())->toBe(['DPT-HB-Hib 4', 'MR 2', 'Kapsul merah', 'Obat cacing'])
        ->and($layanan[0]->nomor_batch)->toBe('AB1234')
        ->and($layanan[1]->nomor_batch)->toBeNull()
        ->and($layanan[0]->tanggal->toDateString())->toBe('2026-08-10')
        ->and($layanan[2]->jenis)->toBe(JenisLayanan::VitaminA)
        ->and($layanan[3]->jenis)->toBe(JenisLayanan::ObatCacing)
        ->and($layanan->every(fn (Layanan $satu) => $satu->anak_id === $k->anak_id))->toBeTrue();
});

test('simpan tanpa layanan tetap meneruskan anak ke Meja 5 (DESIGN 5.6)', function () {
    $k = buka_di_meja4(18);

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4())->assertRedirect(route('meja', 4));

    expect($k->fresh()->meja_saat_ini)->toBe(Meja::Penyuluhan)
        ->and($k->layanan()->count())->toBe(0);
});

test('tanggal pemberian tidak boleh setelah hari ini atau sebelum lahir (FR-32)', function () {
    $k = buka_di_meja4(18);

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4(['tanggal' => today()->addDay()->toDateString()]))
        ->assertSessionHasErrors('tanggal');
    $this->post(route('kunjungan.pelayanan', $k), isian_meja4(['tanggal' => today()->subYears(3)->toDateString()]))
        ->assertSessionHasErrors('tanggal');

    expect($k->fresh()->meja_saat_ini)->toBe(Meja::Pelayanan);
});

test('Batal lalu simpan ulang mengganti layanan kunjungan ini, tidak menggandakan', function () {
    $k = buka_di_meja4(18, dosis_sampai_12_bulan());

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4([
        'imunisasi' => [['kode' => 'DPT-HB-Hib 4', 'batch' => 'A1'], ['kode' => 'MR 2', 'batch' => '']],
    ]));
    $this->post(route('antrean.urungkan'));

    $k->refresh();
    expect($k->meja_saat_ini)->toBe(Meja::Pelayanan);

    // Layar dibuka lagi: dosis kunjungan ini tetap ditawarkan dan isian terisi.
    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->has('jatuhTempo', 2)
        ->where('nilaiAwal.imunisasi.0.kode', 'DPT-HB-Hib 4')
        ->where('nilaiAwal.imunisasi.0.batch', 'A1'));

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4([
        'imunisasi' => [['kode' => 'MR 2', 'batch' => '']],
    ]))->assertSessionHasNoErrors();

    expect($k->layanan()->pluck('detail')->all())->toBe(['MR 2']);
});

test('Tunda di Meja 4 menyimpan isian sebagai draf (FR-47, FR-48)', function () {
    $k = buka_di_meja4(18, dosis_sampai_12_bulan());
    $draf = isian_meja4([
        'imunisasi' => [['kode' => 'MR 2', 'batch' => 'B7']],
        'catatan_penyuluhan' => 'Ibu minta jadwal ulang',
    ]);

    $this->post(route('kunjungan.tunda', $k), ['draf' => $draf]);
    $this->post(route('kunjungan.lanjutkan', $k));
    $this->post(route('kunjungan.buka', $k));

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('nilaiAwal.imunisasi.0.kode', 'MR 2')
        ->where('nilaiAwal.imunisasi.0.batch', 'B7')
        ->where('nilaiAwal.catatan_penyuluhan', 'Ibu minta jadwal ulang'));
});

test('kader yang tidak memegang anak tidak dapat menyimpan pelayanan', function () {
    $k = buka_di_meja4(18);

    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 4]);

    $this->post(route('kunjungan.pelayanan', $k), isian_meja4())->assertSessionHasErrors('kunjungan');

    expect($k->fresh()->meja_saat_ini)->toBe(Meja::Pelayanan);
});
