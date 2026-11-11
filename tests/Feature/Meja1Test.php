<?php

use App\Enums\Meja;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\User;
use App\Support\MejaAktif;

/*
| Meja 1 Pendaftaran (PRD 4.3): FR-10 sampai FR-17, PRD 7.2, NFR-05.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 1]);
});

function data_anak(array $ganti = []): array
{
    return [
        'nama' => 'Nayla Putri',
        'jenis_kelamin' => 'P',
        'tempat_lahir' => 'Bandar Lampung',
        'tanggal_lahir' => today()->subMonths(18)->toDateString(),
        'nik' => '1871010101010042',
        'punya_buku_kia' => '1',
        'nama_ibu' => 'Dewi Sartika',
        'nik_ibu' => '1871010101010001',
        'nama_ayah' => 'Budi',
        'nik_ayah' => '',
        'no_hp' => '0812-3456-7890',
        'alamat' => 'Jl. Melati No. 5',
        'rt' => '3',
        'rw' => '1',
        'dusun' => 'Dusun Melati',
        ...$ganti,
    ];
}

function cari(string $kata)
{
    return test()->get(route('meja', 1).'?cari='.urlencode($kata));
}

test('Meja 1 menampilkan pencarian; kurang dari 3 huruf belum mencari (PRD 4.3)', function () {
    Anak::factory()->create(['nama' => 'Nayla Putri']);

    $this->get(route('meja', 1))->assertOk()->assertInertia(fn ($page) => $page
        ->component('meja/pendaftaran')
        ->where('cukupUntukMencari', false)
        ->has('hasil', 0));

    cari('na')->assertInertia(fn ($page) => $page->where('cukupUntukMencari', false)->has('hasil', 0));
});

test('sebagian nama minimal 3 huruf menampilkan semua anak yang namanya mengandung huruf itu', function () {
    Anak::factory()->create(['nama' => 'Nayla Putri']);
    Anak::factory()->create(['nama' => 'Dinayah']);
    Anak::factory()->create(['nama' => 'Raka Pratama']);

    cari('nay')->assertInertia(fn ($page) => $page->has('hasil', 2));
});

test('mencari dengan nama ibu, NIK anak, NIK ibu, dan kombinasinya (FR-14)', function () {
    $nayla = Anak::factory()->create(['nama' => 'Nayla Putri', 'nama_ibu' => 'Dewi', 'nik' => '1871010101010042', 'nik_ibu' => '1871020202020001']);
    Anak::factory()->create(['nama' => 'Nayla Sari', 'nama_ibu' => 'Rina', 'nik' => null, 'nik_ibu' => null]);

    cari('dewi')->assertInertia(fn ($page) => $page->has('hasil', 1)->where('hasil.0.id', $nayla->id));
    cari('0042')->assertInertia(fn ($page) => $page->has('hasil', 1)->where('hasil.0.id', $nayla->id));
    cari('18710202')->assertInertia(fn ($page) => $page->has('hasil', 1)->where('hasil.0.id', $nayla->id));
    cari('nayla')->assertInertia(fn ($page) => $page->has('hasil', 2));
    cari('nayla rina')->assertInertia(fn ($page) => $page->has('hasil', 1)->where('hasil.0.nama', 'Nayla Sari'));
});

test('hasil pencarian memakai NIK tersamar dan menandai anak yang sudah diantre (FR-15, NFR-05)', function () {
    $anak = Anak::factory()->create(['nama' => 'Nayla Putri', 'nik' => '1871010101010042']);
    Kunjungan::factory()->for($anak)->create(['tanggal' => today()->subMonth()->toDateString(), 'nomor_antrean' => 1]);
    Kunjungan::factory()->for($anak)->create(['nomor_antrean' => 2]);

    cari('nayla')->assertInertia(fn ($page) => $page
        ->where('hasil.0.nikSamar', '1871••••••••0042')
        ->where('hasil.0.sudahDiAntrean', true)
        ->where('hasil.0.kunjunganTerakhir', today()->locale('id')->translatedFormat('j M Y'))
        ->missing('hasil.0.nik'));
});

test('tambah anak menyimpan data dan ukuran Buku KIA dengan koma desimal (FR-10)', function () {
    $this->post(route('meja1.simpan'), data_anak([
        'ukur_tanggal' => today()->subMonth()->toDateString(),
        'ukur_bb' => '8,5',
        'ukur_pb_tb' => '72.0',
    ]))->assertRedirect();

    $anak = Anak::query()->where('nama', 'Nayla Putri')->sole();
    expect($anak->no_hp)->toBe('081234567890')
        ->and($anak->nik)->toBe('1871010101010042')
        ->and($anak->punya_buku_kia)->toBeTrue();

    $pengukuran = $anak->pengukuran()->sole();
    expect($pengukuran->sumber)->toBe(SumberData::BukuKia)
        ->and($pengukuran->bb)->toBe('8.5')
        ->and($pengukuran->pb_tb)->toBe('72.0')
        ->and($pengukuran->kunjungan_id)->toBeNull();

    $this->get(route('meja1.anak', $anak))->assertOk()->assertInertia(fn ($page) => $page->component('meja1/anak-tersimpan'));
});

test('tanpa ukuran Buku KIA tidak membuat data pengukuran', function () {
    $this->post(route('meja1.simpan'), data_anak());

    expect(Anak::query()->sole()->pengukuran()->count())->toBe(0);
});

test('isian wajib dan aturan PRD 7.2 divalidasi', function (array $ganti, string $isian) {
    $this->post(route('meja1.simpan'), data_anak($ganti))->assertSessionHasErrors($isian);

    expect(Anak::query()->count())->toBe(0);
})->with([
    'nama kosong' => [['nama' => ''], 'nama'],
    'jenis kelamin kosong' => [['jenis_kelamin' => ''], 'jenis_kelamin'],
    'tanggal lahir besok' => [['tanggal_lahir' => today()->addDay()->toDateString()], 'tanggal_lahir'],
    'nama ibu kosong' => [['nama_ibu' => ''], 'nama_ibu'],
    'NIK 15 digit' => [['nik' => '187101010101004'], 'nik'],
    'NIK berhuruf' => [['nik' => '18710101010100AB'], 'nik'],
    'NIK ibu 17 digit' => [['nik_ibu' => '18710101010100011'], 'nik_ibu'],
    'HP diawali 07' => [['no_hp' => '0712345678'], 'no_hp'],
    'HP terlalu pendek' => [['no_hp' => '081234567'], 'no_hp'],
    'HP terlalu panjang' => [['no_hp' => '08123456789012'], 'no_hp'],
    'RT bukan angka' => [['rt' => 'tiga'], 'rt'],
    'alamat kosong' => [['alamat' => ''], 'alamat'],
    'dusun kosong' => [['dusun' => ''], 'dusun'],
    'punya Buku KIA belum dipilih' => [['punya_buku_kia' => ''], 'punya_buku_kia'],
    'BB di atas 35' => [['ukur_tanggal' => today()->toDateString(), 'ukur_bb' => '35,1'], 'ukur_bb'],
    'PB di bawah 40' => [['ukur_tanggal' => today()->toDateString(), 'ukur_pb_tb' => '39,9'], 'ukur_pb_tb'],
    'dua angka di belakang koma' => [['ukur_tanggal' => today()->toDateString(), 'ukur_bb' => '8,55'], 'ukur_bb'],
    'ukur tanpa tanggal' => [['ukur_bb' => '8,5'], 'ukur_tanggal'],
    'ukur sebelum lahir' => [['ukur_tanggal' => today()->subYears(3)->toDateString(), 'ukur_bb' => '8,5'], 'ukur_tanggal'],
]);

test('nomor HP +62 diterima', function () {
    $this->post(route('meja1.simpan'), data_anak(['no_hp' => '+6281234567890']))->assertSessionHasNoErrors();
});

test('pesan batas nilai memakai koma desimal dan satuan', function () {
    $this->post(route('meja1.simpan'), data_anak(['ukur_tanggal' => today()->toDateString(), 'ukur_pb_tb' => '7,2']))
        ->assertSessionHasErrors(['ukur_pb_tb' => 'Isi antara 40,0 dan 130,0 cm.']);
});

test('NIK yang sudah terdaftar ditolak dan data anak pemiliknya ditampilkan (FR-11)', function () {
    $lama = Anak::factory()->create(['nama' => 'Anak Lama', 'nik' => '1871010101010042']);

    $this->post(route('meja1.simpan'), data_anak())
        ->assertSessionHasErrors('nik')
        ->assertSessionHas('anakSamaNik', fn (array $anak) => $anak['id'] === $lama->id);

    expect(Anak::query()->count())->toBe(1);
});

test('data mirip memunculkan peringatan, lalu bisa tetap disimpan (FR-12)', function () {
    $lama = Anak::factory()->create([
        'nama' => 'Nayla Putri',
        'tanggal_lahir' => today()->subMonths(18)->toDateString(),
        'nama_ibu' => 'dewi sartika',
        'nik' => null,
    ]);

    $this->post(route('meja1.simpan'), data_anak(['nik' => '']))
        ->assertSessionHas('kemiripan', fn (array $mirip) => $mirip[0]['id'] === $lama->id);
    expect(Anak::query()->count())->toBe(1);

    $this->post(route('meja1.simpan'), data_anak(['nik' => '', 'abaikan_kemiripan' => true]))->assertRedirect();
    expect(Anak::query()->count())->toBe(2);
});

test('Lanjutkan ke Meja 2 membuka kunjungan dan kembali ke awal Meja 1 (FR-13, FR-16, FR-17)', function () {
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(18)]);

    $this->post(route('meja1.kirim', $anak))->assertRedirect(route('meja', 1));

    $kunjungan = $anak->kunjungan()->sole();
    expect($kunjungan->meja_saat_ini)->toBe(Meja::Pengukuran)
        ->and($kunjungan->nomor_antrean)->toBe(1);

    $this->post(route('meja1.kirim', $anak))->assertSessionHasErrors(['kunjungan' => 'Anak ini sudah ada di antrean hari ini.']);
});

test('anak lebih dari 60 bulan tidak dapat dikirim ke antrean (PRD 7.2)', function () {
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(61)]);

    $this->post(route('meja1.kirim', $anak))->assertSessionHasErrors('kunjungan');

    expect($anak->kunjungan()->count())->toBe(0);
});

test('Batal setelah mengirim ke Meja 2 menghapus kunjungan baru', function () {
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(18)]);
    $this->post(route('meja1.kirim', $anak));

    $this->post(route('antrean.urungkan'));

    expect($anak->kunjungan()->count())->toBe(0)
        ->and(Anak::query()->count())->toBe(1);
});
