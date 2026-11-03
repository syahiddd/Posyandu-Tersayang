<?php

use App\Support\Nik;
use App\Support\Umur;
use Carbon\CarbonImmutable;

test('umur dihitung dalam bulan penuh (PRD 5.6)', function (string $lahir, string $pada, int $bulan) {
    expect(Umur::bulanPenuh(CarbonImmutable::parse($lahir), CarbonImmutable::parse($pada)))->toBe($bulan);
})->with([
    'hari yang sama' => ['2026-11-04', '2026-11-04', 0],
    'kurang sehari dari sebulan' => ['2026-10-05', '2026-11-04', 0],
    'tepat sebulan' => ['2026-10-04', '2026-11-04', 1],
    'akhir bulan ke bulan pendek' => ['2026-01-31', '2026-02-28', 0],
    'tepat 24 bulan' => ['2024-11-04', '2026-11-04', 24],
    'sehari sebelum 24 bulan' => ['2024-11-05', '2026-11-04', 23],
    'lahir setelah tanggal kunjungan' => ['2026-12-01', '2026-11-04', 0],
]);

test('NIK tersamar menyisakan 4 digit awal dan 4 digit akhir (NFR-05)', function () {
    expect(Nik::samarkan('1871010101010042'))->toBe('1871••••••••0042')
        ->and(Nik::samarkan(null))->toBeNull();
});
