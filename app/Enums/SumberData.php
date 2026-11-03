<?php

namespace App\Enums;

/** Asal data pengukuran dan layanan (PRD 7.1, FR-66). */
enum SumberData: string
{
    case Posyandu = 'posyandu';
    case BukuKia = 'buku_kia';
}
