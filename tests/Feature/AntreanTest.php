<?php

use App\Antrean\LayananAntrean;
use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Events\AntreanBerubah;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\User;
use App\Support\MejaAktif;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\ValidationException;

/*
| Antrean lima meja: PRD 3.2–3.3, FR-16, FR-47 sampai FR-49, DESIGN Prinsip 1.
*/

function kader(int $meja = 2): User
{
    $user = User::factory()->create();
    test()->actingAs($user)->withSession([MejaAktif::KUNCI_SESI => $meja]);

    return $user;
}

function antrean(): LayananAntrean
{
    return app(LayananAntrean::class);
}

test('membuka kunjungan memberi nomor antrean berurutan per hari dan masuk Meja 2', function () {
    Event::fake([AntreanBerubah::class]);
    [$a, $b, $c] = Anak::factory()->count(3)->create(['tanggal_lahir' => today()->subMonths(10)])->all();

    expect(antrean()->bukaKunjungan($a)->nomor_antrean)->toBe(1)
        ->and(antrean()->bukaKunjungan($b)->nomor_antrean)->toBe(2)
        ->and(antrean()->bukaKunjungan($c)->nomor_antrean)->toBe(3);

    $kunjungan = $a->kunjungan()->first();
    expect($kunjungan->meja_saat_ini)->toBe(Meja::Pengukuran)
        ->and($kunjungan->status)->toBe(StatusAntrean::Menunggu)
        ->and($kunjungan->selesai_meja_1_pada)->not->toBeNull();

    Event::assertDispatched(AntreanBerubah::class, fn (AntreanBerubah $e) => $e->meja === [1, 2]);
});

test('nomor antrean mulai lagi dari 1 pada hari berikutnya', function () {
    Kunjungan::factory()->create(['tanggal' => today()->subDay(), 'nomor_antrean' => 5]);

    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(10)]);

    expect(antrean()->bukaKunjungan($anak)->nomor_antrean)->toBe(1);
});

test('anak tidak bisa masuk antrean dua kali pada hari yang sama (PRD 3.3)', function () {
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(10)]);
    antrean()->bukaKunjungan($anak);

    antrean()->bukaKunjungan($anak);
})->throws(ValidationException::class, 'Anak ini sudah ada di antrean hari ini.');

test('umur maksimal 60 bulan saat kunjungan dibuka (PRD 7.2)', function () {
    $tepat60 = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(60)]);
    expect(antrean()->bukaKunjungan($tepat60)->exists)->toBeTrue();

    $lebih = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(61)]);
    antrean()->bukaKunjungan($lebih);
})->throws(ValidationException::class, 'Umur anak lebih dari 60 bulan');

test('layar antrean menampilkan anak menunggu urut waktu masuk dan daftar ditunda (FR-18, FR-49)', function () {
    $kedua = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create(['masuk_meja_pada' => now()->subMinutes(5), 'nomor_antrean' => 2]);
    $pertama = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create(['masuk_meja_pada' => now()->subMinutes(10), 'nomor_antrean' => 1]);
    $ditunda = Kunjungan::factory()->diMeja(Meja::Pengukuran, StatusAntrean::Ditunda)->create(['nomor_antrean' => 3]);
    Kunjungan::factory()->diMeja(Meja::Pendataan)->create(['nomor_antrean' => 4]);
    kader();

    $this->get(route('meja', 2))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('meja/antrean')
            ->where('tersedia', true)
            ->has('antrean', 2)
            ->where('antrean.0.id', $pertama->id)
            ->where('antrean.1.id', $kedua->id)
            ->has('ditunda', 1)
            ->where('ditunda.0.id', $ditunda->id)
            ->missing('antrean.0.nik'));
});

test('membuka anak menguncinya untuk satu kader (PRD 3.3)', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    $dewi = kader();

    $this->post(route('kunjungan.buka', $kunjungan))->assertRedirect(route('kunjungan.layar', $kunjungan));
    expect($kunjungan->fresh())
        ->status->toBe(StatusAntrean::SedangDilayani)
        ->dibuka_oleh->toBe($dewi->id);

    kader();
    $this->post(route('kunjungan.buka', $kunjungan))->assertSessionHasErrors(['kunjungan' => 'Anak ini sedang dilayani kader lain.']);
    $this->get(route('meja', 2))->assertInertia(fn ($page) => $page
        ->where('antrean.0.terkunci', true)
        ->where('antrean.0.dibukaOleh', $dewi->name));
});

test('kunci lepas otomatis setelah 10 menit sehingga kader lain dapat mengambil alih', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));

    $this->travel(9)->minutes();
    $yuni = kader();
    $this->post(route('kunjungan.buka', $kunjungan))->assertSessionHasErrors('kunjungan');

    $this->travel(2)->minutes();
    $this->post(route('kunjungan.buka', $kunjungan))->assertRedirect(route('kunjungan.layar', $kunjungan));
    expect($kunjungan->fresh()->dibuka_oleh)->toBe($yuni->id);
});

test('kembali melepas anak ke antrean', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));

    $this->post(route('kunjungan.lepas', $kunjungan))->assertRedirect(route('meja', 2));

    expect($kunjungan->fresh())->status->toBe(StatusAntrean::Menunggu)->dibuka_oleh->toBeNull();
});

test('layar anak hanya untuk kader yang membukanya', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();

    $this->get(route('kunjungan.layar', $kunjungan))->assertRedirect(route('meja', 2));

    $this->post(route('kunjungan.buka', $kunjungan));
    $this->get(route('kunjungan.layar', $kunjungan))->assertOk();
});

test('tunda menyimpan draf, lanjutkan mengembalikan ke posisi asal (FR-47, FR-48)', function () {
    $masuk = now()->subMinutes(20)->startOfSecond();
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create(['masuk_meja_pada' => $masuk]);
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));

    $this->post(route('kunjungan.tunda', $kunjungan), ['draf' => ['bb' => '8,5']])
        ->assertRedirect(route('meja', 2));

    expect($kunjungan->fresh())
        ->status->toBe(StatusAntrean::Ditunda)
        ->ditunda_pada->not->toBeNull()
        ->draf->toBe(['2' => ['bb' => '8,5']]);

    $this->post(route('kunjungan.lanjutkan', $kunjungan));

    expect($kunjungan->fresh())
        ->status->toBe(StatusAntrean::Menunggu)
        ->ditunda_pada->toBeNull()
        ->draf->toBe(['2' => ['bb' => '8,5']])
        ->masuk_meja_pada->toEqual($masuk);
});

test('anak yang ditunda tidak dapat dibuka sebelum dilanjutkan', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran, StatusAntrean::Ditunda)->create();
    kader();

    $this->post(route('kunjungan.buka', $kunjungan))->assertSessionHasErrors('kunjungan');
});

test('hanya kader yang membuka anak yang boleh menunda', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));

    kader();
    $this->post(route('kunjungan.tunda', $kunjungan))->assertSessionHasErrors('kunjungan');
    expect($kunjungan->fresh()->status)->toBe(StatusAntrean::SedangDilayani);
});

test('Batal dalam 5 detik mengembalikan anak yang ditunda (DESIGN Prinsip 1)', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));
    $this->post(route('kunjungan.tunda', $kunjungan));

    $this->travel(4)->seconds();
    $this->post(route('antrean.urungkan'))->assertRedirect(route('kunjungan.layar', $kunjungan));

    expect($kunjungan->fresh())->status->toBe(StatusAntrean::SedangDilayani)->ditunda_pada->toBeNull();
});

test('Batal tidak berlaku setelah waktunya habis', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));
    $this->post(route('kunjungan.tunda', $kunjungan));

    $this->travel(10)->seconds();
    $this->post(route('antrean.urungkan'));

    expect($kunjungan->fresh()->status)->toBe(StatusAntrean::Ditunda);
});

test('Batal ditolak bila anak sudah diproses kader lain', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();
    $this->post(route('kunjungan.buka', $kunjungan));
    $this->post(route('kunjungan.tunda', $kunjungan));

    antrean()->lanjutkan($kunjungan->fresh());
    $this->post(route('antrean.urungkan'));

    expect($kunjungan->fresh()->status)->toBe(StatusAntrean::Menunggu);
});

test('kunjungan hari sebelumnya tidak dapat dibuka (PRD 3.3)', function () {
    $kemarin = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create(['tanggal' => today()->subDay()]);
    kader();

    $this->post(route('kunjungan.buka', $kemarin))->assertSessionHasErrors(['kunjungan' => 'Kunjungan ini bukan kunjungan hari ini.']);
});

test('Meja 4 dan 5 menampilkan antrean tetapi belum bisa dibuka', function () {
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pelayanan)->create();
    kader(4);

    $this->get(route('meja', 4))->assertInertia(fn ($page) => $page->where('tersedia', false)->has('antrean', 1));
    $this->post(route('kunjungan.buka', $kunjungan))->assertSessionHasErrors('kunjungan');
});

test('setiap perubahan antrean disiarkan ke meja terkait (FR-09)', function () {
    Event::fake([AntreanBerubah::class]);
    $kunjungan = Kunjungan::factory()->diMeja(Meja::Pengukuran)->create();
    kader();

    $this->post(route('kunjungan.buka', $kunjungan));
    $this->post(route('kunjungan.tunda', $kunjungan));
    $this->post(route('kunjungan.lanjutkan', $kunjungan));

    Event::assertDispatchedTimes(AntreanBerubah::class, 3);
});
