<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Jadwal imunisasi bayi dan baduta
    |--------------------------------------------------------------------------
    |
    | Sumber: PRD Tabel 29 (Buku KIA 2024), disimpan sebagai data acuan yang
    | dapat diperbarui tanpa mengubah program (PRD 6.1). Kunci = kode dosis
    | yang disimpan di layanan.detail; umur anjuran dalam bulan (HB0: 0–24
    | jam). Batas umur imunisasi kejar BELUM diisi: menunggu tabel Pelayanan
    | Imunisasi Buku KIA dari pemilik produk.
    |
    */

    /*
    | Kelompok vaksin untuk penyaring "jenis vaksin" dan tile cakupan Rekap
    | Imunisasi (FR-56). Nama dari Tabel 29; tiap dosis di bawah merujuk ke
    | salah satu kunci ini lewat 'kelompok'.
    */

    'kelompok_vaksin' => [
        'HB0' => 'Hepatitis B (HB0)',
        'BCG' => 'BCG',
        'OPV' => 'Polio tetes (OPV)',
        'DPT-HB-Hib' => 'DPT-HB-Hib',
        'PCV' => 'PCV',
        'RV' => 'Rotavirus (RV)',
        'IPV' => 'Polio suntik (IPV)',
        'MR' => 'Campak-Rubela (MR)',
        'JE' => 'Japanese Encephalitis (JE)',
    ],

    'vaksin' => [
        'HB0' => ['nama' => 'Hepatitis B (HB0)', 'umur_bulan' => 0, 'kelompok' => 'HB0'],
        'BCG' => ['nama' => 'BCG', 'umur_bulan' => 1, 'kelompok' => 'BCG'],
        'OPV 1' => ['nama' => 'Polio tetes (OPV) 1', 'umur_bulan' => 1, 'kelompok' => 'OPV'],
        'DPT-HB-Hib 1' => ['nama' => 'DPT-HB-Hib 1', 'umur_bulan' => 2, 'kelompok' => 'DPT-HB-Hib'],
        'OPV 2' => ['nama' => 'Polio tetes (OPV) 2', 'umur_bulan' => 2, 'kelompok' => 'OPV'],
        'PCV 1' => ['nama' => 'PCV 1', 'umur_bulan' => 2, 'kelompok' => 'PCV'],
        'RV 1' => ['nama' => 'Rotavirus (RV) 1', 'umur_bulan' => 2, 'kelompok' => 'RV'],
        'DPT-HB-Hib 2' => ['nama' => 'DPT-HB-Hib 2', 'umur_bulan' => 3, 'kelompok' => 'DPT-HB-Hib'],
        'OPV 3' => ['nama' => 'Polio tetes (OPV) 3', 'umur_bulan' => 3, 'kelompok' => 'OPV'],
        'PCV 2' => ['nama' => 'PCV 2', 'umur_bulan' => 3, 'kelompok' => 'PCV'],
        'RV 2' => ['nama' => 'Rotavirus (RV) 2', 'umur_bulan' => 3, 'kelompok' => 'RV'],
        'DPT-HB-Hib 3' => ['nama' => 'DPT-HB-Hib 3', 'umur_bulan' => 4, 'kelompok' => 'DPT-HB-Hib'],
        'OPV 4' => ['nama' => 'Polio tetes (OPV) 4', 'umur_bulan' => 4, 'kelompok' => 'OPV'],
        'IPV 1' => ['nama' => 'Polio suntik (IPV) 1', 'umur_bulan' => 4, 'kelompok' => 'IPV'],
        'RV 3' => ['nama' => 'Rotavirus (RV) 3', 'umur_bulan' => 4, 'kelompok' => 'RV'],
        'MR 1' => ['nama' => 'Campak-Rubela (MR) 1', 'umur_bulan' => 9, 'kelompok' => 'MR'],
        'IPV 2' => ['nama' => 'Polio suntik (IPV) 2', 'umur_bulan' => 9, 'kelompok' => 'IPV'],
        'JE' => ['nama' => 'Japanese Encephalitis (JE), khusus daerah endemis', 'umur_bulan' => 10, 'kelompok' => 'JE'],
        'PCV 3' => ['nama' => 'PCV 3', 'umur_bulan' => 12, 'kelompok' => 'PCV'],
        'DPT-HB-Hib 4' => ['nama' => 'DPT-HB-Hib lanjutan (4)', 'umur_bulan' => 18, 'kelompok' => 'DPT-HB-Hib'],
        'MR 2' => ['nama' => 'Campak-Rubela (MR) lanjutan (2)', 'umur_bulan' => 18, 'kelompok' => 'MR'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Vitamin A dan obat cacing
    |--------------------------------------------------------------------------
    |
    | Sumber: PRD Tabel 30 dan FR-33, FR-34. Umur dalam bulan penuh pada
    | tanggal pemberian; null berarti tanpa batas atas.
    |
    */

    'vitamin_obat' => [
        'Kapsul biru' => [
            'jenis' => 'vitamin_a',
            'nama' => 'Vitamin A kapsul biru (100.000 IU)',
            'umur_min' => 6,
            'umur_maks' => 11,
        ],
        'Kapsul merah' => [
            'jenis' => 'vitamin_a',
            'nama' => 'Vitamin A kapsul merah (200.000 IU)',
            'umur_min' => 12,
            'umur_maks' => 59,
        ],
        'Obat cacing' => [
            'jenis' => 'obat_cacing',
            'nama' => 'Obat cacing',
            'umur_min' => 12,
            'umur_maks' => null,
        ],
    ],

];
