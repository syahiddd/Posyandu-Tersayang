<?php

use App\Enums\JenisLayanan;
use App\Enums\Meja;
use App\Enums\StatusNT;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Models\Posyandu;
use App\Models\User;
use App\Support\MejaAktif;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/*
| S19 Data Posyandu (PRD 4.11): profil FR-59, daftar kader FR-60, rekap
| SKDN FR-61, dan layanan per bulan FR-62.
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

/** Anak terdaftar sejak awal tahun agar masuk S bulan-bulan sebelumnya. */
function balita_skdn(array $atribut = []): Anak
{
    return Anak::factory()->create(['created_at' => '2026-01-02 08:00', ...$atribut]);
}

function timbang(Anak $anak, string $tanggal, ?StatusNT $status, SumberData $sumber = SumberData::Posyandu): Pengukuran
{
    return Pengukuran::factory()->for($anak)->create([
        'tanggal_ukur' => $tanggal,
        'status_nt' => $status,
        'sumber' => $sumber,
    ]);
}

function beri(Anak $anak, JenisLayanan $jenis, string $detail, string $tanggal, SumberData $sumber = SumberData::Posyandu): Layanan
{
    return Layanan::factory()->for($anak)->create([
        'jenis' => $jenis,
        'detail' => $detail,
        'tanggal' => $tanggal,
        'sumber' => $sumber,
    ]);
}

test('rekap SKDN bulanan dan jumlah layanan (FR-61, FR-62)', function () {
    Carbon::setTestNow(CarbonImmutable::parse('2026-11-11 09:00'));
    masuk_posyandu(User::factory()->create());

    // Naik pada penimbangan terakhir bulan itu; punya Buku KIA.
    $naik = balita_skdn(['tanggal_lahir' => '2025-01-01', 'punya_buku_kia' => true]);
    timbang($naik, '2026-10-01', StatusNT::TidakNaik);
    timbang($naik, '2026-10-20', StatusNT::Naik);
    // Tidak naik; tidak punya Buku KIA.
    $tidakNaik = balita_skdn(['tanggal_lahir' => '2025-02-01', 'punya_buku_kia' => false]);
    timbang($tidakNaik, '2026-10-05', StatusNT::TidakNaik);
    // Tidak ditimbang bulan lalu: masuk D, tidak masuk N.
    $baru = balita_skdn(['tanggal_lahir' => '2021-11-01', 'punya_buku_kia' => true]);
    timbang($baru, '2026-10-05', StatusNT::TidakDitimbangBulanLalu);
    // Hanya riwayat Buku KIA: masuk S, tidak masuk D; isian K belum diisi.
    $bukuKia = balita_skdn(['tanggal_lahir' => '2025-03-01', 'punya_buku_kia' => null]);
    timbang($bukuKia, '2026-10-05', StatusNT::Naik, SumberData::BukuKia);
    // Bukan S: umur 60 bulan pada akhir bulan, terhapus, terdaftar sesudah bulan itu.
    timbang(balita_skdn(['tanggal_lahir' => '2021-10-31', 'punya_buku_kia' => true]), '2026-10-05', StatusNT::Naik);
    $terhapus = balita_skdn(['tanggal_lahir' => '2025-01-01', 'punya_buku_kia' => true]);
    timbang($terhapus, '2026-10-05', StatusNT::Naik);
    beri($terhapus, JenisLayanan::Imunisasi, 'BCG', '2026-10-05');
    $terhapus->delete();
    Anak::factory()->create(['created_at' => '2026-11-02 08:00', 'tanggal_lahir' => '2025-01-01']);

    beri($naik, JenisLayanan::Imunisasi, 'MR 1', '2026-10-20');
    beri($tidakNaik, JenisLayanan::Imunisasi, 'PCV 3', '2026-10-05');
    beri($tidakNaik, JenisLayanan::Imunisasi, 'BCG', '2026-10-05', SumberData::BukuKia);
    beri($naik, JenisLayanan::VitaminA, 'Kapsul biru', '2026-10-20');
    beri($tidakNaik, JenisLayanan::VitaminA, 'Kapsul merah', '2026-10-05');
    beri($tidakNaik, JenisLayanan::ObatCacing, 'Obat cacing', '2026-10-05');
    beri($tidakNaik, JenisLayanan::ObatCacing, 'Obat cacing', '2026-11-05');

    $this->get(route('data-posyandu', ['bulan' => '2026-10']))->assertOk()->assertInertia(fn ($page) => $page
        ->where('rekap', [
            'bulan' => '2026-10',
            'label' => 'Oktober 2026',
            'sebelumnya' => '2026-09',
            'berikutnya' => '2026-11',
            's' => 4,
            'k' => 2,
            'd' => 3,
            'n' => 1,
            'persenDS' => '75,0',
            'persenND' => '33,3',
            'imunisasi' => 2,
            'vitaminABiru' => 1,
            'vitaminAMerah' => 1,
            'obatCacing' => 1,
        ]));

    Carbon::setTestNow();
});

test('rekap bawaan bulan berjalan; bulan tidak sah atau mendatang diabaikan; pembagi 0 tanpa persen', function (?string $bulan) {
    Carbon::setTestNow(CarbonImmutable::parse('2026-11-11 09:00'));
    masuk_posyandu(User::factory()->create());

    $this->get(route('data-posyandu', ['bulan' => $bulan]))->assertInertia(fn ($page) => $page
        ->where('rekap.bulan', '2026-11')
        ->where('rekap.label', 'November 2026')
        ->where('rekap.berikutnya', null)
        ->where('rekap.s', 0)
        ->where('rekap.persenDS', null)
        ->where('rekap.persenND', null));

    Carbon::setTestNow();
})->with([null, '2026-12', '2026-13', 'November', '1999-12']);

test('unduh CSV rekap Data Posyandu per bulan sesuai PRD 7.3 (FR-63)', function () {
    Carbon::setTestNow(CarbonImmutable::parse('2026-03-11 09:00'));
    masuk_posyandu(User::factory()->create());

    $anak = balita_skdn(['tanggal_lahir' => '2025-01-01', 'punya_buku_kia' => true]);
    timbang(balita_skdn(['tanggal_lahir' => '2025-02-01', 'punya_buku_kia' => false]), '2026-02-05', StatusNT::TidakNaik);
    timbang($anak, '2026-01-05', StatusNT::TidakDitimbangBulanLalu);
    timbang($anak, '2026-02-05', StatusNT::Naik);
    beri($anak, JenisLayanan::VitaminA, 'Kapsul merah', '2026-02-05');

    $respons = $this->get(route('data-posyandu.unduh', ['tahun' => '2026']));
    $respons->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
        ->assertDownload('data-posyandu_11-03-2026.csv');

    $isi = $respons->streamedContent();

    expect($isi)->toStartWith("\xEF\xBB\xBF")
        ->and(explode("\r\n", substr($isi, 3)))->toBe([
            'Bulan;S;K;D;N;"D/S (%)";"N/D (%)";"Imunisasi (dosis)";"Vitamin A biru";"Vitamin A merah";"Obat cacing"',
            '"Januari 2026";2;1;1;0;50,0;0,0;0;0;0;0',
            '"Februari 2026";2;1;2;1;100,0;50,0;0;0;1;0',
            '"Maret 2026";2;1;0;0;0,0;;0;0;0;0',
            '',
        ]);

    // Tahun lalu berisi dua belas bulan; tahun mendatang atau tidak sah memakai tahun berjalan.
    $baris = fn (array $query) => count(explode("\r\n", trim($this->get(route('data-posyandu.unduh', $query))->streamedContent()))) - 1;
    expect($baris(['tahun' => '2025']))->toBe(12)
        ->and($baris(['tahun' => '2027']))->toBe(3)
        ->and($baris(['tahun' => 'abc']))->toBe(3);

    Carbon::setTestNow();
});
