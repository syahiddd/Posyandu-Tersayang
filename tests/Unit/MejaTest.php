<?php

use App\Enums\Meja;

test('lima meja sesuai tahap PRD Tabel 6', function () {
    expect(array_map(fn (Meja $meja) => [$meja->value, $meja->tahap()], Meja::cases()))
        ->toBe([
            [1, 'Pendaftaran'],
            [2, 'Pengukuran'],
            [3, 'Pendataan'],
            [4, 'Pelayanan'],
            [5, 'Penyuluhan'],
        ]);
});
