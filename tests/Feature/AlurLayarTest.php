<?php

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Kunjungan;
use App\Models\Posyandu;
use App\Models\User;
use App\Support\MejaAktif;

/*
| Alur S01 Masuk -> S02 Pilih Meja -> S03 Beranda: FR-03, FR-06 sampai FR-08.
*/

function kader_dengan_meja(int $meja = 2, ?User $user = null): User
{
    $user ??= User::factory()->create();
    test()->actingAs($user)->withSession([MejaAktif::KUNCI_SESI => $meja]);

    return $user;
}

test('tamu dialihkan ke halaman masuk dari semua halaman (PRD 4.1)', function (string $url) {
    $this->get($url)->assertRedirect(route('login'));
})->with(['/pilih-meja', '/beranda', '/meja/1', '/data-anak', '/lainnya', '/pengaturan-akun']);

test('setelah masuk kader diarahkan ke Pilih Meja (FR-03)', function () {
    User::factory()->create(['username' => 'dewi']);

    $this->post(route('login.store'), ['username' => 'dewi', 'password' => 'password'])
        ->assertRedirect(route('pilih-meja'));
});

test('Beranda dan layar lain mewajibkan meja dipilih lebih dulu (FR-03)', function (string $url) {
    $this->actingAs(User::factory()->create());

    $this->get($url)->assertRedirect(route('pilih-meja'));
})->with(['/beranda', '/meja/2', '/data-anak', '/lainnya']);

test('Pilih Meja menampilkan lima meja dengan jumlah antrean dari database (FR-03, FR-07)', function () {
    Kunjungan::factory()->count(2)->diMeja(Meja::Pendataan)->create();
    Kunjungan::factory()->diMeja(Meja::Pendataan, StatusAntrean::Ditunda)->create();
    $this->actingAs(User::factory()->create());

    $this->get(route('pilih-meja'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pilih-meja')
            ->has('meja', 5)
            ->where('meja.2', ['nomor' => 3, 'tahap' => 'Pendataan', 'menunggu' => 2, 'ditunda' => 1])
            ->where('meja.0.menunggu', 0)
            ->where('terpilih', null));
});

test('meja yang dipilih tersimpan di sesi lalu membuka Beranda (FR-03)', function () {
    $this->actingAs(User::factory()->create());

    $this->put(route('pilih-meja.update'), ['meja' => 4])
        ->assertRedirect(route('beranda'))
        ->assertSessionHas(MejaAktif::KUNCI_SESI, 4)
        ->assertCookie(MejaAktif::COOKIE_TERAKHIR, '4');

    $this->get(route('beranda'))->assertOk();
});

test('meja di luar 1 sampai 5 ditolak', function (mixed $meja) {
    $this->actingAs(User::factory()->create());

    $this->put(route('pilih-meja.update'), ['meja' => $meja])
        ->assertSessionHasErrors('meja')
        ->assertSessionMissing(MejaAktif::KUNCI_SESI);
})->with([0, 6, 'satu', null]);

test('meja terakhir terpilih otomatis dari cookie perangkat', function () {
    $this->actingAs(User::factory()->create());

    $this->withCookie(MejaAktif::COOKIE_TERAKHIR, '3')
        ->get(route('pilih-meja'))
        ->assertInertia(fn ($page) => $page->where('terpilih', 3));
});

test('Beranda menghitung ringkasan hari ini dari database (FR-06, FR-07)', function () {
    Posyandu::factory()->create(['nama' => 'Posyandu Tersayang']);
    Kunjungan::factory()->count(2)->diMeja(Meja::Pengukuran)->create();
    Kunjungan::factory()->diMeja(Meja::Pendataan)->create();
    Kunjungan::factory()->diMeja(Meja::Pelayanan, StatusAntrean::Ditunda)->create();
    Kunjungan::factory()->selesai()->create();
    // Kunjungan kemarin tidak ikut dihitung.
    Kunjungan::factory()->selesai()->create(['tanggal' => today()->subDay()]);
    kader_dengan_meja(2);

    $this->get(route('beranda'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('beranda')
            ->where('ringkasan', ['terdaftar' => 5, 'sudahDitimbang' => 3, 'selesai' => 1])
            ->where('antrean.1', ['nomor' => 2, 'tahap' => 'Pengukuran', 'menunggu' => 2, 'ditunda' => 0])
            ->where('antrean.3.ditunda', 1)
            ->where('mejaAktif', ['nomor' => 2, 'tahap' => 'Pengukuran'])
            ->where('namaPosyandu', 'Posyandu Tersayang'));
});

test('Beranda tetap tampil dengan angka 0 saat belum ada kunjungan', function () {
    kader_dengan_meja(1);

    $this->get(route('beranda'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('ringkasan', ['terdaftar' => 0, 'sudahDitimbang' => 0, 'selesai' => 0]));
});

test('ringkasan dihitung ulang saat tanggal berganti (FR-06)', function () {
    Kunjungan::factory()->count(3)->create();
    kader_dengan_meja(1);

    $this->travel(1)->days();

    $this->get(route('beranda'))
        ->assertInertia(fn ($page) => $page->where('ringkasan.terdaftar', 0));
});

test('pintasan lima meja dan menu lain dapat dibuka (FR-08)', function (string $url) {
    kader_dengan_meja(1);

    $this->get($url)->assertOk();
})->with(['/meja/1', '/meja/2', '/meja/3', '/meja/4', '/meja/5', '/data-anak', '/rekap-imunisasi', '/data-posyandu', '/lainnya']);

test('nomor meja di luar 1 sampai 5 tidak ditemukan', function () {
    kader_dengan_meja(1);

    $this->get('/meja/6')->assertNotFound();
});

test('Pengaturan Akun hanya untuk ketua (FR-02)', function () {
    kader_dengan_meja(1);
    $this->get(route('pengaturan-akun'))->assertForbidden();

    kader_dengan_meja(1, User::factory()->ketua()->create());
    $this->get(route('pengaturan-akun'))->assertOk();
});

test('menu Pengaturan Akun hanya ditawarkan kepada ketua', function () {
    kader_dengan_meja(1);
    $this->get(route('beranda'))->assertInertia(fn ($page) => $page->where('bolehKelolaAkun', false));

    kader_dengan_meja(1, User::factory()->ketua()->create());
    $this->get(route('beranda'))->assertInertia(fn ($page) => $page->where('bolehKelolaAkun', true));
});

test('data akun yang dibagikan ke halaman tidak memuat kata sandi', function () {
    kader_dengan_meja(1);

    $this->get(route('beranda'))->assertInertia(fn ($page) => $page
        ->has('auth.user', fn ($user) => $user->hasAll(['id', 'name', 'username', 'role'])->missing('password')));
});

test('keluar menghapus sesi dan meja yang dipilih (FR-05)', function () {
    kader_dengan_meja(3);

    $this->post(route('logout'));

    $this->assertGuest();
    $this->get(route('beranda'))->assertRedirect(route('login'));
});
