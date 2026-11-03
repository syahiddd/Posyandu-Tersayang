<?php

namespace App\Enums;

/** Hasil skrining stunting (PRD 5.8, Tabel 28). */
enum HasilDeteksiStunting: string
{
    case Normal = 'normal';
    case BerisikoStunting = 'berisiko_stunting';
    case Stunting = 'stunting';
    case DiprediksiBerisiko = 'diprediksi_berisiko';
}
