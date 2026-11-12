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
    | jam).
    |
    | 'umur_maks' = umur terakhir (bulan penuh) dosis masih boleh diberikan,
    | disalin dari tabel Pelayanan Imunisasi Buku KIA 2024 halaman 125: sel
    | putih (usia tepat), jingga (masih boleh untuk melengkapi), dan merah
    | muda (imunisasi kejar) boleh; sel abu-abu tidak boleh. Kolom terakhir
    | tabel itu adalah 23-59 bulan.
    |
    | 'khusus_endemis' = hanya untuk daerah endemis (catatan ** halaman 124);
    | ditawarkan di Meja 4 tanpa centang bawaan.
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
        'HB0' => ['nama' => 'Hepatitis B (HB0)', 'umur_bulan' => 0, 'kelompok' => 'HB0', 'umur_maks' => 0],
        'BCG' => ['nama' => 'BCG', 'umur_bulan' => 1, 'kelompok' => 'BCG', 'umur_maks' => 11],
        'OPV 1' => ['nama' => 'Polio tetes (OPV) 1', 'umur_bulan' => 1, 'kelompok' => 'OPV', 'umur_maks' => 59],
        'DPT-HB-Hib 1' => ['nama' => 'DPT-HB-Hib 1', 'umur_bulan' => 2, 'kelompok' => 'DPT-HB-Hib', 'umur_maks' => 59],
        'OPV 2' => ['nama' => 'Polio tetes (OPV) 2', 'umur_bulan' => 2, 'kelompok' => 'OPV', 'umur_maks' => 59],
        'PCV 1' => ['nama' => 'PCV 1', 'umur_bulan' => 2, 'kelompok' => 'PCV', 'umur_maks' => 59],
        'RV 1' => ['nama' => 'Rotavirus (RV) 1', 'umur_bulan' => 2, 'kelompok' => 'RV', 'umur_maks' => 6],
        'DPT-HB-Hib 2' => ['nama' => 'DPT-HB-Hib 2', 'umur_bulan' => 3, 'kelompok' => 'DPT-HB-Hib', 'umur_maks' => 59],
        'OPV 3' => ['nama' => 'Polio tetes (OPV) 3', 'umur_bulan' => 3, 'kelompok' => 'OPV', 'umur_maks' => 59],
        'PCV 2' => ['nama' => 'PCV 2', 'umur_bulan' => 3, 'kelompok' => 'PCV', 'umur_maks' => 59],
        'RV 2' => ['nama' => 'Rotavirus (RV) 2', 'umur_bulan' => 3, 'kelompok' => 'RV', 'umur_maks' => 6],
        'DPT-HB-Hib 3' => ['nama' => 'DPT-HB-Hib 3', 'umur_bulan' => 4, 'kelompok' => 'DPT-HB-Hib', 'umur_maks' => 59],
        'OPV 4' => ['nama' => 'Polio tetes (OPV) 4', 'umur_bulan' => 4, 'kelompok' => 'OPV', 'umur_maks' => 59],
        'IPV 1' => ['nama' => 'Polio suntik (IPV) 1', 'umur_bulan' => 4, 'kelompok' => 'IPV', 'umur_maks' => 59],
        'RV 3' => ['nama' => 'Rotavirus (RV) 3', 'umur_bulan' => 4, 'kelompok' => 'RV', 'umur_maks' => 6],
        'MR 1' => ['nama' => 'Campak-Rubela (MR) 1', 'umur_bulan' => 9, 'kelompok' => 'MR', 'umur_maks' => 59],
        'IPV 2' => ['nama' => 'Polio suntik (IPV) 2', 'umur_bulan' => 9, 'kelompok' => 'IPV', 'umur_maks' => 59],
        'JE' => ['nama' => 'Japanese Encephalitis (JE), khusus daerah endemis', 'umur_bulan' => 10, 'kelompok' => 'JE', 'umur_maks' => 59, 'khusus_endemis' => true],
        'PCV 3' => ['nama' => 'PCV 3', 'umur_bulan' => 12, 'kelompok' => 'PCV', 'umur_maks' => 59],
        'DPT-HB-Hib 4' => ['nama' => 'DPT-HB-Hib lanjutan (4)', 'umur_bulan' => 18, 'kelompok' => 'DPT-HB-Hib', 'umur_maks' => 59],
        'MR 2' => ['nama' => 'Campak-Rubela (MR) lanjutan (2)', 'umur_bulan' => 18, 'kelompok' => 'MR', 'umur_maks' => 59],
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

    /* Bulan pemberian vitamin A (PRD Tabel 30; Buku KIA 2024 halaman 123). */
    'bulan_vitamin_a' => [2, 8],

    /* Obat cacing diberikan dua kali dalam satu tahun (PRD Tabel 30, FR-34). */
    'obat_cacing_per_tahun' => 2,

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
