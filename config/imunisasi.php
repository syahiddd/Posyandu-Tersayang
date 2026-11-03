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

    'vaksin' => [
        'HB0' => ['nama' => 'Hepatitis B (HB0)', 'umur_bulan' => 0],
        'BCG' => ['nama' => 'BCG', 'umur_bulan' => 1],
        'OPV 1' => ['nama' => 'Polio tetes (OPV) 1', 'umur_bulan' => 1],
        'DPT-HB-Hib 1' => ['nama' => 'DPT-HB-Hib 1', 'umur_bulan' => 2],
        'OPV 2' => ['nama' => 'Polio tetes (OPV) 2', 'umur_bulan' => 2],
        'PCV 1' => ['nama' => 'PCV 1', 'umur_bulan' => 2],
        'RV 1' => ['nama' => 'Rotavirus (RV) 1', 'umur_bulan' => 2],
        'DPT-HB-Hib 2' => ['nama' => 'DPT-HB-Hib 2', 'umur_bulan' => 3],
        'OPV 3' => ['nama' => 'Polio tetes (OPV) 3', 'umur_bulan' => 3],
        'PCV 2' => ['nama' => 'PCV 2', 'umur_bulan' => 3],
        'RV 2' => ['nama' => 'Rotavirus (RV) 2', 'umur_bulan' => 3],
        'DPT-HB-Hib 3' => ['nama' => 'DPT-HB-Hib 3', 'umur_bulan' => 4],
        'OPV 4' => ['nama' => 'Polio tetes (OPV) 4', 'umur_bulan' => 4],
        'IPV 1' => ['nama' => 'Polio suntik (IPV) 1', 'umur_bulan' => 4],
        'RV 3' => ['nama' => 'Rotavirus (RV) 3', 'umur_bulan' => 4],
        'MR 1' => ['nama' => 'Campak-Rubela (MR) 1', 'umur_bulan' => 9],
        'IPV 2' => ['nama' => 'Polio suntik (IPV) 2', 'umur_bulan' => 9],
        'JE' => ['nama' => 'Japanese Encephalitis (JE), khusus daerah endemis', 'umur_bulan' => 10],
        'PCV 3' => ['nama' => 'PCV 3', 'umur_bulan' => 12],
        'DPT-HB-Hib 4' => ['nama' => 'DPT-HB-Hib lanjutan (4)', 'umur_bulan' => 18],
        'MR 2' => ['nama' => 'Campak-Rubela (MR) lanjutan (2)', 'umur_bulan' => 18],
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
