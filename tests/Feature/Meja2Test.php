<?php

use App\Enums\CaraUkur;
use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Enums\StatusNT;
use App\Enums\SumberData;
use App\Gizi\StatusPenimbangan;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Pengukuran;
use App\Models\User;
use App\Support\MejaAktif;

/*
| Meja 2 Pengukuran (PRD 4.4): FR-18 sampai FR-23, PRD 5.5 (N/T, KBM), 7.2.
*/

function buka_di_meja2(int $umurBulan = 13, array $kunjungan = []): Kunjungan
{
    $anak = Anak::factory()->create(['tanggal_lahir' => today()->subMonths($umurBulan)->toDateString()]);
    $k = Kunjungan::factory()->for($anak)->diMeja(Meja::Pengukuran)->create($kunjungan);

    test()->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 2]);
    test()->post(route('kunjungan.buka', $k));

    return $k->fresh();
}

function ukur(Kunjungan $k, array $data = [])
{
    return test()->put(route('kunjungan.pengukuran', $k), [
        'bb' => '8,5',
        'pb_tb' => '72,0',
        'cara_ukur' => 'telentang',
        'lila' => '',
        'lk' => '',
        ...$data,
    ]);
}

test('layar Meja 2 mengisi cara ukur sesuai umur (FR-21)', function (int $umur, string $cara) {
    $k = buka_di_meja2($umur);

    $this->get(route('kunjungan.layar', $k))
        ->assertInertia(fn ($page) => $page->component('kunjungan/pengukuran')->where('caraUkurBawaan', $cara));
})->with([
    '23 bulan telentang' => [23, 'telentang'],
    '24 bulan berdiri' => [24, 'berdiri'],
]);

test('nilai pembanding memakai pengukuran sebelumnya, termasuk dari Buku KIA', function () {
    $k = buka_di_meja2();
    Pengukuran::factory()->dariBukuKia()->for($k->anak)->create([
        'tanggal_ukur' => today()->subMonth()->toDateString(),
        'bb' => '13.0',
        'pb_tb' => '87.4',
    ]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('sebelumnya.bb', '13.0')
        ->where('sebelumnya.sumber', 'buku_kia'));
});

test('menyimpan pengukuran lalu meneruskan anak ke Meja 3 (FR-19, FR-23)', function () {
    $k = buka_di_meja2();

    ukur($k, ['lila' => '13.4', 'lk' => '45'])->assertRedirect(route('meja', 2));

    $p = $k->pengukuran()->sole();
    expect($p)
        ->bb->toBe('8.5')
        ->pb_tb->toBe('72.0')
        ->lila->toBe('13.4')
        ->lk->toBe('45.0')
        ->cara_ukur->toBe(CaraUkur::Telentang)
        ->sumber->toBe(SumberData::Posyandu);

    expect($k->fresh())
        ->meja_saat_ini->toBe(Meja::Pendataan)
        ->status->toBe(StatusAntrean::Menunggu)
        ->selesai_meja_2_pada->not->toBeNull();
});

test('8,5 dan 8.5 tersimpan sebagai angka yang sama (kriteria penerimaan 4.4)', function () {
    $k1 = buka_di_meja2();
    ukur($k1, ['bb' => '8,5']);
    $k2 = buka_di_meja2();
    ukur($k2, ['bb' => '8.5']);

    expect($k1->pengukuran->bb)->toBe($k2->pengukuran->bb)->toBe('8.5');
});

test('tidak dapat disimpan selama BB atau PB/TB kosong (kriteria penerimaan 4.4)', function (string $isian) {
    $k = buka_di_meja2();

    ukur($k, [$isian => ''])->assertSessionHasErrors($isian);

    expect($k->fresh()->meja_saat_ini)->toBe(Meja::Pengukuran);
})->with(['bb', 'pb_tb']);

test('nilai di luar batas wajar ditolak (FR-22, PRD 7.2)', function (string $isian, string $nilai) {
    $k = buka_di_meja2();

    ukur($k, [$isian => $nilai])->assertSessionHasErrors($isian);
})->with([
    'BB 0,9' => ['bb', '0,9'],
    'BB 35,1' => ['bb', '35,1'],
    'PB 39,9' => ['pb_tb', '39,9'],
    'PB 130,1' => ['pb_tb', '130,1'],
    'LiLA 6,9' => ['lila', '6,9'],
    'LiLA 25,1' => ['lila', '25,1'],
    'LK 27,9' => ['lk', '27,9'],
    'LK 60,1' => ['lk', '60,1'],
    'dua desimal' => ['bb', '8,55'],
    'cara ukur lain' => ['cara_ukur', 'duduk'],
]);

test('perubahan BB lebih dari 20% hanya diperingatkan, tetap tersimpan (FR-22)', function () {
    $k = buka_di_meja2();
    Pengukuran::factory()->for($k->anak)->create(['tanggal_ukur' => today()->subMonth()->toDateString(), 'bb' => '6.0']);

    ukur($k, ['bb' => '9,0'])->assertSessionHasNoErrors();

    expect($k->fresh()->meja_saat_ini)->toBe(Meja::Pendataan);
});

test('status N bila kenaikan BB sama dengan KBM atau lebih (PRD 5.5)', function () {
    $k = buka_di_meja2(13);
    Pengukuran::factory()->for($k->anak)->create(['tanggal_ukur' => today()->subMonthNoOverflow()->toDateString(), 'bb' => '8.3']);

    ukur($k, ['bb' => '8,5']);

    expect($k->pengukuran->status_nt)->toBe(StatusNT::Naik);
});

test('status T bila kenaikan BB kurang dari KBM (PRD 5.5)', function () {
    $k = buka_di_meja2(13);
    Pengukuran::factory()->for($k->anak)->create(['tanggal_ukur' => today()->subMonthNoOverflow()->toDateString(), 'bb' => '8.4']);

    ukur($k, ['bb' => '8,5']);

    expect($k->pengukuran->status_nt)->toBe(StatusNT::TidakNaik);
});

test('tanpa penimbangan bulan lalu statusnya "tidak ditimbang bulan lalu" (PRD 5.5)', function () {
    $k = buka_di_meja2(13);
    Pengukuran::factory()->for($k->anak)->create(['tanggal_ukur' => today()->subMonthsNoOverflow(2)->toDateString(), 'bb' => '7.0']);

    ukur($k);

    expect($k->pengukuran->status_nt)->toBe(StatusNT::TidakDitimbangBulanLalu);
});

test('KBM sesuai PRD Tabel 26', function (int $umur, ?int $gram) {
    expect(StatusPenimbangan::kbmGram($umur))->toBe($gram);
})->with([
    [0, null], [1, 800], [2, 900], [3, 800], [4, 600], [5, 500],
    [6, 400], [7, 400], [8, 300], [11, 300], [12, 200], [60, 200], [61, null],
]);

test('ukur ulang setelah dikembalikan memperbarui pengukuran yang sama', function () {
    $k = buka_di_meja2();
    ukur($k, ['bb' => '8,5']);

    $k->refresh()->update([
        'meja_saat_ini' => Meja::Pengukuran,
        'status' => StatusAntrean::Menunggu,
        'perlu_ukur_ulang' => true,
        'alasan_kembali' => 'BB tertukar',
    ]);
    $this->post(route('kunjungan.buka', $k));
    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('nilaiAwal.bb', '8,5')
        ->where('anak.perluUkurUlang', true));

    ukur($k, ['bb' => '9,1']);

    expect(Pengukuran::query()->where('kunjungan_id', $k->id)->count())->toBe(1)
        ->and($k->pengukuran()->sole()->bb)->toBe('9.1')
        ->and($k->fresh()->perlu_ukur_ulang)->toBeFalse();
});

test('isian yang ditunda dipulihkan saat anak dibuka lagi (FR-48)', function () {
    $k = buka_di_meja2();
    $this->post(route('kunjungan.tunda', $k), ['draf' => ['bb' => '8,5', 'pb_tb' => '', 'cara_ukur' => 'telentang']]);
    $this->post(route('kunjungan.lanjutkan', $k));
    $this->post(route('kunjungan.buka', $k));

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page->where('nilaiAwal.bb', '8,5'));
});

test('hanya kader yang membuka anak yang boleh menyimpan', function () {
    $k = buka_di_meja2();
    $this->actingAs(User::factory()->create());

    ukur($k)->assertSessionHasErrors('kunjungan');

    expect($k->pengukuran()->count())->toBe(0);
});

test('Batal setelah simpan mengembalikan anak ke Meja 2 bersama nilainya', function () {
    $k = buka_di_meja2();
    ukur($k);

    $this->post(route('antrean.urungkan'))->assertRedirect(route('kunjungan.layar', $k));

    expect($k->fresh())->meja_saat_ini->toBe(Meja::Pengukuran)->status->toBe(StatusAntrean::SedangDilayani);
    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page->where('nilaiAwal.bb', '8,5'));
});
