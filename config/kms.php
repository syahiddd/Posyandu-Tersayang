<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Kenaikan Berat Badan Minimal (KBM)
    |--------------------------------------------------------------------------
    |
    | Sumber: PRD Tabel 26 "Kenaikan Berat Badan Minimal (KBM) menurut umur",
    | yang mengikuti KMS Buku KIA 2024. Sama untuk laki-laki dan perempuan
    | (PRD 5.5). Umur dalam bulan penuh, KBM dalam gram.
    |
    */

    'kbm' => [
        ['dari' => 1, 'sampai' => 1, 'gram' => 800],
        ['dari' => 2, 'sampai' => 2, 'gram' => 900],
        ['dari' => 3, 'sampai' => 3, 'gram' => 800],
        ['dari' => 4, 'sampai' => 4, 'gram' => 600],
        ['dari' => 5, 'sampai' => 5, 'gram' => 500],
        ['dari' => 6, 'sampai' => 7, 'gram' => 400],
        ['dari' => 8, 'sampai' => 11, 'gram' => 300],
        ['dari' => 12, 'sampai' => 60, 'gram' => 200],
    ],

];
