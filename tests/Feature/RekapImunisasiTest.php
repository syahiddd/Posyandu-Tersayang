<?php

use App\Enums\JenisLayanan;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Layanan;
use App\Models\User;
use App\Support\MejaAktif;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/*
| S18 Rekapitulasi Imunisasi (PRD 4.10): FR-55 dan FR-56. Baris = semua
| balita (0–59 bulan) pada akhir periode sesuai saringan dusun.
*/

beforeEach(function () {
    Carbon::setTestNow(CarbonImmutable::parse('2026-11-11 09:00'));
    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 1]);
});

afterEach(function () {
    Carbon::setTestNow();
});

function imunisasi(Anak $anak, string $dosis, string $tanggal, SumberData $sumber = SumberData::Posyandu): Layanan
{
    return Layanan::factory()->for($anak)->create([
        'jenis' => JenisLayanan::Imunisasi,
        'detail' => $dosis,
        'tanggal' => $tanggal,
        'sumber' => $sumber,
    ]);
}

function rekap(array $query = [])
{
    return test()->get(route('rekap-imunisasi', $query))->assertOk();
}

test('rekap memakai periode bawaan 1 Januari sampai hari ini dan kolom dosis Tabel 29 (FR-55)', function () {
    rekap()->assertInertia(fn ($page) => $page
        ->component('rekap-imunisasi/index')
        ->where('penyaring', ['dari' => '2026-01-01', 'sampai' => '2026-11-11', 'vaksin' => null, 'dusun' => null])
        ->where('galatPeriode', null)
        ->where('adaAnak', false)
        ->has('kolom', 21)
        ->where('kolom.0', ['kode' => 'HB0', 'nama' => 'Hepatitis B (HB0)'])
        ->where('kolom.20.kode', 'MR 2')
        ->has('daftarVaksin', 9));
});

test('semua balita tampil; sel berisi tanggal dalam periode dan tanda Buku KIA (FR-55, FR-66)', function () {
    $raka = Anak::factory()->create(['nama' => 'Raka', 'tanggal_lahir' => '2026-02-01', 'dusun' => 'Melati']);
    $ayu = Anak::factory()->create(['nama' => 'Ayu', 'tanggal_lahir' => '2025-06-01', 'dusun' => 'Mawar']);
    imunisasi($raka, 'BCG', '2026-03-05');
    imunisasi($raka, 'OPV 1', '2026-03-05', SumberData::BukuKia);
    imunisasi($raka, 'MR 1', '2025-12-30');

    rekap()->assertInertia(fn ($page) => $page
        ->where('adaAnak', true)
        ->has('baris', 2)
        ->where('baris.0.nama', 'Ayu')
        ->where('baris.0.sel', array_fill(0, 21, null))
        ->where('baris.1.nama', 'Raka')
        ->where('baris.1.umurBulan', 9)
        ->where('baris.1.sel.1', ['tanggal' => '5 Mar 2026', 'dariBukuKia' => false])
        ->where('baris.1.sel.2', ['tanggal' => '5 Mar 2026', 'dariBukuKia' => true])
        // MR 1 di luar periode tidak tampil.
        ->where('baris.1.sel.15', null));
});

test('ringkasan jumlah anak per vaksin dan per dosis (FR-56)', function () {
    $a = Anak::factory()->create(['tanggal_lahir' => '2026-01-10']);
    $b = Anak::factory()->create(['tanggal_lahir' => '2026-01-20']);
    Anak::factory()->create(['tanggal_lahir' => '2026-03-01']);
    imunisasi($a, 'OPV 1', '2026-02-10');
    imunisasi($a, 'OPV 2', '2026-03-10');
    imunisasi($b, 'OPV 1', '2026-02-20');
    imunisasi($b, 'BCG', '2026-02-20');

    rekap()->assertInertia(fn ($page) => $page
        ->has('baris', 3)
        ->where('cakupan.1', ['kode' => 'BCG', 'nama' => 'BCG', 'jumlah' => 1])
        ->where('cakupan.2', ['kode' => 'OPV', 'nama' => 'Polio tetes (OPV)', 'jumlah' => 2])
        ->where('jumlahPerDosis.1', 1)
        ->where('jumlahPerDosis.2', 2)
        ->where('jumlahPerDosis.4', 1)
        ->where('jumlahPerDosis.0', 0));
});

test('saring periode, jenis vaksin, dan dusun (FR-56)', function () {
    $melati = Anak::factory()->create(['nama' => 'Melati', 'tanggal_lahir' => '2025-01-10', 'dusun' => 'Melati']);
    Anak::factory()->create(['nama' => 'Mawar', 'tanggal_lahir' => '2025-01-10', 'dusun' => 'Mawar']);
    imunisasi($melati, 'DPT-HB-Hib 1', '2025-03-10');
    imunisasi($melati, 'DPT-HB-Hib 4', '2026-07-10');
    imunisasi($melati, 'BCG', '2025-02-10');

    rekap(['dari' => '2025-01-01', 'sampai' => '2026-11-11', 'vaksin' => 'DPT-HB-Hib', 'dusun' => 'Melati'])
        ->assertInertia(fn ($page) => $page
            ->where('penyaring.vaksin', 'DPT-HB-Hib')
            ->where('kolom', [
                ['kode' => 'DPT-HB-Hib 1', 'nama' => 'DPT-HB-Hib 1'],
                ['kode' => 'DPT-HB-Hib 2', 'nama' => 'DPT-HB-Hib 2'],
                ['kode' => 'DPT-HB-Hib 3', 'nama' => 'DPT-HB-Hib 3'],
                ['kode' => 'DPT-HB-Hib 4', 'nama' => 'DPT-HB-Hib lanjutan (4)'],
            ])
            ->has('baris', 1)
            ->where('baris.0.sel', [
                ['tanggal' => '10 Mar 2025', 'dariBukuKia' => false],
                null,
                null,
                ['tanggal' => '10 Jul 2026', 'dariBukuKia' => false],
            ])
            ->where('cakupan', [['kode' => 'DPT-HB-Hib', 'nama' => 'DPT-HB-Hib', 'jumlah' => 1]]));

    rekap(['dari' => '2026-01-01', 'sampai' => '2026-06-30', 'vaksin' => 'DPT-HB-Hib', 'dusun' => 'Melati'])
        ->assertInertia(fn ($page) => $page->where('baris.0.sel', [null, null, null, null]));
});

test('hanya balita 0–59 bulan pada akhir periode; anak terhapus tidak tampil', function () {
    Anak::factory()->create(['nama' => 'Lima Tahun', 'tanggal_lahir' => '2021-11-11']);
    Anak::factory()->create(['nama' => 'Hampir Lima', 'tanggal_lahir' => '2021-11-12']);
    Anak::factory()->create(['nama' => 'Terhapus', 'tanggal_lahir' => '2025-01-01'])->delete();

    rekap()->assertInertia(fn ($page) => $page->has('baris', 1)->where('baris.0.nama', 'Hampir Lima'));

    // Pada akhir periode yang lebih awal, anak yang belum lahir tidak dihitung
    // dan anak yang kini 60 bulan masih balita.
    Anak::factory()->create(['nama' => 'Bayi Baru', 'tanggal_lahir' => '2026-10-01']);
    rekap(['dari' => '2026-01-01', 'sampai' => '2026-06-30'])->assertInertia(fn ($page) => $page
        ->has('baris', 2)
        ->where('baris.0.nama', 'Hampir Lima')
        ->where('baris.1.nama', 'Lima Tahun'));
});

test('penyaring tidak sah diabaikan; sampai sebelum dari ditolak dengan pesan', function () {
    rekap(['dari' => '2026-02-30', 'sampai' => '2027-01-01', 'vaksin' => 'XYZ', 'dusun' => ' '])
        ->assertInertia(fn ($page) => $page
            ->where('penyaring', ['dari' => '2026-01-01', 'sampai' => '2026-11-11', 'vaksin' => null, 'dusun' => null]));

    rekap(['dari' => '2026-05-01', 'sampai' => '2026-04-01'])->assertInertia(fn ($page) => $page
        ->where('galatPeriode', 'Tanggal sampai tidak boleh sebelum tanggal dari.')
        ->where('baris', []));
});

test('unduh CSV rekap sesuai PRD 7.3: BOM, titik koma, DD/MM/YYYY, NIK teks, baris jumlah (FR-58)', function () {
    $nayla = Anak::factory()->perempuan()->create([
        'nama' => 'Nayla',
        'nik' => '1871010101010042',
        'tanggal_lahir' => '2026-01-10',
        'dusun' => 'Melati',
    ]);
    Anak::factory()->lakiLaki()->create([
        'nama' => 'Raka',
        'nik' => null,
        'tanggal_lahir' => '2026-02-01',
        'dusun' => 'Melati',
    ]);
    imunisasi($nayla, 'PCV 1', '2026-03-10', SumberData::BukuKia);
    imunisasi($nayla, 'PCV 2', '2026-04-10');

    $respons = $this->get(route('rekap-imunisasi.unduh', ['vaksin' => 'PCV']));
    $respons->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
        ->assertDownload('rekap-imunisasi_11-11-2026.csv');

    $isi = $respons->streamedContent();

    expect($isi)->toStartWith("\xEF\xBB\xBF")
        ->and(explode("\r\n", substr($isi, 3)))->toBe([
            'Nama;NIK;"Jenis Kelamin";"Tanggal Lahir";Dusun;"PCV 1";"PCV 2";"PCV 3"',
            'Nayla;"=""1871010101010042""";Perempuan;10/01/2026;Melati;10/03/2026;10/04/2026;',
            'Raka;;Laki-laki;01/02/2026;Melati;;;',
            '"Jumlah anak";;;;;1;1;0',
            '',
        ]);
});

test('unduh CSV rekap kosong atau periode salah ditolak dengan pesan', function () {
    $this->get(route('rekap-imunisasi.unduh'))
        ->assertStatus(422)
        ->assertJson(['pesan' => 'Tidak ada data untuk penyaring ini.']);

    Anak::factory()->create(['tanggal_lahir' => '2026-01-10']);

    $this->get(route('rekap-imunisasi.unduh', ['dari' => '2026-05-01', 'sampai' => '2026-04-01']))->assertStatus(422);
    $this->get(route('rekap-imunisasi.unduh'))->assertOk();
});
