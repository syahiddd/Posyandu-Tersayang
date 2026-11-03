<?php

use App\Enums\JenisLayanan;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Models\User;
use App\Support\MejaAktif;
use App\Support\Tanggal;
use Illuminate\Support\Carbon;

/*
| Input riwayat dari Buku KIA (PRD 4.12): FR-64 sampai FR-66, PRD 7.2,
| PRD Tabel 29 dan 30.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 3]);
    $this->anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(20)]);
});

function simpan_riwayat(array $data)
{
    return test()->post(route('riwayat-buku-kia.simpan', test()->anak), $data);
}

test('layar Tambah Riwayat memuat jadwal vaksin Tabel 29 dan vitamin A/obat cacing Tabel 30', function () {
    Layanan::factory()->for($this->anak)->create([
        'jenis' => JenisLayanan::Imunisasi,
        'detail' => 'BCG',
        'tanggal' => today()->subMonths(19),
        'sumber' => SumberData::BukuKia,
        'kunjungan_id' => null,
    ]);

    $this->get(route('riwayat-buku-kia', $this->anak))->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-anak/riwayat-buku-kia')
        ->has('daftarVaksin', 21)
        ->where('daftarVaksin.0.kode', 'HB0')
        ->where('daftarVaksin.1.kode', 'BCG')
        ->where('daftarVaksin.1.sudahTercatat', true)
        ->where('daftarVaksin.2.sudahTercatat', false)
        ->has('daftarVitaminObat', 3)
        ->where('daftarVitaminObat.0.umurMin', 6)
        ->where('daftarVitaminObat.0.umurMaks', 11)
        ->has('layanan', 1));
});

test('imunisasi lama tersimpan bersumber Buku KIA tanpa kunjungan (FR-64, FR-66)', function () {
    simpan_riwayat([
        'jenis' => 'imunisasi',
        'vaksin' => 'DPT-HB-Hib 1',
        'tanggal' => today()->subMonths(18)->toDateString(),
    ])->assertRedirect(route('riwayat-buku-kia', $this->anak))->assertSessionHasNoErrors();

    $layanan = $this->anak->layanan()->sole();
    expect($layanan->jenis)->toBe(JenisLayanan::Imunisasi)
        ->and($layanan->detail)->toBe('DPT-HB-Hib 1')
        ->and($layanan->sumber)->toBe(SumberData::BukuKia)
        ->and($layanan->kunjungan_id)->toBeNull();

    // Tampil di Detail Anak dengan tanda Buku KIA.
    $this->get(route('data-anak.detail', $this->anak))->assertInertia(fn ($page) => $page
        ->where('layanan.0.detail', 'DPT-HB-Hib 1')
        ->where('layanan.0.dariBukuKia', true));
});

test('dosis yang sudah tercatat ditolak; vaksin harus dari jadwal; tanggal antara lahir dan hari ini', function () {
    Layanan::factory()->for($this->anak)->create([
        'jenis' => JenisLayanan::Imunisasi,
        'detail' => 'MR 1',
        'tanggal' => today()->subMonths(11),
    ]);

    simpan_riwayat(['jenis' => 'imunisasi', 'vaksin' => 'MR 1', 'tanggal' => today()->subMonths(10)->toDateString()])
        ->assertSessionHasErrors(['vaksin' => 'MR 1 sudah tercatat pada '.Tanggal::singkat(today()->subMonths(11)).'.']);

    simpan_riwayat(['jenis' => 'imunisasi', 'vaksin' => 'Campak', 'tanggal' => today()->toDateString()])
        ->assertSessionHasErrors('vaksin');

    simpan_riwayat(['jenis' => 'imunisasi', 'vaksin' => 'BCG', 'tanggal' => today()->subMonths(21)->toDateString()])
        ->assertSessionHasErrors(['tanggal' => 'Tanggal tidak boleh sebelum tanggal lahir anak.']);

    simpan_riwayat(['jenis' => 'imunisasi', 'vaksin' => 'BCG', 'tanggal' => today()->addDay()->toDateString()])
        ->assertSessionHasErrors('tanggal');

    expect($this->anak->layanan()->count())->toBe(1);
});

test('pengukuran lama: koma desimal, batas PRD 7.2, minimal satu ukuran (FR-65)', function () {
    simpan_riwayat([
        'jenis' => 'pengukuran',
        'tanggal' => today()->subMonths(6)->toDateString(),
        'bb' => '9,4',
        'pb_tb' => '76.5',
        'lila' => '',
        'lk' => '',
    ])->assertSessionHasNoErrors();

    $ukur = $this->anak->pengukuran()->sole();
    expect($ukur->bb)->toBe('9.4')
        ->and($ukur->pb_tb)->toBe('76.5')
        ->and($ukur->lila)->toBeNull()
        ->and($ukur->sumber)->toBe(SumberData::BukuKia)
        ->and($ukur->kunjungan_id)->toBeNull();

    simpan_riwayat(['jenis' => 'pengukuran', 'tanggal' => today()->subMonths(5)->toDateString()])
        ->assertSessionHasErrors(['bb' => 'Isi paling sedikit satu ukuran.']);

    simpan_riwayat(['jenis' => 'pengukuran', 'tanggal' => today()->subMonths(5)->toDateString(), 'bb' => '40', 'lk' => '8,55'])
        ->assertSessionHasErrors(['bb' => 'Isi antara 1,0 dan 35,0 kg.', 'lk']);

    simpan_riwayat(['jenis' => 'pengukuran', 'tanggal' => today()->subMonths(6)->toDateString(), 'bb' => '9,5'])
        ->assertSessionHasErrors(['tanggal' => 'Sudah ada pengukuran pada tanggal ini.']);
});

test('vitamin A dan obat cacing diperiksa terhadap umur pada tanggal pemberian (PRD Tabel 30)', function () {
    // Umur 8 bulan: kapsul biru boleh, kapsul merah dan obat cacing tidak.
    $umur8 = today()->subMonths(12)->toDateString();

    simpan_riwayat(['jenis' => 'vitamin_obat', 'layanan' => 'Kapsul biru', 'tanggal' => $umur8])->assertSessionHasNoErrors();
    simpan_riwayat(['jenis' => 'vitamin_obat', 'layanan' => 'Kapsul merah', 'tanggal' => $umur8])
        ->assertSessionHasErrors(['layanan' => 'Vitamin A kapsul merah (200.000 IU) untuk umur 12–59 bulan; pada tanggal itu anak berumur 8 bulan.']);
    simpan_riwayat(['jenis' => 'vitamin_obat', 'layanan' => 'Obat cacing', 'tanggal' => $umur8])
        ->assertSessionHasErrors('layanan');

    // Umur 14 bulan: kapsul merah dan obat cacing boleh.
    $umur14 = today()->subMonths(6)->toDateString();
    simpan_riwayat(['jenis' => 'vitamin_obat', 'layanan' => 'Kapsul merah', 'tanggal' => $umur14])->assertSessionHasNoErrors();
    simpan_riwayat(['jenis' => 'vitamin_obat', 'layanan' => 'Obat cacing', 'tanggal' => $umur14])->assertSessionHasNoErrors();
    simpan_riwayat(['jenis' => 'vitamin_obat', 'layanan' => 'Obat cacing', 'tanggal' => $umur14])
        ->assertSessionHasErrors('tanggal');

    expect($this->anak->layanan()->where('jenis', JenisLayanan::VitaminA)->pluck('detail')->all())
        ->toEqualCanonicalizing(['Kapsul biru', 'Kapsul merah'])
        ->and($this->anak->layanan()->where('jenis', JenisLayanan::ObatCacing)->count())->toBe(1);
});

test('Batal dalam 5 detik menghapus entri terakhir; setelahnya ditolak', function () {
    simpan_riwayat(['jenis' => 'imunisasi', 'vaksin' => 'BCG', 'tanggal' => today()->subMonths(19)->toDateString()]);
    expect($this->anak->layanan()->count())->toBe(1);

    $this->post(route('riwayat-buku-kia.urungkan'))->assertRedirect();
    expect($this->anak->layanan()->count())->toBe(0);

    simpan_riwayat(['jenis' => 'pengukuran', 'tanggal' => today()->subMonths(3)->toDateString(), 'bb' => '10']);
    Carbon::setTestNow(now()->addSeconds(10));
    $this->post(route('riwayat-buku-kia.urungkan'))->assertSessionHasErrors('urungan');
    Carbon::setTestNow();

    expect($this->anak->pengukuran()->count())->toBe(1);
});

test('Batal tidak menghapus data hasil kunjungan posyandu', function () {
    $ukur = Pengukuran::factory()->for($this->anak)->create();

    $this->withSession(['urunganRiwayat' => ['kelas' => Pengukuran::class, 'id' => $ukur->id, 'batas' => now()->addMinute()->getTimestamp()]])
        ->post(route('riwayat-buku-kia.urungkan'));

    expect(Pengukuran::query()->find($ukur->id))->not->toBeNull();
});

test('riwayat anak terhapus tidak dapat ditambah', function () {
    $this->anak->delete();

    $this->get(route('riwayat-buku-kia', $this->anak))->assertNotFound();
});
