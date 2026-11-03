<?php

use App\Auth\LoginLockout;
use App\Models\User;

/*
| Masuk sistem (PRD 4.1): FR-01, FR-02, FR-04, FR-05.
*/

const PESAN_GAGAL = 'Nama pengguna atau kata sandi salah.';
const PESAN_TERKUNCI = 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.';

function coba_masuk(string $username, string $password)
{
    return test()->post(route('login.store'), [
        'username' => $username,
        'password' => $password,
    ]);
}

test('halaman pertama adalah halaman masuk (FR-01)', function () {
    $this->get('/')->assertRedirect(route('login'));

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/login'));
});

test('kader masuk dengan username dan kata sandi (FR-01)', function () {
    $user = User::factory()->create(['username' => 'dewi']);

    coba_masuk('dewi', 'password')->assertRedirect(config('fortify.home'));

    $this->assertAuthenticatedAs($user);
});

test('username tidak membedakan huruf besar dan kecil', function () {
    $user = User::factory()->create(['username' => 'dewi']);

    coba_masuk('Dewi', 'password');

    $this->assertAuthenticatedAs($user);
});

test('kata sandi salah ditolak dengan pesan umum', function () {
    User::factory()->create(['username' => 'dewi']);

    coba_masuk('dewi', 'salah-sandi')->assertSessionHasErrors(['username' => PESAN_GAGAL]);

    $this->assertGuest();
});

test('pesan gagal sama untuk username yang tidak terdaftar (PRD 4.1)', function () {
    User::factory()->create(['username' => 'dewi']);

    foreach (['dewi', 'tidak-ada'] as $username) {
        coba_masuk($username, 'salah-sandi')
            ->assertSessionHasErrors(['username' => PESAN_GAGAL])
            ->assertSessionDoesntHaveErrors('password');
        $this->flushSession();
    }

    $this->assertGuest();
});

test('akun nonaktif tidak bisa masuk walau kata sandi benar (FR-02)', function () {
    User::factory()->nonaktif()->create(['username' => 'rina']);

    coba_masuk('rina', 'password')->assertSessionHasErrors(['username' => PESAN_GAGAL]);

    $this->assertGuest();
});

test('akun yang dinonaktifkan saat sedang masuk langsung dikeluarkan', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $user->update(['is_active' => false]);

    $this->get(route('pilih-meja'))->assertRedirect(route('login'));
    $this->assertGuest();
});

test('lima kali gagal mengunci akun selama 15 menit (FR-04)', function () {
    User::factory()->create(['username' => 'dewi']);

    foreach (range(1, LoginLockout::MAKS_GAGAL) as $percobaan) {
        coba_masuk('dewi', 'salah-sandi')->assertSessionHasErrors(['username' => PESAN_GAGAL]);
    }

    // Kata sandi benar pun ditolak selama terkunci.
    coba_masuk('dewi', 'password')->assertSessionHasErrors(['username' => PESAN_TERKUNCI]);
    $this->assertGuest();

    $this->travel(14)->minutes();
    coba_masuk('dewi', 'password')->assertSessionHasErrors('username');
    $this->assertGuest();

    $this->travel(2)->minutes();
    coba_masuk('dewi', 'password')->assertRedirect(config('fortify.home'));
    $this->assertAuthenticated();
});

test('penguncian berlaku sama untuk username yang tidak terdaftar', function () {
    foreach (range(1, LoginLockout::MAKS_GAGAL) as $percobaan) {
        coba_masuk('tidak-ada', 'salah-sandi');
    }

    coba_masuk('tidak-ada', 'salah-sandi')->assertSessionHasErrors(['username' => PESAN_TERKUNCI]);
});

test('penguncian hanya mengenai akun yang gagal, bukan akun lain', function () {
    User::factory()->create(['username' => 'dewi']);
    User::factory()->create(['username' => 'yuni']);

    foreach (range(1, LoginLockout::MAKS_GAGAL) as $percobaan) {
        coba_masuk('dewi', 'salah-sandi');
    }

    coba_masuk('yuni', 'password')->assertRedirect(config('fortify.home'));
});

test('berhasil masuk mereset hitungan gagal', function () {
    User::factory()->create(['username' => 'dewi']);

    foreach (range(1, LoginLockout::MAKS_GAGAL - 1) as $percobaan) {
        coba_masuk('dewi', 'salah-sandi');
    }
    coba_masuk('dewi', 'password');
    $this->post(route('logout'));

    foreach (range(1, LoginLockout::MAKS_GAGAL - 1) as $percobaan) {
        coba_masuk('dewi', 'salah-sandi');
    }

    coba_masuk('dewi', 'password')->assertRedirect(config('fortify.home'));
});

test('tidak ada pendaftaran, lupa sandi via email, maupun 2FA (FR-01, FR-02)', function (string $metode, string $url) {
    $this->call($metode, $url)->assertNotFound();
})->with([
    ['GET', '/register'],
    ['POST', '/register'],
    ['GET', '/forgot-password'],
    ['POST', '/forgot-password'],
    ['GET', '/reset-password/token-contoh'],
    ['GET', '/two-factor-challenge'],
    ['GET', '/email/verify'],
]);

test('sesi berakhir setelah 120 menit tanpa aktivitas (FR-05)', function () {
    expect(config('session.lifetime'))->toBe(120);
});

test('kader dapat keluar kapan saja (FR-05)', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('logout'))->assertRedirect();

    $this->assertGuest();
});
