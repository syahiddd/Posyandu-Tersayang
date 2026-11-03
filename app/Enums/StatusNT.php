<?php

namespace App\Enums;

/** Status penimbangan KMS (PRD 5.5). */
enum StatusNT: string
{
    case Naik = 'N';
    case TidakNaik = 'T';
    case TidakDitimbangBulanLalu = 'tidak_ditimbang';
}
