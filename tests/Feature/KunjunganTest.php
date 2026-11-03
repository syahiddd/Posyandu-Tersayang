<?php

use App\Models\Anak;
use App\Models\Kunjungan;
use Illuminate\Database\UniqueConstraintViolationException;

/*
| Satu anak hanya boleh memiliki satu kunjungan pada tanggal yang sama
| (PRD 3.3, FR-17).
*/

test('anak yang sama tidak bisa punya dua kunjungan pada tanggal yang sama', function () {
    $anak = Anak::factory()->create();
    Kunjungan::factory()->for($anak)->create(['tanggal' => '2026-11-05', 'nomor_antrean' => 1]);

    Kunjungan::factory()->for($anak)->create(['tanggal' => '2026-11-05', 'nomor_antrean' => 2]);
})->throws(UniqueConstraintViolationException::class);

test('anak yang sama boleh berkunjung lagi pada tanggal lain', function () {
    $anak = Anak::factory()->create();
    Kunjungan::factory()->for($anak)->create(['tanggal' => '2026-10-05', 'nomor_antrean' => 1]);
    Kunjungan::factory()->for($anak)->create(['tanggal' => '2026-11-05', 'nomor_antrean' => 1]);

    expect($anak->kunjungan()->count())->toBe(2);
});

test('anak yang berbeda boleh berkunjung pada tanggal yang sama', function () {
    Kunjungan::factory()->count(2)->create(['tanggal' => '2026-11-05']);

    expect(Kunjungan::query()->whereDate('tanggal', '2026-11-05')->count())->toBe(2);
});

test('nomor antrean tidak boleh ganda pada tanggal yang sama', function () {
    Kunjungan::factory()->create(['tanggal' => '2026-11-05', 'nomor_antrean' => 7]);

    Kunjungan::factory()->create(['tanggal' => '2026-11-05', 'nomor_antrean' => 7]);
})->throws(UniqueConstraintViolationException::class);

test('NIK anak unik bila diisi, boleh kosong untuk banyak anak (PRD 7.2)', function () {
    Anak::factory()->count(2)->create(['nik' => null]);
    Anak::factory()->create(['nik' => '3201010101010001']);

    expect(Anak::query()->whereNull('nik')->count())->toBe(2);

    Anak::factory()->create(['nik' => '3201010101010001']);
})->throws(UniqueConstraintViolationException::class);

test('NIK tersimpan sebagai teks 16 digit tanpa kehilangan angka nol di depan', function () {
    $anak = Anak::factory()->create(['nik' => '0012345678901234']);

    expect($anak->fresh()->nik)->toBe('0012345678901234');
});

test('nilai ukur disimpan satu angka di belakang koma (PRD 5.6)', function () {
    $kunjungan = Kunjungan::factory()->create();
    $pengukuran = $kunjungan->pengukuran()->create([
        'anak_id' => $kunjungan->anak_id,
        'tanggal_ukur' => today(),
        'bb' => 8.5,
        'pb_tb' => 72,
    ]);

    expect($pengukuran->fresh()->bb)->toBe('8.5')
        ->and($pengukuran->fresh()->pb_tb)->toBe('72.0');
});
