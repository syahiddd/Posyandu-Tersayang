<?php

namespace App\Enums;

/** Peran akun (PRD 2.3, Tabel 5). */
enum Role: string
{
    case Kader = 'kader';
    case Ketua = 'ketua';

    public function label(): string
    {
        return match ($this) {
            self::Kader => 'Kader',
            self::Ketua => 'Ketua Kader',
        };
    }
}
