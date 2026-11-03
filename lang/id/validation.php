<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pesan validasi bahasa Indonesia
    |--------------------------------------------------------------------------
    |
    | Hanya aturan yang dipakai di Fase 1. Aturan lain ditambahkan bersama
    | fitur yang memakainya.
    |
    */

    'required' => ':Attribute wajib diisi.',
    'string' => ':Attribute harus berupa teks.',
    'integer' => ':Attribute harus berupa angka bulat.',
    'between' => [
        'numeric' => ':Attribute harus antara :min dan :max.',
    ],
    'in' => ':Attribute yang dipilih tidak sah.',

    'attributes' => [
        'username' => 'nama pengguna',
        'password' => 'kata sandi',
        'meja' => 'meja',
    ],

];
