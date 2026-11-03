<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Kata sandi akun contoh
    |--------------------------------------------------------------------------
    |
    | Dipakai DatabaseSeeder untuk akun ketua dan kader contoh di lingkungan
    | lokal. Seeder menolak berjalan di produksi; akun produksi dibuat oleh
    | Ketua Kader dari menu Pengaturan Akun (FR-02).
    |
    */

    'seed_password' => env('SEED_PASSWORD'),

];
