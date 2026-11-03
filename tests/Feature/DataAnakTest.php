<?php

use App\Anak\KelompokUmur;
use App\Models\Anak;
use App\Models\Kunjungan;
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
