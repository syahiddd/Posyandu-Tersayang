<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Materi penyuluhan fleksibel
    |--------------------------------------------------------------------------
    |
    | Sumber: PRD 6.4 Tabel 32 "Pemetaan kondisi anak ke materi penyuluhan".
    | Kunci disimpan di penyuluhan.materi; 'kondisi' adalah alasan yang
    | ditampilkan di bawah nama materi. Aturan kapan materi direkomendasikan
    | ada di App\Penyuluhan\MateriPenyuluhan.
    |
    */

    'materi' => [
        'asi_eksklusif' => [
            'nama' => 'ASI eksklusif, cara menyusui, serta memerah dan menyimpan ASI',
            'kondisi' => 'Umur 0–6 bulan',
        ],
        'mpasi' => [
            'nama' => 'MPASI sesuai umur: tekstur, porsi, frekuensi, dan variasi makanan',
            'kondisi' => 'Umur 6–24 bulan',
        ],
        'pemenuhan_gizi' => [
            'nama' => 'Pemenuhan gizi, pemberian makanan tambahan, dan anjuran kunjungan ulang',
            'kondisi' => 'Status T atau berat badan kurang',
        ],
        'cegah_stunting' => [
            'nama' => 'Pencegahan stunting: protein hewani, sanitasi, dan pemantauan bulanan',
            'kondisi' => 'Pendek atau berisiko stunting',
        ],
        'pola_makan_seimbang' => [
            'nama' => 'Pola makan seimbang, pembatasan gula dan makanan ringan, serta aktivitas fisik',
            'kondisi' => 'Gizi lebih atau obesitas',
        ],
        'perawatan_anak_sakit' => [
            'nama' => 'Perawatan anak sakit dan tanda bahaya yang perlu dibawa ke fasilitas kesehatan',
            'kondisi' => 'Kondisi fisik yang diamati kader',
        ],
        'stimulasi_motorik' => [
            'nama' => 'Stimulasi motorik sesuai umur dan anjuran pemeriksaan perkembangan oleh tenaga kesehatan',
            'kondisi' => 'Perkembangan motorik belum sesuai umur',
        ],
        'imunisasi_lengkap' => [
            'nama' => 'Pentingnya imunisasi lengkap dan jadwal imunisasi kejar',
            'kondisi' => 'Imunisasi tertunda',
        ],
    ],

    /*
    | Pengamatan kader (FR-44). Contoh kondisi fisik dari PRD Tabel 32
    | ("misalnya sakit, diare, atau demam").
    */

    'pengamatan_fisik' => [
        'sakit' => 'Sakit',
        'diare' => 'Diare',
        'demam' => 'Demam',
    ],

    'pengamatan_motorik' => [
        'belum_sesuai_umur' => 'Perkembangan motorik belum sesuai umur',
    ],

    /*
    |--------------------------------------------------------------------------
    | Isi Piringku untuk ibu menyusui
    |--------------------------------------------------------------------------
    |
    | Sumber: PRD 6.3 Tabel 31 "Porsi makan ibu menyusui (0–12 bulan) untuk
    | sehari" (Buku KIA). Muncul otomatis untuk anak di bawah 24 bulan dan
    | dapat dibuka manual untuk ibu yang masih menyusui (FR-43).
    |
    */

    'isi_piringku_umur_maks' => 23,

    'isi_piringku' => [
        ['bahan' => 'Nasi atau makanan pokok', 'porsi' => '6', 'contoh' => '100 g atau ¾ gelas nasi; 125 g atau 3 buah jagung sedang; 210 g atau 2 kentang sedang'],
        ['bahan' => 'Protein hewani', 'porsi' => '4', 'contoh' => '50 g atau 1 potong sedang ikan; 55 g atau 1 butir telur ayam'],
        ['bahan' => 'Protein nabati', 'porsi' => '4', 'contoh' => '50 g atau 1 potong sedang tempe; 100 g atau 2 potong sedang tahu'],
        ['bahan' => 'Sayur-sayuran', 'porsi' => '4', 'contoh' => '100 g atau 1 mangkuk sayur matang tanpa kuah'],
        ['bahan' => 'Buah-buahan', 'porsi' => '4', 'contoh' => '100 g atau 1 potong sedang pisang; 100–190 g atau 1 potong besar pepaya'],
        ['bahan' => 'Minyak atau lemak', 'porsi' => '6', 'contoh' => '5 g atau 1 sendok teh'],
        ['bahan' => 'Gula', 'porsi' => '2', 'contoh' => '10 g atau 1 sendok makan'],
        ['bahan' => 'Air putih', 'porsi' => '–', 'contoh' => '14 gelas per hari pada 6 bulan pertama dan 12 gelas per hari pada 6 bulan kedua'],
    ],

];
