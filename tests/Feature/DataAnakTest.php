<?php

use App\Anak\KelompokUmur;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Models\User;
use App\Support\MejaAktif;
use App\Support\Umur;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/*
| Menu Data Anak (PRD 4.9): FR-50 sampai FR-54, NFR-05, NFR-06.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 2]);
});

function daftar_anak(array $query = [])
{
    return test()->get(route('data-anak', $query));
}

test('daftar menampilkan seluruh anak urut nama dengan NIK tersamar (FR-50, NFR-05)', function () {
    Anak::factory()->create(['nama' => 'Raka', 'nik' => '1871010101010042']);
    Anak::factory()->create(['nama' => 'Ayu']);

    daftar_anak()->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-anak/daftar')
        ->where('jumlah', 2)
        ->where('adaAnak', true)
        ->has('anak.data', 2)
        ->where('anak.data.0.nama', 'Ayu')
        ->where('anak.data.1.nikSamar', '1871••••••••0042')
        ->missing('anak.data.1.nik')
        ->has('daftarKelompokUmur', 5));
});

test('daftar kosong menandai belum ada anak terdaftar', function () {
    daftar_anak()->assertInertia(fn ($page) => $page
        ->where('jumlah', 0)
        ->where('adaAnak', false)
        ->has('anak.data', 0));
});

test('cari dengan nama anak, nama ibu, atau sebagian NIK (FR-50)', function () {
    Anak::factory()->create(['nama' => 'Nayla Putri', 'nama_ibu' => 'Dewi', 'nik' => '1871010101010042']);
    Anak::factory()->create(['nama' => 'Raka', 'nama_ibu' => 'Sari', 'nik' => '1871010101019999']);

    daftar_anak(['cari' => 'nay'])->assertInertia(fn ($page) => $page->where('jumlah', 1)->where('anak.data.0.nama', 'Nayla Putri'));
    daftar_anak(['cari' => 'sari'])->assertInertia(fn ($page) => $page->where('jumlah', 1)->where('anak.data.0.nama', 'Raka'));
    daftar_anak(['cari' => '0042'])->assertInertia(fn ($page) => $page->where('jumlah', 1));
    // Kata terlalu pendek diabaikan.
    daftar_anak(['cari' => 'na'])->assertInertia(fn ($page) => $page->where('jumlah', 2));
});

test('saring jenis kelamin, kelompok umur, dan dusun sekaligus (FR-50)', function () {
    Anak::factory()->create(['nama' => 'A', 'jenis_kelamin' => 'L', 'tanggal_lahir' => today()->subMonths(8), 'dusun' => 'Melati']);
    Anak::factory()->create(['nama' => 'B', 'jenis_kelamin' => 'P', 'tanggal_lahir' => today()->subMonths(8), 'dusun' => 'Melati']);
    Anak::factory()->create(['nama' => 'C', 'jenis_kelamin' => 'L', 'tanggal_lahir' => today()->subMonths(30), 'dusun' => 'Melati']);
    Anak::factory()->create(['nama' => 'D', 'jenis_kelamin' => 'L', 'tanggal_lahir' => today()->subMonths(8), 'dusun' => 'Mawar']);

    daftar_anak(['jk' => 'L'])->assertInertia(fn ($page) => $page->where('jumlah', 3));
    daftar_anak(['umur' => '6-11'])->assertInertia(fn ($page) => $page->where('jumlah', 3));
    daftar_anak(['dusun' => 'Mawar'])->assertInertia(fn ($page) => $page->where('jumlah', 1));
    daftar_anak(['jk' => 'L', 'umur' => '6-11', 'dusun' => 'Melati'])->assertInertia(fn ($page) => $page
        ->where('jumlah', 1)
        ->where('anak.data.0.nama', 'A')
        ->where('penyaring', ['cari' => '', 'jk' => 'L', 'umur' => '6-11', 'dusun' => 'Melati']));

    // Nilai tidak dikenal diabaikan.
    daftar_anak(['jk' => 'X', 'umur' => '1-2'])->assertInertia(fn ($page) => $page
        ->where('jumlah', 4)
        ->where('penyaring.jk', null)
        ->where('penyaring.umur', null));

    daftar_anak()->assertInertia(fn ($page) => $page->where('daftarDusun', ['Mawar', 'Melati']));
});

test('kelompok umur sama dengan umur bulan penuh pada batasnya', function () {
    $hariIni = CarbonImmutable::parse('2026-03-31');
    Carbon::setTestNow($hariIni);

    // Lahir pada tanggal-tanggal di sekitar batas, termasuk akhir bulan.
    $tanggal = collect(range(0, 800))->map(fn (int $hari) => $hariIni->subDays($hari));

    foreach ($tanggal as $lahir) {
        Anak::factory()->create(['tanggal_lahir' => $lahir]);
    }

    foreach (KelompokUmur::cases() as $kelompok) {
        [$bawah, $atas] = $kelompok->batas();
        $harapan = $tanggal->filter(function (CarbonImmutable $lahir) use ($bawah, $atas, $hariIni) {
            $umur = Umur::bulanPenuh($lahir, $hariIni);

            return $umur >= $bawah && ($atas === null || $umur <= $atas);
        })->count();

        expect($kelompok->terapkan(Anak::query(), $hariIni)->count())->toBe($harapan, $kelompok->value);
    }

    Carbon::setTestNow();
});

test('daftar dimuat bertahap 20 anak (Tampilkan lebih banyak)', function () {
    Anak::factory()->count(25)->create();

    daftar_anak()->assertInertia(fn ($page) => $page->where('jumlah', 25)->has('anak.data', 20));
});

test('kartu menandai anak yang sudah di antrean hari ini dan kunjungan terakhir', function () {
    $anak = Anak::factory()->create();
    Kunjungan::factory()->for($anak)->create(['tanggal' => today()->subMonth()]);
    Kunjungan::factory()->for($anak)->create(['tanggal' => today()]);

    daftar_anak()->assertInertia(fn ($page) => $page
        ->where('anak.data.0.sudahDiAntrean', true)
        ->where('anak.data.0.kunjunganTerakhir', fn ($nilai) => $nilai !== null));
});

test('detail anak menampilkan identitas lengkap termasuk NIK (FR-51, NFR-05)', function () {
    $anak = Anak::factory()->create([
        'nama' => 'Nayla Putri',
        'jenis_kelamin' => 'P',
        'nik' => '1871010101010042',
        'nik_ibu' => '1871010101010001',
        'rt' => 3,
        'rw' => 1,
    ]);

    $this->get(route('data-anak.detail', $anak))->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-anak/detail')
        ->where('anak.nama', 'Nayla Putri')
        ->where('anak.jenisKelamin', 'P')
        ->where('anak.nik', '1871010101010042')
        ->where('anak.nikIbu', '1871010101010001')
        ->where('anak.rt', 3)
        ->has('pengukuran', 0)
        ->has('kunjungan', 0)
        ->has('layanan', 0));
});

test('detail anak memuat riwayat pengukuran, kunjungan, dan layanan; Buku KIA ditandai (FR-51, FR-66)', function () {
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths(14)]);
    $kunjungan = Kunjungan::factory()->for($anak)->selesai()->create(['tanggal' => today()->subMonth()]);
    Pengukuran::factory()->for($anak)->create([
        'kunjungan_id' => $kunjungan->id,
        'tanggal_ukur' => today()->subMonth(),
        'bb' => '9.4',
    ]);
    Pengukuran::factory()->dariBukuKia()->for($anak)->create([
        'tanggal_ukur' => today()->subMonths(3),
        'bb' => '8.1',
    ]);
    Layanan::factory()->for($anak)->create([
        'jenis' => 'imunisasi',
        'detail' => 'MR 1',
        'tanggal' => today()->subMonths(5),
        'sumber' => 'buku_kia',
        'kunjungan_id' => null,
    ]);

    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page
        ->has('pengukuran', 2)
        ->where('pengukuran.0.bb', '9.4')
        ->where('pengukuran.0.umurBulan', 13)
        ->where('pengukuran.0.dariBukuKia', false)
        ->where('pengukuran.1.dariBukuKia', true)
        ->has('kunjungan', 1)
        ->where('kunjungan.0.keadaan', 'Selesai')
        ->has('layanan', 1)
        ->where('layanan.0.jenis', 'Imunisasi')
        ->where('layanan.0.detail', 'MR 1')
        ->where('layanan.0.dariBukuKia', true));
});

test('anak yang dihapus tidak dapat dibuka detailnya', function () {
    $anak = Anak::factory()->create();
    $anak->delete();

    $this->get(route('data-anak.detail', $anak))->assertNotFound();
});

function isian_ubah(Anak $anak, array $ganti = []): array
{
    return [
        'nama' => $anak->nama,
        'jenis_kelamin' => $anak->jenis_kelamin->value,
        'tempat_lahir' => $anak->tempat_lahir,
        'tanggal_lahir' => $anak->tanggal_lahir->toDateString(),
        'nik' => $anak->nik,
        'punya_buku_kia' => $anak->punya_buku_kia === null ? '' : ($anak->punya_buku_kia ? '1' : '0'),
        'nama_ibu' => $anak->nama_ibu,
        'nik_ibu' => $anak->nik_ibu,
        'nama_ayah' => $anak->nama_ayah,
        'nik_ayah' => $anak->nik_ayah,
        'no_hp' => $anak->no_hp,
        'alamat' => $anak->alamat,
        'rt' => $anak->rt,
        'rw' => $anak->rw,
        'dusun' => $anak->dusun,
        ...$ganti,
    ];
}

test('formulir ubah terisi data anak (S16)', function () {
    $anak = Anak::factory()->create(['nama' => 'Raka', 'rt' => null, 'nik' => null]);

    $this->get(route('data-anak.ubah', $anak))->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-anak/ubah')
        ->where('anak.nama', 'Raka')
        ->where('anak.rt', '')
        ->where('anak.nik', '')
        ->where('anak.tanggal_lahir', $anak->tanggal_lahir->toDateString()));
});

test('kader mengubah data anak dan perubahan tercatat di log aktivitas (FR-52, NFR-06)', function () {
    $kader = User::factory()->create(['name' => 'Dewi Lestari']);
    $this->actingAs($kader);
    $anak = Anak::factory()->create(['nama' => 'Raka', 'alamat' => 'Jl. Lama', 'dusun' => 'Melati']);

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak, [
        'nama' => 'Raka Pratama',
        'alamat' => 'Jl. Baru 7',
        'no_hp' => '0812 3456 7890',
    ]))->assertRedirect(route('data-anak.detail', $anak));

    $anak->refresh();
    expect($anak->nama)->toBe('Raka Pratama')
        ->and($anak->alamat)->toBe('Jl. Baru 7')
        ->and($anak->no_hp)->toBe('081234567890');

    $log = $anak->activitiesAsSubject()->sole();
    expect($log->event)->toBe('updated')
        ->and($log->log_name)->toBe('anak')
        ->and($log->causer?->is($kader))->toBeTrue()
        ->and($log->attribute_changes['attributes'])->toBe(['nama' => 'Raka Pratama', 'no_hp' => '081234567890', 'alamat' => 'Jl. Baru 7'])
        ->and($log->attribute_changes['old'])->toMatchArray(['nama' => 'Raka', 'alamat' => 'Jl. Lama']);

    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page
        ->where('perubahanTerakhir.oleh', 'Dewi Lestari'));
});

test('punya Buku KIA wajib dipilih saat mengubah data lama dan tercatat di log (FR-52, FR-61)', function () {
    $anak = Anak::factory()->create(['punya_buku_kia' => null]);

    $this->get(route('data-anak.ubah', $anak))->assertInertia(fn ($page) => $page
        ->where('anak.punya_buku_kia', ''));
    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page
        ->where('anak.punyaBukuKia', null));

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak))
        ->assertSessionHasErrors(['punya_buku_kia' => 'Pilih apakah anak punya Buku KIA.']);

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak, ['punya_buku_kia' => '0']))
        ->assertSessionHasNoErrors();

    expect($anak->refresh()->punya_buku_kia)->toBeFalse()
        ->and($anak->activitiesAsSubject()->sole()->attribute_changes['attributes'])->toBe(['punya_buku_kia' => false]);
});

test('menyimpan tanpa perubahan tidak menambah log', function () {
    $anak = Anak::factory()->create();

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak))->assertRedirect();

    expect($anak->activitiesAsSubject()->count())->toBe(0);
});

test('validasi ubah data sama dengan Tambah Anak; NIK sendiri boleh tetap (PRD 7.2)', function () {
    $lain = Anak::factory()->create(['nik' => '1871010101010099']);
    $anak = Anak::factory()->create(['nik' => '1871010101010042']);

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak))->assertSessionHasNoErrors();

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak, [
        'nik' => '1871010101010099',
        'nama' => '',
        'tanggal_lahir' => today()->addDay()->toDateString(),
        'no_hp' => '123',
        'jenis_kelamin' => 'X',
    ]))->assertSessionHasErrors(['nik', 'nama', 'tanggal_lahir', 'no_hp', 'jenis_kelamin']);

    expect($anak->refresh()->nik)->toBe('1871010101010042');
});

test('NIK milik anak yang dihapus tetap tidak boleh dipakai (FR-11, FR-53)', function () {
    $terhapus = Anak::factory()->create(['nik' => '1871010101010077']);
    $terhapus->delete();
    $anak = Anak::factory()->create();

    $this->put(route('data-anak.perbarui', $anak), isian_ubah($anak, ['nik' => '1871010101010077']))
        ->assertSessionHasErrors('nik');
});

test('kader biasa tidak dapat menghapus, melihat data terhapus, atau memulihkan (FR-53)', function () {
    $anak = Anak::factory()->create(['nama' => 'Raka']);

    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page->where('bolehHapus', false));
    daftar_anak()->assertInertia(fn ($page) => $page->where('jumlahTerhapus', null));
    $this->delete(route('data-anak.hapus', $anak), ['konfirmasi' => 'Raka'])->assertForbidden();
    $this->get(route('data-anak.terhapus'))->assertForbidden();

    $anak->delete();
    $this->post(route('data-anak.pulihkan', $anak))->assertForbidden();
    expect($anak->refresh()->trashed())->toBeTrue();
});

test('Ketua menghapus setelah mengetik nama anak; tercatat di log (FR-53, NFR-06)', function () {
    $ketua = User::factory()->ketua()->create(['name' => 'Sri']);
    $this->actingAs($ketua);
    $anak = Anak::factory()->create(['nama' => 'Raka Pratama']);

    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page->where('bolehHapus', true));

    $this->delete(route('data-anak.hapus', $anak), ['konfirmasi' => 'Raka'])
        ->assertSessionHasErrors(['konfirmasi' => 'Nama yang diketik tidak sama dengan nama anak.']);
    expect($anak->refresh()->trashed())->toBeFalse();

    $this->delete(route('data-anak.hapus', $anak), ['konfirmasi' => '  raka pratama '])
        ->assertRedirect(route('data-anak'));

    expect($anak->refresh()->trashed())->toBeTrue();
    $log = $anak->activitiesAsSubject()->where('event', 'deleted')->sole();
    expect($log->causer?->is($ketua))->toBeTrue();

    // Hilang dari daftar dan pencarian Meja 1, muncul di Data terhapus.
    daftar_anak()->assertInertia(fn ($page) => $page->where('jumlah', 0)->where('jumlahTerhapus', 1));
    $this->get(route('data-anak.terhapus'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('data-anak/terhapus')
        ->has('anak', 1)
        ->where('anak.0.nama', 'Raka Pratama')
        ->where('anak.0.dihapusOleh', 'Sri')
        ->where('anak.0.sisaHari', 30));
});

test('anak yang masih di antrean hari ini tidak dapat dihapus', function () {
    $this->actingAs(User::factory()->ketua()->create());
    $anak = Anak::factory()->create(['nama' => 'Raka']);
    Kunjungan::factory()->for($anak)->create(['tanggal' => today()]);

    $this->delete(route('data-anak.hapus', $anak), ['konfirmasi' => 'Raka'])
        ->assertSessionHasErrors('konfirmasi');

    expect($anak->refresh()->trashed())->toBeFalse();
});

test('Ketua memulihkan anak terhapus beserta riwayatnya (FR-53)', function () {
    $this->actingAs(User::factory()->ketua()->create());
    $anak = Anak::factory()->create(['nama' => 'Raka']);
    Pengukuran::factory()->dariBukuKia()->for($anak)->create();
    $anak->delete();

    $this->post(route('data-anak.pulihkan', $anak))->assertRedirect(route('data-anak.detail', $anak));

    expect($anak->refresh()->trashed())->toBeFalse()
        ->and($anak->pengukuran()->count())->toBe(1)
        ->and($anak->activitiesAsSubject()->where('event', 'restored')->exists())->toBeTrue();
});

test('model:prune menghapus permanen anak yang terhapus lebih dari 30 hari beserta riwayatnya', function () {
    $lama = Anak::factory()->create();
    $kunjungan = Kunjungan::factory()->for($lama)->selesai()->create(['tanggal' => today()->subMonths(2)]);
    Pengukuran::factory()->for($lama)->create(['kunjungan_id' => $kunjungan->id]);
    $baru = Anak::factory()->create();
    $aktif = Anak::factory()->create();

    Carbon::setTestNow(now()->subDays(31));
    $lama->delete();
    Carbon::setTestNow(now()->addDays(2));
    $baru->delete();
    Carbon::setTestNow();

    $this->artisan('model:prune', ['--model' => [Anak::class]])->assertSuccessful();

    expect(Anak::withTrashed()->find($lama->id))->toBeNull()
        ->and(Kunjungan::query()->where('anak_id', $lama->id)->exists())->toBeFalse()
        ->and(Pengukuran::query()->where('anak_id', $lama->id)->exists())->toBeFalse()
        ->and(Anak::withTrashed()->find($baru->id)?->trashed())->toBeTrue()
        ->and(Anak::query()->find($aktif->id))->not->toBeNull();
});

test('pemangkasan dijadwalkan setiap hari', function () {
    $this->artisan('schedule:list')->expectsOutputToContain('model:prune')->assertSuccessful();
});

test('unduh CSV Data Anak sesuai PRD 7.3: BOM, titik koma, DD/MM/YYYY, NIK teks, nama berkas (FR-54)', function () {
    Carbon::setTestNow(CarbonImmutable::parse('2026-11-03 09:00'));

    $anak = Anak::factory()->create([
        'nama' => 'Nayla; Putri',
        'jenis_kelamin' => 'P',
        'tempat_lahir' => 'Bandar Lampung',
        'tanggal_lahir' => '2025-05-09',
        'nik' => '1871010101010042',
        'punya_buku_kia' => true,
        'nama_ibu' => 'Dewi "Ani"',
        'nik_ibu' => null,
        'nama_ayah' => null,
        'nik_ayah' => null,
        'no_hp' => '081234567890',
        'alamat' => 'Jl. Melati 5',
        'rt' => 3,
        'rw' => null,
        'dusun' => 'Melati',
    ]);
    Kunjungan::factory()->for($anak)->selesai()->create(['tanggal' => '2026-10-05']);

    $respons = $this->get(route('data-anak.unduh'));
    $respons->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
        ->assertDownload('data-anak_03-11-2026.csv');

    $isi = $respons->streamedContent();

    expect($isi)->toStartWith("\xEF\xBB\xBF")
        ->and(explode("\r\n", substr($isi, 3)))->toBe([
            'Nama;NIK;"Punya Buku KIA";"Jenis Kelamin";"Tempat Lahir";"Tanggal Lahir";"Umur (bulan)";"Nama Ibu";"NIK Ibu";"Nama Ayah";"NIK Ayah";"No HP";Alamat;RT;RW;Dusun;"Kunjungan Terakhir"',
            '"Nayla; Putri";"=""1871010101010042""";Ya;Perempuan;"Bandar Lampung";09/05/2025;17;"Dewi ""Ani""";;;;"=""081234567890""";"Jl. Melati 5";3;;Melati;05/10/2026',
            '',
        ]);

    Carbon::setTestNow();
});

test('unduh CSV mengikuti cari dan penyaring aktif; kosong ditolak dengan pesan', function () {
    Anak::factory()->create(['nama' => 'Ayu', 'jenis_kelamin' => 'P']);
    Anak::factory()->create(['nama' => 'Bima', 'jenis_kelamin' => 'L']);
    Anak::factory()->create(['nama' => 'Citra', 'jenis_kelamin' => 'P']);

    $baris = fn (array $query) => array_slice(
        explode("\r\n", trim($this->get(route('data-anak.unduh', $query))->streamedContent())),
        1,
    );

    expect($baris(['jk' => 'P']))->toHaveCount(2)
        ->and($baris(['jk' => 'P'])[0])->toStartWith('Ayu;')
        ->and($baris(['cari' => 'bima']))->toHaveCount(1);

    $this->get(route('data-anak.unduh', ['cari' => 'zzzz']))
        ->assertStatus(422)
        ->assertJson(['pesan' => 'Tidak ada data untuk penyaring ini.']);
});

test('detail anak menampilkan grafik pertumbuhan dan deteksi stunting (FR-51, FR-66, PRD 5.8)', function () {
    $anak = Anak::factory()->create(['jenis_kelamin' => 'P', 'tanggal_lahir' => today()->subMonths(30)->toDateString()]);
    Pengukuran::factory()->dariBukuKia()->for($anak)->create([
        'tanggal_ukur' => today()->subMonths(2)->toDateString(), 'bb' => 12.0, 'pb_tb' => 80.0, 'cara_ukur' => 'berdiri',
    ]);
    Pengukuran::factory()->for($anak)->create([
        'tanggal_ukur' => today()->toDateString(), 'bb' => 12.4, 'pb_tb' => 81.0, 'cara_ukur' => 'berdiri',
    ]);

    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page
        ->where('pertumbuhan.stunting.hasil', 'stunting')
        ->where('pertumbuhan.grafik.jenisKelamin', 'P')
        ->where('pertumbuhan.grafik.pakaiPanjang', false)
        ->has('pertumbuhan.grafik.daftar.pb_tb_u.titik', 2)
        ->where('pertumbuhan.grafik.daftar.pb_tb_u.titik.0.dariBukuKia', true));
});

test('detail anak tanpa pengukuran tidak memuat grafik', function () {
    $anak = Anak::factory()->create();

    $this->get(route('data-anak.detail', $anak))->assertInertia(fn ($page) => $page->where('pertumbuhan', null));
});
