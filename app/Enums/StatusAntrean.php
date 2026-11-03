<?php

namespace App\Enums;

/** Status kunjungan di setiap meja (PRD 3.2, Tabel 7). */
enum StatusAntrean: string
{
    case Menunggu = 'menunggu';
    case SedangDilayani = 'sedang_dilayani';
    case Ditunda = 'ditunda';
    case Selesai = 'selesai';
}
