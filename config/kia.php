<?php

/*
|--------------------------------------------------------------------------
| Konten Buku KIA 2024
|--------------------------------------------------------------------------
|
| Seluruh isi di bawah disalin dari Buku KIA 2024 (Kementerian Kesehatan RI,
| Cetakan Tahun 2024). Nomor halaman mengikuti nomor halaman yang tercetak
| pada buku, bukan nomor halaman PDF.
|
| Data ini adalah acuan edukasi dan tindak lanjut, bukan diagnosis. Setiap
| hasil skrining tetap harus dikonfirmasi tenaga kesehatan (PRD 5.8).
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | ASI eksklusif (Buku KIA hlm. 38–39)
    |--------------------------------------------------------------------------
    |
    | Diberikan pada Meja 5 untuk anak umur 0–6 bulan, dan menjadi acuan
    | penilaian isian ASI eksklusif di Meja 3 (FR-27).
    |
    */

    'asi' => [
        'judul' => 'Berikan ASI saja sampai usia 6 bulan',
        'sumber' => 'Buku KIA 2024 hlm. 38–39',
        'definisi' => 'ASI eksklusif berarti bayi hanya menerima ASI saja sampai berusia 6 bulan, tanpa air putih, makanan, minuman, obat, vitamin, atau mineral lain kecuali dianjurkan dokter atau tenaga kesehatan.',
        'langkah' => [
            'Beri hanya ASI saja sampai usia 6 bulan.',
            'Jangan tambahkan air putih, makanan, minuman, obat, vitamin atau mineral, kecuali dianjurkan dokter atau tenaga kesehatan.',
            'Susui semau bayi dan hindari penggunaan botol susu atau dot.',
            'Temui tenaga kesehatan atau konselor menyusui jika ibu mengalami masalah dalam menyusui bayi.',
            'Timbang berat badan, ukur panjang badan, dan cek perkembangan bayi tiap bulan di Posyandu atau fasilitas kesehatan lainnya.',
            'Dapatkan imunisasi dasar lengkap sesuai usia (hlm. 124–125).',
            'Sering ajak anak berkomunikasi dan bermain untuk merangsang perkembangan sesuai usianya.',
            'Pastikan bayi istirahat yang cukup.',
            'Cek kesehatan bayi secara rutin.',
        ],
        'alasan' => [
            'Meningkatkan ikatan antara ibu dan bayi.',
            'Bayi mendapat gizi cukup selama proses menyusui dan mencegah masalah gizi, seperti stunting.',
            'Mendukung perkembangan otak bayi agar terbentuk sempurna dan meningkatkan kemampuan belajarnya.',
            'Imunisasi dasar melindungi bayi dari penyakit-penyakit yang dapat mengakibatkan kematian.',
        ],
        // Buku KIA hlm. 39: ukuran lambung dan frekuensi menyusu.
        'frekuensi' => [
            ['waktu' => 'Hari pertama', 'lambung' => 'Sebesar kelereng', 'frekuensi' => '5–12 kali dalam 24 jam'],
            ['waktu' => 'Hari ke-2 sampai ke-3', 'lambung' => 'Sebesar bola pingpong', 'frekuensi' => '10–12 kali, masih belum stabil'],
            ['waktu' => 'Satu minggu', 'lambung' => 'Sebesar telur ayam', 'frekuensi' => 'Rata-rata 8 kali dalam 24 jam'],
            ['waktu' => 'Satu bulan', 'lambung' => 'Sebesar telur bebek', 'frekuensi' => 'Rata-rata 8–12 kali dalam 24 jam'],
        ],
        // Buku KIA hlm. 36–37: cara memerah dan menyimpan ASI.
        'penyimpanan' => [
            ['tempat' => 'ASI baru diperah di dalam cooler bag', 'suhu' => '15 °C', 'lama' => '24 jam'],
            ['tempat' => 'Dalam ruangan (ASIP segar)', 'suhu' => '27–32 °C', 'lama' => '4 jam'],
            ['tempat' => 'Dalam ruangan', 'suhu' => '< 25 °C', 'lama' => '6–8 jam'],
            ['tempat' => 'Kulkas', 'suhu' => '< 4 °C', 'lama' => '48–72 jam (2–3 hari)'],
            ['tempat' => 'Freezer lemari es 1 pintu', 'suhu' => '−15 °C s/d 0 °C', 'lama' => '2 minggu'],
            ['tempat' => 'Freezer lemari es 2 pintu', 'suhu' => '−20 °C s/d −18 °C', 'lama' => '3–6 bulan'],
        ],
        'catatanPenyimpanan' => [
            'Simpan ASI perah sebanyak 15–60 ml per wadah agar tidak terbuang karena tidak habis diminum bayi.',
            'Hindari ASI perah mengalami perubahan suhu yang terlalu ekstrem.',
            'Utamakan memberi ASI segar (bukan beku) segera setelah diperah, dalam waktu satu jam.',
            'Jangan merebus ASI atau memanaskannya dalam microwave karena dapat merusak kandungan gizinya.',
            'ASI beku dicairkan perlahan di kulkas atau dibiarkan dalam wadah berisi air hangat, dan digunakan dalam waktu 24 jam.',
            'Jika menyimpan di beberapa wadah, beri label tanggal.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | MPASI (Buku KIA hlm. 56–61)
    |--------------------------------------------------------------------------
    |
    | Porsi, frekuensi, tekstur, dan kebutuhan energi per kelompok umur.
    | Dipakai Meja 5 dan halaman Panduan KIA.
    |
    */

    'mpasi' => [
        'judul' => 'Pemenuhan gizi usia 6–24 bulan',
        'sumber' => 'Buku KIA 2024 hlm. 56–61',
        // Empat syarat MPASI yang baik (hlm. 59).
        'syarat' => [
            ['judul' => 'Tepat waktu', 'isi' => 'MPASI diberikan saat ASI saja sudah tidak dapat memenuhi kebutuhan gizi bayi. MPASI diberikan mulai usia 6 bulan.'],
            ['judul' => 'Cukup sesuai kebutuhan (adekuat)', 'isi' => 'Mempertimbangkan jumlah, frekuensi, konsistensi atau tekstur, dan variasi makanan.'],
            ['judul' => 'Aman', 'isi' => 'Perhatikan kebersihan makanan dan peralatan. Cuci tangan sebelum menyiapkan dan sebelum memberikan makanan.'],
            ['judul' => 'Diberikan dengan cara yang benar', 'isi' => 'Diberikan teratur (pagi, siang, sore atau menjelang malam), lama pemberian makan maksimal 30 menit, lingkungan netral (tidak sambil bermain atau menonton TV).'],
        ],
        // Variasi makanan (hlm. 59).
        'variasi' => [
            ['kelompok' => 'Makanan pokok', 'contoh' => 'Beras, biji-bijian, jagung, gandum, sagu, umbi, kentang, singkong'],
            ['kelompok' => 'Protein hewani', 'contoh' => 'Ikan, ayam, daging, hati, udang, telur, susu dan hasil olahannya. Pemberian protein hewani diprioritaskan.'],
            ['kelompok' => 'Protein nabati', 'contoh' => 'Kedelai, kacang hijau, kacang polong, kacang tanah'],
            ['kelompok' => 'Lemak', 'contoh' => 'Minyak, santan, dan protein hewani dalam MPASI'],
            ['kelompok' => 'Buah dan sayur kaya vitamin A dan C', 'contoh' => 'Jeruk, mangga, tomat, bayam, wortel'],
        ],
        // Tabel porsi per umur (hlm. 59).
        'porsi' => [
            [
                'dari' => 6,
                'sampai' => 8,
                'label' => '6–8 bulan',
                'jumlah' => '2–3 sendok makan bertahap hingga ½ mangkok ukuran 250 ml (125 ml) setiap kali makan',
                'frekuensi' => '2–3 kali makanan utama dan 1–2 kali makanan selingan setiap hari',
                'energi' => '200 kkal per hari',
                'tekstur' => 'Disaring: tekstur makanan lumat dan kental',
                'cairan' => '800 ml per hari (±3 gelas belimbing)',
            ],
            [
                'dari' => 9,
                'sampai' => 11,
                'label' => '9–11 bulan',
                'jumlah' => '½–¾ mangkok ukuran 250 ml (125–200 ml) setiap kali makan',
                'frekuensi' => '3–4 kali makanan utama dan 1–2 kali makanan selingan setiap hari',
                'energi' => '300 kkal per hari',
                'tekstur' => 'Dicincang: bahan makanan sama dengan untuk orang dewasa',
                'cairan' => '1.300 ml per hari (±5 gelas belimbing)',
            ],
            [
                'dari' => 12,
                'sampai' => 23,
                'label' => '12–23 bulan',
                'jumlah' => '¾–1 mangkok ukuran 250 ml setiap kali makan',
                'frekuensi' => '3–4 kali makanan utama dan 1–2 kali makanan selingan setiap hari',
                'energi' => '550 kkal per hari',
                'tekstur' => 'Masak biasa: tekstur makanan diiris-iris',
                'cairan' => '1.300 ml per hari (±5 gelas belimbing)',
            ],
        ],
        'catatan' => [
            'Lanjutkan pemberian ASI hingga usia 2 tahun atau lebih.',
            'Perkenalkan makanan satu per satu sambil memperhatikan apakah anak memiliki alergi terhadap makanan tertentu.',
            'Pastikan cara memasak direbus atau dikukus, serta hindari makanan yang digoreng, mengandung bahan pengawet, dan tinggi gula dan garam.',
            'Di usia 12–24 bulan, 70% kebutuhan gizi anak dipenuhi dari MPASI dan ASI menyumbang 30%.',
            'Hindari pemberian makanan atau jajanan yang rendah gizi, tinggi gula dan garam, berpengawet, dan berpemanis.',
        ],
        'sumberHalaman' => 'Buku KIA 2024 hlm. 56–61',
    ],

    /*
    |--------------------------------------------------------------------------
    | Tanda bahaya menurut kelompok umur (Buku KIA hlm. 40–41, 50–51)
    |--------------------------------------------------------------------------
    |
    | Dipakai untuk mengingatkan kader agar segera merujuk. Setiap kelompok
    | umur memiliki daftar yang berbeda; kader tidak boleh memakai daftar
    | balita untuk bayi baru lahir.
    |
    */

    'tanda_bahaya' => [
        [
            'dari' => 0,
            'sampai' => 0,
            'label' => 'Bayi baru lahir (0–28 hari)',
            'halaman' => 'Buku KIA hlm. 40–41',
            'daftar' => [
                'Diare',
                'Demam atau panas tinggi',
                'Dingin',
                'Kulit dan mata kuning',
                'Lemah',
                'Kejang',
                'Muntah-muntah',
                'Sesak napas',
                'Menangis atau merintih terus menerus',
                'Tali pusat kemerahan sampai dinding perut, berbau bernanah',
                'Tinja bayi saat buang air besar berwarna pucat',
                'Tidak mau menyusu',
            ],
        ],
        [
            'dari' => 1,
            'sampai' => 60,
            'label' => 'Balita 29 hari – 5 tahun',
            'halaman' => 'Buku KIA hlm. 50–51',
            'daftar' => [
                'Tidak bisa minum',
                'Sesak napas',
                'Tampak biru (sianosis)',
                'Demam atau panas tinggi',
                'Kejang',
                'Diare',
                'Muntah-muntah',
                'Pembengkakan yang nyeri di belakang telinga',
                'Pendarahan di hidung, kulit, atau buang air besar',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Lembar pemantauan bulanan (Buku KIA hlm. 52–86)
    |--------------------------------------------------------------------------
    |
    | Kondisi yang dicentang ibu setiap bulan. Bila salah satu terjadi,
    | segera ke Puskesmas. Daftar ini sama pada semua kelompok umur bayi
    | dan balita.
    |
    */

    'pemantauan_bulanan' => [
        'judul' => 'Cek kondisi anak setiap bulan',
        'sumber' => 'Buku KIA 2024 hlm. 52–86',
        'daftar' => [
            'Sesak napas, cuping hidung kembang kempis, atau dada tertarik ke dalam',
            'Batuk dengan bunyi grok-grok atau mengi',
            'Suhu tubuh panas > 38,5 °C atau ada tanda pendarahan (mimisan, gusi berdarah, muntah kopi, BAB hitam)',
            'BAB lebih sering atau lebih encer, dengan mata cekung, haus minum dengan lahap, atau diare disertai darah',
            'Jumlah air kencing sedikit atau tidak kencing selama 6 jam, warna kuning pekat atau kecoklatan',
            'Warna kulit tampak biru atau memar di sekitar mulut, tangan, atau kaki',
            'Aktivitas tampak lemah, tidak bergerak, menangis, atau merintih',
            'Hisapan bayi lemah atau tidak bergerak',
            'Muntah susu atau cairan hijau',
            'Kencing kurang dari 6 kali sehari dengan warna kurang pekat',
            'Tidak mau makan atau minum',
            'Berat badan tidak naik sesuai pertumbuhan',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Perawatan anak sakit (Buku KIA hlm. 86–89)
    |--------------------------------------------------------------------------
    |
    | Tindakan di rumah dan tanda untuk segera ke fasilitas kesehatan.
    |
    */

    'perawatan_sakit' => [
        [
            'kode' => 'demam',
            'judul' => 'Demam',
            'halaman' => 'Buku KIA hlm. 88',
            'lakukan' => [
                'Jika masih menyusu, berikan ASI lebih sering.',
                'Beri minum lebih sering dan lebih banyak.',
                'Jangan diselimuti atau diberi baju tebal.',
                'Kompres dengan air biasa atau air hangat. Jangan kompres dengan air dingin karena anak bisa menggigil.',
                'Jika demam tinggi, beri obat penurun panas sesuai dosis.',
                'Untuk daerah endemis malaria, balita harus tidur di dalam kelambu anti nyamuk.',
            ],
            'segera' => [
                'Demam disertai kejang.',
                'Setelah diberi penurun panas, demam tidak turun dalam 2 hari.',
                'Demam disertai bintik-bintik merah, pendarahan di hidung, atau buang air besar berwarna hitam.',
            ],
        ],
        [
            'kode' => 'diare',
            'judul' => 'Diare atau mencret',
            'halaman' => 'Buku KIA hlm. 72, 88',
            'lakukan' => [
                'Jika anak masih menyusu, terus berikan ASI sesering mungkin.',
                'Berikan segera ½–1 gelas cairan oralit setiap anak buang air besar. Bila tidak ada oralit, berikan air matang, kuah sayur bening, atau air tajin.',
                'Berikan zinc setiap hari selama 10 hari berturut-turut: anak usia < 6 bulan 1 kali ½ tablet; anak usia 6 bulan–5 tahun 1 kali 1 tablet.',
                'Beri MP-ASI atau makan seperti biasa.',
                'Jangan beri obat apa pun kecuali dari petugas kesehatan.',
            ],
            'segera' => [
                'Timbul demam.',
                'Ada darah dalam tinja.',
                'Diare makin parah.',
                'Muntah terus menerus.',
                'Anak terlihat sangat haus.',
                'Anak tidak mau makan dan minum.',
                'Diare berulang-ulang.',
            ],
        ],
        [
            'kode' => 'batuk',
            'judul' => 'Batuk',
            'halaman' => 'Buku KIA hlm. 88',
            'lakukan' => [
                'Berikan ASI lebih sering.',
                'Beri minum air matang lebih banyak.',
                'Jika umurnya di atas 1 tahun, beri kecap manis atau madu dicampur air jeruk nipis sebagai pelega tenggorokan.',
                'Jauhkan dari asap rokok, asap dapur, asap sampah, polusi kendaraan bermotor, dan debu.',
            ],
            'segera' => [
                'Batuk tidak sembuh dalam 2 hari.',
                'Anak sesak napas.',
                'Demam.',
            ],
        ],
        [
            'kode' => 'luka',
            'judul' => 'Luka dan koreng',
            'halaman' => 'Buku KIA hlm. 88',
            'lakukan' => [
                'Cuci bersih luka dengan air bersih mengalir.',
                'Periksakan koreng ke Puskesmas.',
            ],
            'segera' => [
                'Luka bernanah atau berbau.',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Kebutuhan cairan dan perawatan gigi (Buku KIA hlm. 72, 78–79, 86)
    |--------------------------------------------------------------------------
    */

    'cairan' => [
        'sumber' => 'Buku KIA 2024 hlm. 59, 79',
        'daftar' => [
            ['umur' => '6–8 bulan', 'jumlah' => '800 ml per hari (±3 gelas belimbing)'],
            ['umur' => '9–23 bulan', 'jumlah' => '1.300 ml per hari (±5 gelas belimbing)'],
            ['umur' => '2–3 tahun', 'jumlah' => '1.300 ml per hari (±5 gelas belimbing)'],
            ['umur' => 'Di atas 3 tahun', 'jumlah' => '1.700 ml per hari (±7 gelas belimbing)'],
        ],
        'catatan' => 'Anak harus minum sedikitnya 5–7 gelas air setiap hari (hlm. 72). Warna air kencing yang kuning pekat menandakan anak kurang minum.',
    ],

    'gigi' => [
        'sumber' => 'Buku KIA 2024 hlm. 79, 86',
        'daftar' => [
            ['umur' => '0–4 bulan', 'cara' => 'Gendong atau pangku anak dengan satu tangan, lalu bersihkan gusi anak secara perlahan dengan kain atau lap basah yang dilingkarkan pada jari telunjuk ibu.'],
            ['umur' => '6–12 bulan', 'cara' => 'Bersihkan gusi setelah diberi makan dengan kain atau lap basah. Bila gigi susu mulai muncul, bersihkan dengan sikat gigi anak berbulu halus tanpa pasta gigi atau dengan pasta gigi selapis tipis.'],
            ['umur' => '2–6 tahun', 'cara' => 'Pasta gigi seukuran 1 biji kacang polong. Dampingi anak menggosok gigi sampai usia 8 tahun, teratur selama 2 menit, termasuk sebelum tidur.'],
        ],
        'hindari' => [
            'Membiasakan anak minum susu dengan botol sambil tiduran.',
            'Membiarkan anak menghisap ibu jari atau dot (mengempeng).',
            'Makanan manis yang bersifat lengket di antara waktu makan.',
            'Tidak menyikat gigi sebelum tidur.',
            'Membiasakan anak mengemut makanan.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Stimulasi perkembangan menurut umur (Buku KIA hlm. 52–83)
    |--------------------------------------------------------------------------
    |
    | Daftar kegiatan stimulasi yang dianjurkan buku untuk tiap rentang umur.
    | Kader membacakan ini pada ibu di Meja 5.
    |
    */

    // Sepuluh kelompok umur persis seperti tertulis di buku (hlm. 52–83).
    'stimulasi' => [
        [
            'dari' => 0,
            'sampai' => 0,
            'label' => '0–28 hari',
            'halaman' => 'Buku KIA hlm. 40–41',
            'daftar' => [
                'Susui bayi dengan penuh kasih sayang, dekap dengan hangat, dan jalin hubungan kasih sayang sambil menatap dan mengajak bicara.',
                'Jaga bayi tetap hangat dan jaga kebersihan selama merawat bayi.',
                'Sebaiknya bayi tidur terlentang, gunakan alas yang rata, jauhkan benda yang dapat menutupi kepala, dan gunakan kelambu.',
            ],
        ],
        [
            'dari' => 1,
            'sampai' => 2,
            'label' => '29 hari–3 bulan',
            'halaman' => 'Buku KIA hlm. 52–53',
            'daftar' => [
                'Peluk, cium, ayun bayi.',
                'Senyum, tatap mata, ajak bicara.',
                'Tirukan ocehan dan mimik bayi.',
                'Interaksi langsung untuk mengenalkan berbagai suara, bunyi, atau nyanyian.',
                'Gantung benda berwarna, berbunyi.',
                'Meraih, meraba, pegang mainan, angkat kepala.',
                'Gulingkan kanan-kiri, tengkurap-telentang.',
            ],
        ],
        [
            'dari' => 3,
            'sampai' => 5,
            'label' => '3–6 bulan',
            'halaman' => 'Buku KIA hlm. 54–55',
            'daftar' => [
                'Peluk, cium, pandang mata, senyum, bicara.',
                'Mencari sumber suara.',
                'Bermain cilukba, melihat wajah di cermin.',
                'Memeluk, mengayun.',
                'Melihat, meraih.',
                'Mengamati benda kecil, benda bergerak.',
                'Mengambil benda kecil.',
                'Berguling-guling, duduk.',
            ],
        ],
        [
            'dari' => 6,
            'sampai' => 8,
            'label' => '6–9 bulan',
            'halaman' => 'Buku KIA hlm. 62–63',
            'daftar' => [
                'Peluk, senyum, bicara, panggil namanya.',
                'Bersalaman, tepuk tangan, melambai ke orang lain.',
                'Kenalkan atau tunjuk nama orang (papa, mama) dan benda sekitar.',
                'Cilukba, melihat cermin.',
                'Tunjuk dan sebutkan nama gambar.',
                'Bacakan dongeng.',
                'Pegang mainan dengan dua tangan.',
                'Masukkan benda kecil ke dalam wadah.',
                'Sembunyikan dan cari mainan.',
                'Mainan yang mengapung di air.',
                'Memukul-mukul.',
                'Duduk, merangkak, berdiri berpegangan.',
            ],
        ],
        [
            'dari' => 9,
            'sampai' => 11,
            'label' => '9–12 bulan',
            'halaman' => 'Buku KIA hlm. 62–63',
            'daftar' => [
                'Berbicara dengan boneka.',
                'Menunjuk dan mengucapkan orang, benda, atau organ tubuh yang sudah dikenal.',
                'Bacakan dongeng pada saat mengenalkan dan menyuruh menunjuk.',
                'Pegang mainan dengan dua tangan.',
                'Memasukkan benda kecil ke dalam wadah.',
                'Menyusun balok.',
                'Sembunyikan dan cari mainan.',
                'Memegang pensil dan mencoret-coret kertas.',
                'Duduk, merangkak, berdiri berpegangan.',
                'Berjalan mundur, jinjit.',
            ],
        ],
        [
            'dari' => 12,
            'sampai' => 17,
            'label' => '12–18 bulan',
            'halaman' => 'Buku KIA hlm. 68–69',
            'daftar' => [
                'Berjalan mundur, naik tangga.',
                'Tangkap dan lempar bola.',
                'Menyusun balok atau puzzle, menggambar.',
                'Bermain air, meniup, menendang bola.',
                'Bercerita tentang gambar di buku.',
                'Menyebutkan nama benda, menyanyi.',
                'Main telepon-teleponan, menyatakan keinginan.',
                'Bermain dengan teman sebaya, petak umpet.',
                'Merapikan mainan, membuka baju.',
                'Makan bersama.',
                'Merangkai manik besar.',
            ],
        ],
        [
            'dari' => 18,
            'sampai' => 23,
            'label' => '18–24 bulan',
            'halaman' => 'Buku KIA hlm. 68–69',
            'daftar' => [
                'Bicara, bertanya, bercerita, bernyanyi.',
                'Tanya jawab, main telepon-teleponan.',
                'Perintah sederhana, membantu pekerjaan.',
                'Melepas baju, rapikan mainan.',
                'Makan bersama dengan sendok garpu.',
                'Menyusun balok, memasang puzzle, menggambar, membentuk lilin.',
                'Buat rumah-rumahan, petak umpet.',
                'Berjalan, berlari, melompat.',
                'Berdiri satu kaki, naik turun tangga.',
                'Melempar, menangkap, menendang bola.',
            ],
        ],
        [
            'dari' => 24,
            'sampai' => 35,
            'label' => '2–3 tahun',
            'halaman' => 'Buku KIA hlm. 78–79',
            'daftar' => [
                'Sebutkan nama benda, sifat, guna benda.',
                'Bacakan cerita, tanya jawab.',
                'Anak diminta bercerita pengalaman menonton TV didampingi maksimal 1 jam, menyanyi.',
                'Cuci tangan, cebok, berpakaian, rapikan mainan.',
                'Makan dengan sendok garpu.',
                'Menyusun balok, memasang puzzle, menggambar, menempel.',
                'Mengelompokkan benda sejenis.',
                'Mencocokkan gambar dan benda.',
                'Menghitung.',
                'Melempar, menangkap.',
                'Berlari, melompat, memanjat, merayap.',
            ],
        ],
        [
            'dari' => 36,
            'sampai' => 47,
            'label' => '3–4 tahun',
            'halaman' => 'Buku KIA hlm. 80–81',
            'daftar' => [
                'Menyebutkan nama benda, sifat, guna benda.',
                'Bacakan cerita, tanya jawab.',
                'Anak diminta bercerita pengalaman.',
                'Menonton TV didampingi, menyanyi.',
                'Cuci tangan, cebok, berpakaian, rapikan mainan.',
                'Makan dengan sendok garpu.',
                'Menyusun balok atau puzzle, menggambar, menempel.',
                'Mengelompokkan benda sejenis.',
                'Mencocokkan gambar dan benda.',
                'Menghitung.',
                'Melempar, menangkap.',
                'Berlari, melompat, memanjat, merayap.',
            ],
        ],
        [
            'dari' => 48,
            'sampai' => 59,
            'label' => '4–5 tahun',
            'halaman' => 'Buku KIA hlm. 82–83',
            'daftar' => [
                'Bermain peran, anak diminta bercerita pengalaman.',
                'Menggambar orang, mengenal huruf.',
                'Main bola, lompat tali.',
                'Latih untuk dapat mengikuti aturan permainan.',
                'Kenalkan nama-nama hari.',
                'Menyebut angka berurutan.',
                'Mengajak anak sikat gigi bersama dan melatih sikat gigi sendiri.',
                'Melatih memakai pakaian sendiri.',
                'Menguatkan kepercayaan diri anak.',
            ],
        ],
        [
            'dari' => 60,
            'sampai' => 71,
            'label' => '5–6 tahun',
            'halaman' => 'Buku KIA hlm. 82–83',
            'daftar' => [
                'Mengenal nama, fungsi benda-benda.',
                'Bacakan buku, tanya jawab, bercerita.',
                'Menonton TV didampingi maksimal 1 jam, menyanyi.',
                'Cuci tangan, cebok, berpakaian, rapikan mainan.',
                'Melempar, menangkap, berlari, melompat.',
                'Makan dengan sendok garpu, masak-masakan.',
                'Menggunting, menempel, menjahit.',
                'Menyusun balok, memasang puzzle, menggambar, mewarna, menulis nama.',
                'Mengingat, menghafal, mengerti aturan dan urutan.',
                'Membandingkan besar kecil, banyak sedikit.',
                'Menghitung, konsep satu dan setengah.',
                'Mengenal angka, huruf, simbol, jam, hari dan tanggal.',
                'Memanjat, merayap, sepeda roda tiga, ayunan.',
                'Bermain berjualan, bertukang, dan mengukur.',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tidur dan gawai (Buku KIA hlm. 48, 52, 66, 80)
    |--------------------------------------------------------------------------
    */

    'tidur' => [
        'sumber' => 'Buku KIA 2024 hlm. 40, 48, 72, 80',
        'daftar' => [
            ['umur' => '0–28 hari', 'durasi' => 'Sampai 16 jam sehari'],
            ['umur' => '4–12 bulan', 'durasi' => '12–16 jam sehari (termasuk tidur siang)'],
            ['umur' => '1–2 tahun', 'durasi' => '11–14 jam sehari (termasuk tidur siang)'],
            ['umur' => '3–5 tahun', 'durasi' => '10–13 jam sehari (termasuk tidur siang)'],
        ],
        'gawai' => [
            'Anak berusia di bawah 18 bulan tidak menggunakan gawai kecuali dalam bentuk video-call dengan didampingi orang tua.',
            'Anak 18–24 bulan: batasi tidak lebih dari 1 jam per hari, hanya konten berkualitas, didampingi orang tua.',
            'Anak di atas 24 bulan: batasi tidak lebih dari 1 jam per hari, jangan saat makan, dan jangan 1 jam sebelum tidur.',
            'Jangan menggunakan gawai untuk menenangkan perilaku anak.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tindak lanjut status gizi
    |--------------------------------------------------------------------------
    |
    | Aturan tindak lanjut untuk tiap kategori status gizi. Kunci mengikuti
    | kode kategori di App\Gizi\HasilAntropometri::kategori().
    |
    | 'tingkat' menentukan urutan tampil dan warna chip:
    |   rujuk          → segera ke puskesmas
    |   tindak_lanjut  → ditangani di posyandu, pantau bulan depan
    |   pantau         → pemantauan rutin
    |
    | 'sumber' wajib diisi: halaman Buku KIA atau pasal Permenkes yang
    | menjadi dasar. Jangan menambah tindakan di luar sumber.
    |
    */

    'tindak_lanjut' => [

        // BB/U (Buku KIA hlm. 132–135, 144–147; Permenkes 2/2020)
        'sangat_kurang' => [
            'judul' => 'Berat badan sangat kurang',
            'tingkat' => 'rujuk',
            'tindakan' => [
                'Rujuk ke puskesmas hari ini untuk konfirmasi dan tata laksana.',
                'Ukur ulang berat badan sebelum dirujuk untuk memastikan hasil.',
                'Catatan tindak lanjut wajib diisi di Meja 5.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 132–135, 144–147 (Permenkes 2/2020)',
        ],
        'kurang' => [
            'judul' => 'Berat badan kurang',
            'tingkat' => 'tindak_lanjut',
            'tindakan' => [
                'Beri penyuluhan pemenuhan gizi dan pemberian makanan tambahan.',
                'Pantau berat badan setiap bulan di Posyandu.',
                'Rujuk ke puskesmas bila berat badan tidak naik pada penimbangan berikutnya.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 132–135, 144–147 (Permenkes 2/2020)',
        ],
        'risiko_lebih' => [
            'judul' => 'Risiko berat badan lebih',
            'tingkat' => 'tindak_lanjut',
            'tindakan' => [
                'Beri penyuluhan pola makan seimbang dan aktivitas fisik.',
                'Pantau berat badan setiap bulan agar tidak berlanjut menjadi gizi lebih.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 132–135, 144–147 (Permenkes 2/2020)',
        ],

        // PB/U atau TB/U (Buku KIA hlm. 134–137, 146–149)
        'sangat_pendek' => [
            'judul' => 'Sangat pendek',
            'tingkat' => 'rujuk',
            'tindakan' => [
                'Rujuk ke puskesmas untuk konfirmasi dan pemeriksaan lanjutan.',
                'Beri penyuluhan pencegahan stunting: protein hewani, sanitasi, dan pemantauan bulanan.',
                'Catatan tindak lanjut wajib diisi di Meja 5.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 134–137, 146–149; PRD 5.8',
        ],
        'pendek' => [
            'judul' => 'Pendek',
            'tingkat' => 'rujuk',
            'tindakan' => [
                'Rujuk ke puskesmas untuk konfirmasi.',
                'Beri penyuluhan pencegahan stunting: protein hewani, sanitasi, dan pemantauan bulanan.',
                'Catatan tindak lanjut wajib diisi di Meja 5.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 134–137, 146–149; PRD 5.8',
        ],
        'tinggi' => [
            'judul' => 'Tinggi',
            'tingkat' => 'pantau',
            'tindakan' => [
                'Tidak perlu rujukan. Lanjutkan pemantauan pertumbuhan rutin setiap bulan.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 134–137, 146–149 (Permenkes 2/2020)',
        ],

        // BB/PB, BB/TB, IMT/U (Buku KIA hlm. 138–141, 150–153)
        'gizi_buruk' => [
            'judul' => 'Gizi buruk',
            'tingkat' => 'rujuk',
            'tindakan' => [
                'Rujuk ke puskesmas hari ini untuk konfirmasi dan tata laksana gizi buruk.',
                'Ukur ulang berat badan dan panjang atau tinggi badan sebelum dirujuk.',
                'Catatan tindak lanjut wajib diisi di Meja 5.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 138–141, 150–153; Permenkes 2/2020',
        ],
        'gizi_kurang' => [
            'judul' => 'Gizi kurang',
            'tingkat' => 'tindak_lanjut',
            'tindakan' => [
                'Beri penyuluhan pemenuhan gizi dan pemberian makanan tambahan.',
                'Pantau berat badan setiap bulan di Posyandu.',
                'Rujuk ke puskesmas bila tidak membaik pada penimbangan berikutnya.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 138–141, 150–153; Permenkes 2/2020',
        ],
        'gizi_lebih' => [
            'judul' => 'Gizi lebih',
            'tingkat' => 'tindak_lanjut',
            'tindakan' => [
                'Beri penyuluhan pola makan seimbang, pembatasan gula dan makanan ringan, serta aktivitas fisik.',
                'Pantau berat badan setiap bulan.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 138–141, 150–153; PRD 6.4',
        ],
        'obesitas' => [
            'judul' => 'Obesitas',
            'tingkat' => 'tindak_lanjut',
            'tindakan' => [
                'Beri penyuluhan pola makan seimbang, pembatasan gula dan makanan ringan, serta aktivitas fisik.',
                'Pantau berat badan setiap bulan dan rujuk bila tidak membaik.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 138–141, 150–153; PRD 6.4',
        ],

        // LK/U (Buku KIA hlm. 140–141, 152–153)
        'mikrosefali' => [
            'judul' => 'Mikrosefali',
            'tingkat' => 'rujuk',
            'tindakan' => [
                'Rujuk ke puskesmas untuk pemeriksaan lanjutan lingkar kepala dan perkembangan.',
                'Ukur ulang lingkar kepala sebelum dirujuk.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 140–141, 152–153 (Permenkes 2/2020)',
        ],
        'makrosefali' => [
            'judul' => 'Makrosefali',
            'tingkat' => 'rujuk',
            'tindakan' => [
                'Rujuk ke puskesmas untuk pemeriksaan lanjutan lingkar kepala dan perkembangan.',
                'Ukur ulang lingkar kepala sebelum dirujuk.',
            ],
            'sumber' => 'Buku KIA 2024 hlm. 140–141, 152–153 (Permenkes 2/2020)',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tindak lanjut LiLA (Buku KIA hlm. 49, 128–129)
    |--------------------------------------------------------------------------
    |
    | Ambang berbeda untuk anak di bawah 6 bulan dan 6 bulan ke atas.
    |
    */

    'tindak_lanjut_lila' => [
        [
            'dari' => 0,
            'sampai' => 5,
            'label' => 'LiLA usia < 6 bulan',
            'halaman' => 'Buku KIA hlm. 128–129',
            'kategori' => [
                ['kode' => 'berisiko', 'batas' => '< 10,0 cm', 'label' => 'Berisiko hambatan pertumbuhan', 'tingkat' => 'rujuk', 'tindakan' => 'Rujuk ke puskesmas untuk pemeriksaan lanjutan.'],
                ['kode' => 'normal', 'batas' => '≥ 11,0 cm', 'label' => 'Pertumbuhan baik', 'tingkat' => 'pantau', 'tindakan' => 'Lanjutkan pemantauan pertumbuhan rutin setiap bulan.'],
            ],
        ],
        [
            'dari' => 6,
            'sampai' => 59,
            'label' => 'LiLA usia 6–59 bulan',
            'halaman' => 'Buku KIA hlm. 49, 128–129',
            'kategori' => [
                ['kode' => 'gizi_buruk', 'batas' => '< 11,5 cm', 'label' => 'Gizi buruk', 'tingkat' => 'rujuk', 'tindakan' => 'Rujuk ke puskesmas untuk pemeriksaan lanjutan.'],
                ['kode' => 'gizi_kurang', 'batas' => '11,5–12,4 cm', 'label' => 'Gizi kurang', 'tingkat' => 'rujuk', 'tindakan' => 'Rujuk ke puskesmas untuk pemeriksaan lanjutan.'],
                ['kode' => 'normal', 'batas' => '≥ 12,5 cm', 'label' => 'Gizi baik', 'tingkat' => 'pantau', 'tindakan' => 'Lanjutkan pemantauan pertumbuhan rutin setiap bulan.'],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Anjuran sesuai umur (Buku KIA hlm. 38–87, 122–125)
    |--------------------------------------------------------------------------
    |
    | Tindak lanjut di Posyandu berbeda menurut umur anak. Daftar ini dipakai
    | Meja 5 untuk menambahkan anjuran yang sesuai umur pada setiap status
    | gizi, dan halaman Panduan KIA untuk menjelaskan "apa yang harus
    | dilakukan" pada kelompok umur anak.
    |
    | 'anjuran' hanya memuat hal yang tertulis di buku; tidak ada tambahan
    | tindakan di luar buku.
    |
    */

    'anjuran_umur' => [
        [
            'dari' => 0,
            'sampai' => 0,
            'label' => 'Bayi baru lahir (0–28 hari)',
            'halaman' => 'Buku KIA hlm. 40–41, 122–123',
            'anjuran' => [
                'Periksakan bayi ke tenaga kesehatan pada 0–6 jam, 6–48 jam, 3–7 hari, dan 8–28 hari setelah lahir.',
                'Pastikan imunisasi hepatitis B (HB0) diberikan sebelum 24 jam.',
                'Berikan ASI saja sampai usia 6 bulan.',
                'Jaga bayi tetap hangat, bersih, dan tidur terlentang di alas rata.',
                'Kenali tanda bahaya bayi baru lahir dan segera ke fasilitas kesehatan bila ditemukan.',
            ],
        ],
        [
            'dari' => 1,
            'sampai' => 5,
            'label' => 'Bayi 1–5 bulan',
            'halaman' => 'Buku KIA hlm. 38–39, 52–55',
            'anjuran' => [
                'Berikan ASI saja sampai usia 6 bulan; jangan tambahkan air putih, makanan, atau minuman lain.',
                'Timbang berat badan dan ukur panjang badan setiap bulan di Posyandu.',
                'Lengkapi imunisasi dasar sesuai usia (hlm. 124–125).',
                'Ajak bayi bermain dan berbicara untuk merangsang perkembangan.',
                'Cek tanda bahaya setiap bulan dan segera ke fasilitas kesehatan bila ditemukan.',
            ],
        ],
        [
            'dari' => 6,
            'sampai' => 8,
            'label' => 'Bayi 6–8 bulan',
            'halaman' => 'Buku KIA hlm. 56–63',
            'anjuran' => [
                'Mulai MPASI lumat dan kental 2–3 kali makanan utama serta 1–2 kali makanan selingan setiap hari.',
                'Lanjutkan ASI sampai usia 2 tahun atau lebih.',
                'Pastikan bayi mendapat vitamin A kapsul biru 1 kali setahun pada bulan Februari atau Agustus.',
                'Timbang berat badan dan ukur panjang badan setiap bulan di Posyandu.',
                'Lengkapi imunisasi sesuai usia dan cek perkembangan setiap bulan.',
            ],
        ],
        [
            'dari' => 9,
            'sampai' => 11,
            'label' => 'Bayi 9–11 bulan',
            'halaman' => 'Buku KIA hlm. 56–65',
            'anjuran' => [
                'Berikan MPASI dicincang 3–4 kali makanan utama serta 1–2 kali makanan selingan setiap hari.',
                'Lanjutkan ASI sampai usia 2 tahun atau lebih.',
                'Pastikan bayi mendapat vitamin A kapsul biru 1 kali setahun pada bulan Februari atau Agustus.',
                'Timbang berat badan dan ukur panjang badan setiap bulan di Posyandu.',
                'Ajak bayi bermain, berbicara, dan berlatih berdiri berpegangan.',
            ],
        ],
        [
            'dari' => 12,
            'sampai' => 23,
            'label' => 'Anak 12–23 bulan',
            'halaman' => 'Buku KIA hlm. 66–73, 122–123',
            'anjuran' => [
                'Berikan makanan keluarga 3–4 kali makanan utama serta 1–2 kali makanan selingan setiap hari.',
                'Lanjutkan ASI sampai usia 2 tahun atau lebih.',
                'Berikan vitamin A kapsul merah pada bulan Februari atau Agustus.',
                'Berikan obat cacing dua kali dalam setahun.',
                'Timbang berat badan dan ukur panjang badan setiap bulan di Posyandu.',
            ],
        ],
        [
            'dari' => 24,
            'sampai' => 60,
            'label' => 'Anak 2–5 tahun',
            'halaman' => 'Buku KIA hlm. 74–87, 122–123',
            'anjuran' => [
                'Berikan gizi seimbang: makanan pokok, lauk hewani dan nabati, sayur, dan buah.',
                'Berikan vitamin A kapsul merah pada bulan Februari atau Agustus.',
                'Berikan obat cacing dua kali dalam setahun.',
                'Timbang berat badan dan ukur tinggi badan setiap bulan di Posyandu.',
                'Lakukan perawatan gigi dan dampingi anak menggosok gigi sebelum tidur.',
                'Ajak anak bergerak aktif dan bermain bersama anak lain.',
            ],
        ],
    ],

];
