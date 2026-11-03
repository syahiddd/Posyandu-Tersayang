<?php

use App\Auth\SandiSementara;
use App\Enums\Meja;
use App\Enums\Role;
use App\Models\User;
use App\Support\MejaAktif;
use Illuminate\Support\Facades\Hash;

/*
| S21 Pengaturan Akun (FR-02, FR-60) dan ganti kata sandi sendiri.
*/

function masuk_sebagai(User $user): User
{
    test()->actingAs($user)->withSession([MejaAktif::KUNCI_SESI => 1]);

    return $user;
}

test('kader biasa tidak dapat membuka atau mengubah akun (FR-02)', function () {
    masuk_sebagai(User::factory()->create());
    $lain = User::factory()->create();

    $this->get(route('pengaturan-akun'))->assertForbidden();
    $this->get(route('akun.tambah'))->assertForbidden();
    $this->post(route('akun.simpan'), ['name' => 'X', 'username' => 'x', 'password' => 'rahasia123'])->assertForbidden();
    $this->put(route('akun.status', $lain), ['aktif' => false])->assertForbidden();
    $this->post(route('akun.atur-ulang-sandi', $lain))->assertForbidden();

    expect($lain->refresh()->is_active)->toBeTrue();
});

test('Ketua melihat daftar akun dengan status aktif', function () {
    masuk_sebagai(User::factory()->ketua()->create(['name' => 'Sri']));
    User::factory()->create(['name' => 'Dewi', 'no_hp' => '081234567890', 'meja_biasa' => Meja::Pengukuran]);
    User::factory()->nonaktif()->create(['name' => 'Rina']);

    $this->get(route('pengaturan-akun'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('akun/daftar')
        ->has('akun', 3)
        ->where('akun.0.nama', 'Sri')
        ->where('akun.0.diriSendiri', true)
        ->where('akun.1.nama', 'Dewi')
        ->where('akun.1.noHp', '081234567890')
        ->where('akun.1.mejaBiasa', 2)
        ->where('akun.2.nama', 'Rina')
        ->where('akun.2.aktif', false)
        ->where('sandiSementara', null)
        ->has('daftarMeja', 5));
});

test('formulir tambah kader mengusulkan kata sandi acak', function () {
    masuk_sebagai(User::factory()->ketua()->create());

    $this->get(route('akun.tambah'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('akun/formulir')
        ->where('akun', null)
        ->where('usulanSandi', fn (string $sandi) => strlen($sandi) === SandiSementara::PANJANG));
});

test('Ketua menambah kader; peran selalu kader dan kata sandi tampil sekali', function () {
    masuk_sebagai(User::factory()->ketua()->create());

    $this->post(route('akun.simpan'), [
        'name' => 'Ani Suryani',
        'username' => 'ani',
        'password' => 'Mawar#2026xy',
        'no_hp' => '0812 3456-7890',
        'meja_biasa' => 3,
        'role' => 'ketua',
    ])->assertRedirect(route('pengaturan-akun'));

    $ani = User::query()->where('username', 'ani')->sole();
    expect($ani->role)->toBe(Role::Kader)
        ->and($ani->is_active)->toBeTrue()
        ->and($ani->no_hp)->toBe('081234567890')
        ->and($ani->meja_biasa)->toBe(Meja::Pendataan)
        ->and(Hash::check('Mawar#2026xy', $ani->password))->toBeTrue();

    $this->get(route('pengaturan-akun'))->assertInertia(fn ($page) => $page
        ->where('sandiSementara.username', 'ani')
        ->where('sandiSementara.sandi', 'Mawar#2026xy'));

    // Hanya sekali.
    $this->get(route('pengaturan-akun'))->assertInertia(fn ($page) => $page->where('sandiSementara', null));
});

test('validasi tambah kader: nama pengguna unik dan berformat, nomor HP PRD 7.2', function () {
    masuk_sebagai(User::factory()->ketua()->create());
    User::factory()->create(['username' => 'dewi']);

    $this->post(route('akun.simpan'), [
        'name' => '',
        'username' => 'dewi',
        'password' => '',
        'no_hp' => '12345',
        'meja_biasa' => 9,
    ])->assertSessionHasErrors(['name', 'username', 'password', 'no_hp', 'meja_biasa']);

    $this->post(route('akun.simpan'), [
        'name' => 'Ani',
        'username' => 'Ani Suryani',
        'password' => 'Mawar#2026xy',
    ])->assertSessionHasErrors(['username' => 'Nama pengguna hanya huruf kecil, angka, titik, atau garis bawah.']);
});

test('Ketua mengubah data kader tanpa mengubah kata sandi', function () {
    masuk_sebagai(User::factory()->ketua()->create());
    $dewi = User::factory()->create(['username' => 'dewi', 'password' => 'lama-sekali']);

    $this->get(route('akun.ubah', $dewi))->assertOk()->assertInertia(fn ($page) => $page
        ->component('akun/formulir')
        ->where('akun.username', 'dewi')
        ->where('usulanSandi', null));

    $this->put(route('akun.perbarui', $dewi), [
        'name' => 'Dewi Lestari',
        'username' => 'dewi',
        'no_hp' => '+6281234567890',
        'meja_biasa' => '',
        'password' => 'diabaikan',
    ])->assertRedirect(route('pengaturan-akun'));

    $dewi->refresh();
    expect($dewi->name)->toBe('Dewi Lestari')
        ->and($dewi->no_hp)->toBe('+6281234567890')
        ->and($dewi->meja_biasa)->toBeNull()
        ->and(Hash::check('lama-sekali', $dewi->password))->toBeTrue();
});

test('menonaktifkan kader mengeluarkannya dari sesi; dapat diaktifkan lagi (FR-02)', function () {
    $ketua = masuk_sebagai(User::factory()->ketua()->create());
    $dewi = User::factory()->create();

    $this->put(route('akun.status', $dewi), ['aktif' => false])->assertRedirect();
    expect($dewi->refresh()->is_active)->toBeFalse();

    $this->actingAs($dewi)->get(route('beranda'))->assertRedirect(route('login'));

    masuk_sebagai($ketua);
    $this->put(route('akun.status', $dewi), ['aktif' => true]);
    expect($dewi->refresh()->is_active)->toBeTrue();
});

test('Ketua tidak dapat menonaktifkan atau mengatur ulang sandinya sendiri', function () {
    $ketua = masuk_sebagai(User::factory()->ketua()->create());

    $this->put(route('akun.status', $ketua), ['aktif' => false])->assertSessionHasErrors('aktif');
    $this->post(route('akun.atur-ulang-sandi', $ketua))->assertSessionHasErrors('sandi');

    expect($ketua->refresh()->is_active)->toBeTrue();
});

test('atur ulang kata sandi membuat sandi sementara, tampil sekali, dan membuka kunci akun', function () {
    masuk_sebagai(User::factory()->ketua()->create());
    $dewi = User::factory()->create(['username' => 'dewi', 'password' => 'sandi-lama']);

    // Akun terkunci setelah 5 kali gagal (FR-04).
    auth()->logout();
    foreach (range(1, 5) as $_) {
        $this->post(route('login.store'), ['username' => 'dewi', 'password' => 'salah']);
    }
    $this->post(route('login.store'), ['username' => 'dewi', 'password' => 'sandi-lama'])->assertSessionHasErrors();

    masuk_sebagai(User::query()->where('role', Role::Ketua)->sole());
    $this->post(route('akun.atur-ulang-sandi', $dewi))->assertRedirect();

    $tampil = $this->get(route('pengaturan-akun'))->viewData('page')['props']['sandiSementara'];
    $sandi = $tampil['sandi'];

    expect($tampil['username'])->toBe('dewi')
        ->and($sandi)->toMatch('/^[A-HJ-NP-Za-km-np-z2-9#@%+=?]{12}$/')
        ->and(Hash::check($sandi, $dewi->refresh()->password))->toBeTrue();

    auth()->logout();
    $this->post(route('login.store'), ['username' => 'dewi', 'password' => $sandi])
        ->assertSessionHasNoErrors();
    $this->assertAuthenticatedAs($dewi);
});

test('sandi sementara memuat huruf besar, huruf kecil, angka, dan simbol', function () {
    foreach (range(1, 50) as $_) {
        $sandi = SandiSementara::buat();

        expect($sandi)->toHaveLength(12)
            ->toMatch('/[A-Z]/')->toMatch('/[a-z]/')->toMatch('/[2-9]/')->toMatch('/[#@%+=?]/')
            ->not->toMatch('/[0O1lI]/');
    }
});

test('kader mengganti kata sandinya sendiri', function () {
    $dewi = masuk_sebagai(User::factory()->create(['password' => 'sandi-lama']));

    $this->get(route('ganti-sandi'))->assertOk()->assertInertia(fn ($page) => $page->component('akun/ganti-sandi'));

    $this->put(route('ganti-sandi.update'), [
        'sandi_lama' => 'sandi-lama',
        'sandi_baru' => 'sandi-baru-123',
        'sandi_baru_confirmation' => 'sandi-baru-123',
    ])->assertRedirect(route('lainnya'));

    expect(Hash::check('sandi-baru-123', $dewi->refresh()->password))->toBeTrue();
});

test('ganti kata sandi menolak sandi lama salah, ulangan berbeda, dan sandi sama', function () {
    $dewi = masuk_sebagai(User::factory()->create(['password' => 'sandi-lama']));

    $this->put(route('ganti-sandi.update'), [
        'sandi_lama' => 'keliru',
        'sandi_baru' => 'sandi-baru-123',
        'sandi_baru_confirmation' => 'beda',
    ])->assertSessionHasErrors(['sandi_lama' => 'Kata sandi lama salah.', 'sandi_baru']);

    $this->put(route('ganti-sandi.update'), [
        'sandi_lama' => 'sandi-lama',
        'sandi_baru' => 'sandi-lama',
        'sandi_baru_confirmation' => 'sandi-lama',
    ])->assertSessionHasErrors('sandi_baru');

    expect(Hash::check('sandi-lama', $dewi->refresh()->password))->toBeTrue();
});
