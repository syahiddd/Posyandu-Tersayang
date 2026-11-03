<?php

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Pendataan;
use App\Models\Pengukuran;
use App\Models\User;
use App\Support\MejaAktif;

/*
| Meja 3 Pendataan (PRD 4.5): FR-24 sampai FR-29, NFR-05.
*/

function buka_di_meja3(int $umurBulan = 13, array $ukur = []): Kunjungan
{
    $anak = Anak::factory()->create([
        'tanggal_lahir' => today()->subMonths($umurBulan)->toDateString(),
        'nik' => '1871010101010042',
    ]);
    $k = Kunjungan::factory()->for($anak)->diMeja(Meja::Pendataan)->create();
    Pengukuran::factory()->for($anak)->for($k)->create([
        'bb' => '13.2', 'pb_tb' => '88.0', 'cara_ukur' => 'berdiri', 'lila' => null, 'lk' => null,
        ...$ukur,
    ]);

    test()->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 3]);
    test()->post(route('kunjungan.buka', $k));

    return $k->fresh();
}

test('layar Meja 3 menampilkan hasil ukur hari ini dan NIK tersamar (FR-24, NFR-05)', function () {
    $k = buka_di_meja3();

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->component('kunjungan/pendataan')
        ->where('anak.nikSamar', '1871••••••••0042')
        ->missing('anak.nik')
        ->where('sekarang.bb', '13.2')
        ->where('sekarang.pb_tb', '88.0')
        ->where('sekarang.cara_ukur', 'berdiri')
        ->where('sekarang.lila', null));
});

test('perbandingan memakai kunjungan sebelumnya (FR-25)', function () {
    $k = buka_di_meja3();
    Pengukuran::factory()->for($k->anak)->create([
        'tanggal_ukur' => today()->subMonthNoOverflow()->toDateString(),
        'bb' => '13.0',
        'pb_tb' => '87.4',
    ]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('sebelumnya.bb', '13.0')
        ->where('sebelumnya.pb_tb', '87.4')
        ->where('penimbangan.status', 'N')
        ->where('penimbangan.kenaikanGram', 200)
        ->where('penimbangan.kbmGram', 200));
});

test('kunjungan pertama memakai data Buku KIA dari pendaftaran sebagai pembanding (kriteria 4.5)', function () {
    $k = buka_di_meja3();
    Pengukuran::factory()->dariBukuKia()->for($k->anak)->create([
        'tanggal_ukur' => today()->subWeeks(2)->toDateString(),
        'bb' => '12.9',
    ]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page->where('sebelumnya.bb', '12.9'));
});

test('tidak ada nilai ukur yang dapat diubah dari Meja 3 (kriteria 4.5)', function () {
    $k = buka_di_meja3();

    $this->put(route('kunjungan.pengukuran', $k), ['bb' => '20', 'pb_tb' => '90', 'cara_ukur' => 'berdiri'])
        ->assertSessionHasErrors(['kunjungan' => 'Anak ini tidak sedang di Meja 2.']);

    expect($k->pengukuran()->sole()->bb)->toBe('13.2');
});

test('ASI eksklusif diisi untuk umur 0–6 bulan saja (FR-27)', function (int $umur, bool $isian) {
    $k = buka_di_meja3($umur);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page->where('asi.isian', $isian));
})->with([
    '6 bulan diisi' => [6, true],
    '7 bulan hanya info' => [7, false],
]);

test('di atas 6 bulan menampilkan status ASI terakhir yang tercatat (FR-27)', function () {
    $k = buka_di_meja3(8);
    $lama = Kunjungan::factory()->for($k->anak)->selesai()->create(['tanggal' => today()->subMonths(3)->toDateString()]);
    Pendataan::factory()->for($lama)->create(['asi_eksklusif' => true]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('asi.isian', false)
        ->where('asi.terakhir.nilai', true));
});

test('"Sudah disalin ke KIA" menyimpan ASI dan meneruskan ke Meja 4 (FR-27, FR-29)', function () {
    $k = buka_di_meja3(5);

    $this->post(route('kunjungan.pendataan', $k), ['asi_eksklusif' => 'ya'])->assertRedirect(route('meja', 3));

    expect($k->pendataan()->sole())
        ->asi_eksklusif->toBeTrue()
        ->disalin_ke_kia_pada->not->toBeNull();
    expect($k->fresh())
        ->meja_saat_ini->toBe(Meja::Pelayanan)
        ->status->toBe(StatusAntrean::Menunggu)
        ->selesai_meja_3_pada->not->toBeNull();
});

test('ASI diabaikan untuk anak di atas 6 bulan', function () {
    $k = buka_di_meja3(8);

    $this->post(route('kunjungan.pendataan', $k), ['asi_eksklusif' => 'ya']);

    expect($k->pendataan()->sole()->asi_eksklusif)->toBeNull();
});

test('kembalikan ke Meja 2 wajib alasan dan menandai perlu ukur ulang (FR-28)', function () {
    $k = buka_di_meja3();

    $this->post(route('kunjungan.kembalikan', $k), ['alasan' => ''])->assertSessionHasErrors('alasan');

    $this->post(route('kunjungan.kembalikan', $k), ['alasan' => 'BB tertukar'])->assertRedirect(route('meja', 3));

    expect($k->fresh())
        ->meja_saat_ini->toBe(Meja::Pengukuran)
        ->status->toBe(StatusAntrean::Menunggu)
        ->perlu_ukur_ulang->toBeTrue()
        ->alasan_kembali->toBe('BB tertukar')
        ->selesai_meja_2_pada->toBeNull();

    $this->get(route('meja', 2))->assertInertia(fn ($page) => $page->where('antrean.0.perluUkurUlang', true));
});

test('hanya kader yang membuka anak yang boleh menyalin atau mengembalikan', function () {
    $k = buka_di_meja3();
    $this->actingAs(User::factory()->create());

    $this->post(route('kunjungan.pendataan', $k))->assertSessionHasErrors('kunjungan');
    $this->post(route('kunjungan.kembalikan', $k), ['alasan' => 'x'])->assertSessionHasErrors('kunjungan');
    expect($k->fresh()->meja_saat_ini)->toBe(Meja::Pendataan);
});

test('alur lengkap Meja 1 → 2 → 3 → antrean Meja 4', function () {
    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 1]);
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(20)]);

    $this->post(route('meja1.kirim', $anak));
    $k = $anak->kunjungan()->sole();

    $this->post(route('kunjungan.buka', $k));
    $this->put(route('kunjungan.pengukuran', $k), ['bb' => '10,2', 'pb_tb' => '80,5', 'cara_ukur' => 'telentang']);
    $this->post(route('kunjungan.buka', $k));
    $this->post(route('kunjungan.pendataan', $k));

    expect($k->fresh())
        ->meja_saat_ini->toBe(Meja::Pelayanan)
        ->selesai_meja_1_pada->not->toBeNull()
        ->selesai_meja_2_pada->not->toBeNull()
        ->selesai_meja_3_pada->not->toBeNull();

    $this->get(route('beranda'))->assertInertia(fn ($page) => $page
        ->where('ringkasan.terdaftar', 1)
        ->where('ringkasan.sudahDitimbang', 1)
        ->where('antrean.3.menunggu', 1));
});
