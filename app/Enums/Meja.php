<?php

namespace App\Enums;

/** Lima meja posyandu dan tahapnya (PRD 3.1, Tabel 6). */
enum Meja: int
{
    case Pendaftaran = 1;
    case Pengukuran = 2;
    case Pendataan = 3;
    case Pelayanan = 4;
    case Penyuluhan = 5;

    public function tahap(): string
    {
        return match ($this) {
            self::Pendaftaran => 'Pendaftaran',
            self::Pengukuran => 'Pengukuran',
            self::Pendataan => 'Pendataan',
            self::Pelayanan => 'Pelayanan',
            self::Penyuluhan => 'Penyuluhan',
        };
    }
}
