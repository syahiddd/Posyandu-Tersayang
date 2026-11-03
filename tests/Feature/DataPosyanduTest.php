<?php

use App\Enums\Meja;
use App\Models\Posyandu;
use App\Models\User;
use App\Support\MejaAktif;

/*
| S19 Data Posyandu (PRD 4.11): profil FR-59 dan daftar kader FR-60.
*/

beforeEach(function () {
    Posyandu::factory()->create([
        'nama' => 'Posyandu Melati',
        'desa_kelurahan' => null,
        'kecamatan' => 'Sukasari',
        'jadwal_kegiatan' => 'Setiap tanggal 5',
    ]);
});

function masuk_posyandu(User $user): void
{
    test()->actingAs($user)->withSession([MejaAktif::KUNCI_SESI => 1]);
}

function profil_posyandu(array $ganti = []): array
{
    return [
        'nama' => 'Posyandu Melati',
        'desa_kelurahan' => 'Sukamaju',
        'kecamatan' => 'Sukasari',
        'kabupaten_kota' => 'Bandar Lampung',
        'puskesmas_pembina' => 'Puskesmas Sukasari',
        'alamat' => 'Balai Dusun Melati',
        'jadwal_kegiatan' => 'Setiap tanggal 5',
        ...$ganti,
    ];
}

test('semua kader melihat profil posyandu dan daftar kader aktif (FR-59, FR-60)', function () {
    masuk_posyandu(User::factory()->create(['name' => 'Dewi', 'no_hp' => '081200000001', 'meja_biasa' => Meja::Pengukuran]));
    User::factory()->ketua()->create(['name' => 'Sri']);
    User::factory()->nonaktif()->create(['name' => 'Rina']);

    $this->get(route('data-posyandu'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-posyandu/profil')
        ->where('profil.nama', 'Posyandu Melati')
        ->where('profil.kecamatan', 'Sukasari')
        ->where('bolehUbah', false)
        ->has('kader', 2)
        ->where('kader.0.nama', 'Sri')
        ->where('kader.0.peran', 'Ketua Kader')
        ->where('kader.1.nama', 'Dewi')
        ->where('kader.1.noHp', '081200000001')
        ->where('kader.1.mejaBiasa', 'Meja 2 · Pengukuran'));
});

test('kader biasa tidak dapat mengubah profil posyandu (FR-59)', function () {
    masuk_posyandu(User::factory()->create());

    $this->get(route('data-posyandu.ubah'))->assertForbidden();
    $this->put(route('data-posyandu.perbarui'), profil_posyandu(['nama' => 'Ganti']))->assertForbidden();

    expect(Posyandu::query()->sole()->nama)->toBe('Posyandu Melati');
});

test('Ketua Kader mengubah profil posyandu (FR-59)', function () {
    masuk_posyandu(User::factory()->ketua()->create());

    $this->get(route('data-posyandu'))->assertInertia(fn ($page) => $page->where('bolehUbah', true));
    $this->get(route('data-posyandu.ubah'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-posyandu/ubah')
        ->where('profil.desa_kelurahan', ''));

    $this->put(route('data-posyandu.perbarui'), profil_posyandu(['puskesmas_pembina' => 'Puskesmas Kedaton']))
        ->assertRedirect(route('data-posyandu'));

    $posyandu = Posyandu::query()->sole();
    expect($posyandu->puskesmas_pembina)->toBe('Puskesmas Kedaton')
        ->and($posyandu->desa_kelurahan)->toBe('Sukamaju');

    $this->put(route('data-posyandu.perbarui'), profil_posyandu(['nama' => '']))
        ->assertSessionHasErrors(['nama' => 'Nama posyandu wajib diisi.']);
});

test('profil dibuat bila belum ada saat Ketua menyimpan', function () {
    Posyandu::query()->delete();
    masuk_posyandu(User::factory()->ketua()->create());

    $this->get(route('data-posyandu'))->assertOk()->assertInertia(fn ($page) => $page->where('profil.nama', null));
    $this->put(route('data-posyandu.perbarui'), profil_posyandu(['nama' => 'Posyandu Mawar']));

    expect(Posyandu::query()->sole()->nama)->toBe('Posyandu Mawar');
});
