<?php

namespace App\Enums;

/** Jenis layanan Meja 4 (PRD 7.1, FR-32 sampai FR-34). */
enum JenisLayanan: string
{
    case Imunisasi = 'imunisasi';
    case VitaminA = 'vitamin_a';
    case ObatCacing = 'obat_cacing';
}
