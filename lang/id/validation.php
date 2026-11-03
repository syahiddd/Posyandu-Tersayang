<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pesan validasi bahasa Indonesia
    |--------------------------------------------------------------------------
    |
    | Hanya aturan yang dipakai aplikasi. Aturan lain ditambahkan bersama
    | fitur yang memakainya. Pesan batas nilai ukur ditulis langsung di
    | FormRequest agar memakai koma desimal (PRD 7.2).
    |
    */

    'after_or_equal' => ':Attribute tidak boleh sebelum :date.',
    'before_or_equal' => ':Attribute tidak boleh setelah hari ini.',
    'between' => [
        'numeric' => ':Attribute harus antara :min dan :max.',
    ],
    'boolean' => ':Attribute harus ya atau tidak.',
    'date' => ':Attribute harus berupa tanggal.',
    'digits' => ':Attribute harus :digits digit angka.',
    'enum' => ':Attribute yang dipilih tidak sah.',
    'in' => ':Attribute yang dipilih tidak sah.',
    'integer' => ':Attribute harus berupa angka bulat.',
    'max' => [
        'numeric' => ':Attribute paling besar :max.',
        'string' => ':Attribute paling banyak :max karakter.',
    ],
    'min' => [
        'numeric' => ':Attribute paling kecil :min.',
        'string' => ':Attribute paling sedikit :min karakter.',
    ],
    'numeric' => ':Attribute harus berupa angka.',
    'regex' => 'Format :attribute tidak sesuai.',
    'required' => ':Attribute wajib diisi.',
    'required_with' => ':Attribute wajib diisi bila ada ukuran dari Buku KIA.',
    'string' => ':Attribute harus berupa teks.',
    'unique' => ':Attribute sudah terdaftar.',

    'attributes' => [
        'username' => 'nama pengguna',
        'password' => 'kata sandi',
        'meja' => 'meja',
        'nama' => 'nama lengkap anak',
        'jenis_kelamin' => 'jenis kelamin',
        'tempat_lahir' => 'tempat lahir',
        'tanggal_lahir' => 'tanggal lahir',
        'nik' => 'NIK anak',
        'nama_ibu' => 'nama ibu',
        'nik_ibu' => 'NIK ibu',
        'nama_ayah' => 'nama ayah',
        'nik_ayah' => 'NIK ayah',
        'no_hp' => 'nomor HP',
        'alamat' => 'alamat lengkap',
        'rt' => 'RT',
        'rw' => 'RW',
        'dusun' => 'dusun',
        'ukur_tanggal' => 'tanggal pengukuran',
        'ukur_bb' => 'berat badan',
        'ukur_pb_tb' => 'panjang/tinggi badan',
        'ukur_lila' => 'LiLA',
        'ukur_lk' => 'lingkar kepala',
        'bb' => 'berat badan',
        'pb_tb' => 'panjang/tinggi badan',
        'cara_ukur' => 'cara ukur',
        'lila' => 'LiLA',
        'lk' => 'lingkar kepala',
        'asi_eksklusif' => 'ASI eksklusif',
        'alasan' => 'alasan',
    ],

];
