<!-- Dikonversi otomatis dari docs/sumber/PRD_Sistem_Informasi_Posyandu_Lima_Meja.docx tanpa mengubah isi. Jika berbeda, berkas .docx yang berlaku. -->

PRODUCT REQUIREMENTS DOCUMENT

Sistem Informasi Posyandu Lima Meja

Aplikasi web pendukung kegiatan posyandu balita

dengan alur Pendaftaran, Pengukuran, Pendataan, Pelayanan, dan Penyuluhan

| Nama produk | Sistem Informasi Posyandu Lima Meja (nama kerja) |
|---|---|
| Jenis dokumen | Product Requirements Document (PRD) |
| Versi | 1.0 |
| Tanggal | 3 November 2026 |
| Status | Draf untuk ditinjau |
| Pengguna | Kader posyandu |
| Acuan utama | Konsep website dan Buku KIA 2024 |

Riwayat Revisi

| Versi | Tanggal | Keterangan |
|---|---|---|
| 1.0 | 3 November 2026 | Dokumen awal disusun dari konsep website dan Buku KIA 2024. Tahap 3 memakai nama Pendataan. Aplikasi hanya untuk kader. |

Daftar Isi

- 1. Pendahuluan … 4

- 1.1 Latar Belakang … 4

- 1.2 Tujuan Dokumen … 4

- 1.3 Ruang Lingkup … 4

- 1.4 Definisi dan Singkatan … 5

- 1.5 Acuan … 5

- 2. Ringkasan Produk … 6

- 2.1 Pernyataan Masalah … 6

- 2.2 Tujuan Produk dan Indikator Keberhasilan … 6

- 2.3 Pengguna dan Hak Akses … 7

- 2.4 Prinsip Desain … 7

- 3. Alur Layanan Lima Meja … 8

- 3.1 Gambaran Alur … 8

- 3.2 Status Antrean … 8

- 3.3 Aturan Antrean dan Sinkronisasi … 9

- 4. Kebutuhan Fungsional … 9

- 4.1 Masuk Sistem … 9

- 4.2 Beranda … 10

- 4.3 Tahap 1: Pendaftaran (Meja 1) … 10

- 4.4 Tahap 2: Pengukuran (Meja 2) … 12

- 4.5 Tahap 3: Pendataan (Meja 3) … 13

- 4.6 Tahap 4: Pelayanan (Meja 4) … 13

- 4.7 Tahap 5: Penyuluhan (Meja 5) … 14

- 4.8 Penundaan Antrean … 15

- 4.9 Menu Data Anak … 16

- 4.10 Menu Rekapitulasi Imunisasi … 16

- 4.11 Menu Data Posyandu … 17

- 4.12 Input Riwayat dari Buku KIA … 17

- 4.13 Tema Warna Berdasarkan Jenis Kelamin … 17

- 5. Standar Pertumbuhan Anak Berdasarkan Buku KIA … 18

- 5.1 Sumber dan Cakupan … 18

- 5.2 Grafik Anak Laki-laki … 18

- 5.3 Grafik Anak Perempuan … 19

- 5.4 Klasifikasi Status Gizi … 19

- 5.5 KMS, Kenaikan Berat Badan Minimal, dan Status N/T … 20

- 5.6 Aturan Perhitungan … 21

- 5.7 Spesifikasi Tampilan Grafik … 21

- 5.8 Deteksi dan Prediksi Risiko Stunting … 22

- 6. Konten Layanan dan Edukasi … 22

- 6.1 Jadwal Imunisasi … 22

- 6.2 Vitamin A dan Obat Cacing … 23

- 6.3 Isi Piringku untuk Ibu Menyusui … 23

- 6.4 Materi Penyuluhan Fleksibel … 24

- 7. Kebutuhan Data … 24

- 7.1 Entitas Utama … 24

- 7.2 Aturan Validasi Isian … 25

- 7.3 Format Ekspor CSV … 25

- 8. Kebutuhan Antarmuka … 25

- 8.1 Daftar Layar … 25

- 8.2 Pedoman Tampilan … 26

- 9. Kebutuhan Nonfungsional … 26

- 10. Rencana Rilis … 27

- 11. Risiko dan Mitigasi … 28

- 12. Asumsi, Batasan, dan Pertanyaan Terbuka … 28

- 12.1 Asumsi … 28

- 12.2 Batasan … 28

- 12.3 Pertanyaan Terbuka … 29

# 1. Pendahuluan

## 1.1 Latar Belakang

Kegiatan posyandu balita dijalankan oleh kader melalui lima meja yang berurutan: pendaftaran, pengukuran, pendataan, pelayanan, dan penyuluhan. Selama ini hasil kegiatan dicatat secara manual di Buku Kesehatan Ibu dan Anak (Buku KIA) serta buku register posyandu. Cara manual ini membuat kader harus mencari data kunjungan sebelumnya secara manual, menghitung status gizi dengan membaca grafik secara manual, dan menyusun rekap bulanan dari banyak lembar catatan.

Dokumen ini mendefinisikan kebutuhan aplikasi web yang mendigitalkan alur lima meja tersebut. Setiap kader memegang satu meja dan bekerja dari ponselnya masing-masing. Data anak berpindah otomatis dari satu meja ke meja berikutnya melalui antrean, sehingga kader tidak perlu menyalin ulang data yang sama.

## 1.2 Tujuan Dokumen

Dokumen ini menjadi acuan bersama bagi pemilik produk, perancang antarmuka, pengembang, dan penguji. Dokumen menjelaskan apa yang harus dibangun, siapa penggunanya, aturan perhitungan yang dipakai, serta kriteria yang menandai sebuah fitur selesai. Rincian teknis implementasi, seperti pilihan bahasa pemrograman dan arsitektur server, diputuskan oleh tim pengembang selama tetap memenuhi kebutuhan dalam dokumen ini.

## 1.3 Ruang Lingkup

Ruang lingkup produk pada versi ini dibatasi sebagai berikut.

Tabel 1. Ruang lingkup produk

| Termasuk dalam lingkup | Di luar lingkup |
|---|---|
| Masuk sistem dengan nama pengguna dan kata sandi yang dibuat di dalam sistem | Masuk menggunakan akun Google atau media sosial |
| Alur lima meja posyandu balita beserta antrean antar meja | Layanan ibu hamil, ibu nifas, dan posyandu lansia |
| Perhitungan status gizi dan grafik pertumbuhan sesuai Buku KIA 2024 | Diagnosis medis; aplikasi hanya melakukan skrining |
| Menu Data Anak, Rekapitulasi Imunisasi, dan Data Posyandu dengan ekspor CSV | Integrasi otomatis dengan sistem milik Kementerian Kesehatan atau puskesmas |
| Input riwayat lama dari Buku KIA ke dalam sistem | Akses untuk orang tua, tenaga kesehatan, atau masyarakat umum |
| Tampilan untuk ponsel, tetap dapat dipakai di laptop | Aplikasi Android atau iOS yang dipasang dari toko aplikasi |

## 1.4 Definisi dan Singkatan

Tabel 2. Definisi dan singkatan

| Istilah | Arti |
|---|---|
| Kader | Relawan posyandu yang menjalankan kegiatan di salah satu meja dan merupakan satu-satunya pengguna aplikasi. |
| Ketua Kader | Kader yang diberi hak tambahan untuk mengelola akun kader dan profil posyandu. |
| Meja | Pos kerja dalam kegiatan posyandu. Meja 1 sampai Meja 5 masing-masing menjalankan satu tahap. |
| Kunjungan | Satu kali kehadiran anak di posyandu pada tanggal tertentu, mulai dari Meja 1 sampai Meja 5. |
| Antrean | Daftar anak yang menunggu dilayani di sebuah meja, berurutan sesuai waktu masuk. |
| BB | Berat badan, dalam kilogram (kg). |
| PB / TB | Panjang badan (diukur telentang) atau tinggi badan (diukur berdiri), dalam sentimeter (cm). |
| LiLA | Lingkar lengan atas, dalam sentimeter (cm). |
| LK | Lingkar kepala, dalam sentimeter (cm). |
| IMT | Indeks massa tubuh, yaitu BB dibagi kuadrat PB/TB dalam meter (kg/m²). |
| SD / z-score | Simpangan baku terhadap median standar WHO; dipakai untuk menentukan status gizi. |
| KMS | Kartu Menuju Sehat, grafik berat badan menurut umur dalam Buku KIA. |
| KBM | Kenaikan Berat Badan Minimal yang harus dicapai anak setiap bulan menurut KMS. |
| N / T | Status penimbangan: N = naik, T = tidak naik. |
| NIK | Nomor Induk Kependudukan, 16 digit. |
| CSV | Format berkas teks berisi tabel yang dapat dibuka di aplikasi lembar kerja. |

## 1.5 Acuan

- Konsep website posyandu yang disusun pemilik produk.

- Buku Kesehatan Ibu dan Anak (Buku KIA) edisi 2024, Kementerian Kesehatan Republik Indonesia, khususnya halaman grafik pertumbuhan anak laki-laki dan perempuan (halaman PDF 69 sampai 78).

- Peraturan Menteri Kesehatan Nomor 2 Tahun 2020 tentang Standar Antropometri Anak, sebagaimana dikutip pada setiap grafik Buku KIA.

- WHO Child Growth Standards sebagai sumber tabel nilai median dan simpangan baku.

- Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.

# 2. Ringkasan Produk

## 2.1 Pernyataan Masalah

Tabel 3. Masalah yang diselesaikan

| Masalah saat ini | Dampak | Jawaban produk |
|---|---|---|
| Data kunjungan sebelumnya harus dicari di buku | Antrean lambat dan perbandingan hasil ukur sering terlewat | Riwayat dan perbandingan tampil otomatis saat nama atau NIK dicari |
| Status gizi dibaca langsung dari grafik di buku | Hasil antar kader bisa berbeda dan rawan salah | Status gizi dihitung otomatis dengan standar yang sama |
| Data diserahkan antar meja secara lisan atau kertas | Data tercatat ulang dan rawan tertukar | Antrean digital yang sinkron di semua meja |
| Jadwal imunisasi, vitamin A, dan obat cacing diingat manual | Anak bisa terlewat imunisasi | Rekomendasi layanan berdasarkan umur dan riwayat |
| Rekap bulanan disusun dari banyak lembar | Memakan waktu dan rawan salah hitung | Rekap otomatis yang dapat diunduh sebagai CSV |

## 2.2 Tujuan Produk dan Indikator Keberhasilan

Tabel 4. Tujuan dan indikator keberhasilan

| Tujuan | Indikator | Target |
|---|---|---|
| Mempercepat pelayanan | Waktu rata-rata satu anak dari Meja 1 sampai Meja 5 | Turun 30% dibanding cara manual |
| Data lengkap dan akurat | Kunjungan yang memiliki BB, PB/TB, dan LK lengkap | Minimal 95% kunjungan |
| Deteksi dini masalah gizi | Anak dengan status tidak normal yang memiliki catatan tindak lanjut | 100% |
| Imunisasi tepat waktu | Anak dengan imunisasi tertunda yang tercatat di rekap | 100% terdeteksi |
| Pelaporan cepat | Waktu menyusun rekap bulanan | Kurang dari 5 menit |
| Mudah dipakai kader | Kader yang dapat memakai aplikasi setelah satu kali pelatihan | Minimal 90% kader |

## 2.3 Pengguna dan Hak Akses

Aplikasi hanya dapat digunakan oleh kader posyandu. Orang tua, tenaga kesehatan, dan masyarakat umum tidak memiliki akun dan tidak dapat membuka data. Tidak ada halaman pendaftaran akun mandiri; seluruh akun kader dibuat oleh Ketua Kader dari dalam sistem.

Tabel 5. Peran pengguna

| Peran | Siapa | Hak akses |
|---|---|---|
| Ketua Kader | Kader yang ditunjuk sebagai koordinator | Seluruh hak Kader, ditambah membuat, menonaktifkan, dan mengatur ulang kata sandi akun kader, mengubah profil posyandu, serta menghapus data anak. |
| Kader | Kader yang bertugas di Meja 1 sampai Meja 5 | Membuka Beranda, menjalankan meja yang dipilih, membuka Data Anak, Rekapitulasi Imunisasi, dan Data Posyandu, mengubah data anak, serta mengunduh CSV. |

Satu akun kader dapat menjalankan meja mana pun. Pada awal kegiatan, kader memilih meja yang akan dipegangnya hari itu, sehingga pembagian tugas tetap fleksibel ketika ada kader yang berhalangan.

## 2.4 Prinsip Desain

- Ponsel terlebih dahulu. Tampilan dirancang untuk layar ponsel dengan lebar mulai 360 piksel dan tetap rapi di laptop.

- Satu meja, satu layar kerja. Kader hanya melihat antrean dan isian yang relevan dengan mejanya.

- Input sederhana. Angka desimal boleh ditulis dengan koma atau titik, isian wajib ditandai jelas, dan tombol berukuran besar.

- Warna sesuai jenis kelamin. Layar progres anak laki-laki bernuansa biru dan anak perempuan bernuansa merah muda, mengikuti warna Buku KIA.

- Sesuai Buku KIA. Istilah, kategori status gizi, dan grafik mengikuti Buku KIA 2024 agar kader mudah menyalin hasil ke buku.

# 3. Alur Layanan Lima Meja

## 3.1 Gambaran Alur

Setiap kunjungan melewati lima tahap secara berurutan. Setelah sebuah meja menyimpan data, anak otomatis masuk ke antrean meja berikutnya, sementara kader di meja tersebut langsung melayani anak berikutnya.

Tabel 6. Lima tahap layanan posyandu

| Meja | Tahap | Kegiatan utama | Hasil yang diteruskan |
|---|---|---|---|
| 1 | Pendaftaran | Mendaftarkan anak baru atau mencari anak yang sudah terdaftar, lalu membuka kunjungan hari ini | Anak masuk antrean Meja 2 |
| 2 | Pengukuran | Mengisi BB, PB/TB, LiLA, dan LK hasil pengukuran hari ini | Hasil ukur masuk antrean Meja 3 |
| 3 | Pendataan | Menampilkan hasil ukur dan perbandingannya dengan kunjungan sebelumnya untuk disalin ke Buku KIA, serta mengisi status ASI eksklusif | Data terkonfirmasi masuk antrean Meja 4 |
| 4 | Pelayanan | Menentukan dan mencatat imunisasi, vitamin A, dan obat cacing, beserta catatan pelayanan | Layanan masuk antrean Meja 5 |
| 5 | Penyuluhan | Menampilkan ringkasan kunjungan, status gizi, grafik pertumbuhan, dan materi edukasi, lalu mengisi catatan tindak lanjut | Kunjungan selesai |

## 3.2 Status Antrean

Tabel 7. Status kunjungan di setiap meja

| Status | Arti | Perubahan yang diizinkan |
|---|---|---|
| Menunggu | Anak sudah masuk antrean meja dan belum dibuka kader | Menjadi Sedang Dilayani saat kader membuka anak tersebut |
| Sedang Dilayani | Kader sedang mengisi data anak di meja ini | Menjadi Menunggu di meja berikutnya setelah disimpan, atau Ditunda |
| Ditunda | Anak belum dapat melanjutkan tahap, misalnya rewel atau orang tua sedang keluar | Kembali menjadi Menunggu saat kader memilih Lanjutkan |
| Selesai | Anak telah menyelesaikan Meja 5 | Status akhir; data dapat dilihat di menu Data Anak |

## 3.3 Aturan Antrean dan Sinkronisasi

- Antrean setiap meja diperbarui di semua perangkat dalam waktu paling lama 3 detik setelah meja sebelumnya menyimpan data.

- Urutan antrean mengikuti waktu masuk ke meja tersebut. Nomor antrean ditampilkan pada setiap anak.

- Satu anak hanya boleh memiliki satu kunjungan aktif pada tanggal yang sama.

- Satu anak hanya dapat dibuka oleh satu kader pada saat yang sama. Kader lain melihat tanda bahwa anak sedang dilayani.

- Anak berstatus Ditunda tidak menghalangi antrean; kader langsung dapat melayani anak berikutnya.

- Kunjungan yang belum selesai sampai akhir hari tetap tersimpan dengan tahap terakhir yang dicapai dan ditandai belum selesai.

# 4. Kebutuhan Fungsional

Setiap kebutuhan diberi kode unik dan tingkat prioritas. Wajib harus ada pada rilis pertama, Penting sebaiknya ada pada rilis pertama, dan Tambahan dapat menyusul pada rilis berikutnya.

## 4.1 Masuk Sistem

Tabel 8. Kebutuhan fungsional Masuk Sistem

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Halaman pertama aplikasi adalah halaman masuk berisi isian nama pengguna dan kata sandi, tanpa pilihan masuk dengan akun Google. | Wajib |
| FR-02 | Akun kader dibuat, dinonaktifkan, dan diatur ulang kata sandinya oleh Ketua Kader dari menu pengaturan akun di dalam sistem. Tidak ada pendaftaran akun mandiri. | Wajib |
| FR-03 | Setelah berhasil masuk, kader memilih meja yang dipegang hari itu (Meja 1 sampai Meja 5) lalu diarahkan ke Beranda. | Wajib |
| FR-04 | Lima kali gagal masuk berturut-turut mengunci akun selama 15 menit. | Penting |
| FR-05 | Sesi berakhir otomatis setelah 2 jam tidak ada aktivitas, dan kader dapat keluar kapan saja melalui tombol Keluar. | Penting |

Kriteria penerimaan:

- Pengguna tanpa akun tidak dapat membuka halaman apa pun selain halaman masuk.

- Kata sandi yang salah menampilkan pesan umum tanpa menyebutkan apakah nama pengguna terdaftar.

## 4.2 Beranda

Beranda menjadi layar utama setelah masuk. Bagian atas menampilkan tanggal hari ini dan ringkasan kegiatan yang dihitung berdasarkan tanggal tersebut.

Tabel 9. Kebutuhan fungsional Beranda

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-06 | Menampilkan kartu ringkasan hari ini: jumlah anak terdaftar dalam kunjungan hari ini, jumlah anak yang sudah ditimbang (selesai Meja 2), dan jumlah anak yang selesai dilayani (selesai Meja 5). | Wajib |
| FR-07 | Menampilkan jumlah anak yang menunggu dan yang ditunda di setiap meja. | Wajib |
| FR-08 | Menampilkan pintasan ke lima tahap layanan serta menu Data Anak, Rekapitulasi Imunisasi, dan Data Posyandu. | Wajib |
| FR-09 | Angka ringkasan diperbarui otomatis tanpa memuat ulang halaman. | Penting |

Kriteria penerimaan:

- Pada pergantian tanggal, seluruh angka ringkasan kembali dihitung untuk tanggal yang baru.

## 4.3 Tahap 1: Pendaftaran (Meja 1)

Meja 1 menyediakan dua jalur: Tambah Anak untuk anak yang belum terdaftar dan Lanjutkan Progres Anak untuk anak yang sudah terdaftar dan rutin datang ke posyandu. Meja 1 hanya berfokus pada pendaftaran; pengukuran dilakukan di Meja 2.

a. Tambah Anak

Tabel 10. Isian formulir Tambah Anak

| Kelompok | Isian | Keterangan |
|---|---|---|
| Identitas anak | Nama lengkap anak | Wajib |
|  | Jenis kelamin | Wajib; pilihan Laki-laki atau Perempuan |
|  | Tempat lahir | Opsional |
|  | Tanggal lahir | Wajib; tidak boleh setelah hari ini |
|  | NIK anak | Opsional; jika diisi harus 16 digit dan unik |
| Data orang tua | Nama ibu | Wajib |
|  | NIK ibu | Opsional; 16 digit |
|  | Nama ayah | Opsional |
|  | NIK ayah | Opsional; 16 digit |
|  | Nomor HP orang tua | Opsional; 10 sampai 13 digit, diawali 08 atau +62 |
| Alamat | Alamat lengkap, RT, RW, dan Dusun | Alamat lengkap dan Dusun wajib; RT dan RW berupa angka |
| Pengukuran dari Buku KIA | BB, PB/TB, LiLA, LK, dan tanggal pengukuran | Opsional; hasil pengukuran terakhir yang tertulis di buku, dipakai sebagai pembanding |

Tabel 11. Kebutuhan fungsional Tahap 1: Pendaftaran

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-10 | Formulir Tambah Anak memuat isian sesuai tabel di atas, dengan tombol Batal dan Simpan Data. | Wajib |
| FR-11 | Sistem menolak penyimpanan jika NIK anak sudah terdaftar, lalu menampilkan data anak yang memiliki NIK tersebut. | Wajib |
| FR-12 | Sistem memperingatkan kemungkinan data ganda jika nama anak, tanggal lahir, dan nama ibu sama dengan data yang sudah ada. | Penting |
| FR-13 | Setelah tersimpan, sistem menampilkan dua pilihan: Lanjutkan ke Tahap Pengukuran (anak masuk antrean Meja 2) atau Kembali ke Awal (data tersimpan tanpa membuka kunjungan). | Wajib |

b. Lanjutkan Progres Anak

Tabel 12. Kebutuhan fungsional Tahap 1: Pendaftaran

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-14 | Kader dapat mencari anak dengan nama anak, NIK anak, nama ibu, atau NIK ibu, baik salah satu maupun kombinasinya. | Wajib |
| FR-15 | Hasil pencarian menampilkan nama anak, jenis kelamin, tanggal lahir dan umur, nama ibu, serta tanggal kunjungan terakhir. Kartu hasil berwarna biru untuk laki-laki dan merah muda untuk perempuan. | Wajib |
| FR-16 | Setelah memilih anak, kader dapat menekan Cari Kembali atau Lanjutkan Progres. Lanjutkan Progres membuka kunjungan hari ini dan memasukkan anak ke antrean Meja 2. | Wajib |
| FR-17 | Setelah anak dikirim ke Meja 2, layar Meja 1 kembali ke awal agar kader dapat mendaftarkan anak baru atau melanjutkan progres anak berikutnya. | Wajib |

Kriteria penerimaan:

- Anak yang sudah memiliki kunjungan aktif hari ini tidak dapat dikirim ke antrean untuk kedua kalinya.

- Pencarian dengan sebagian nama, minimal tiga huruf, menampilkan semua anak yang namanya mengandung huruf tersebut.

## 4.4 Tahap 2: Pengukuran (Meja 2)

Meja 2 menerima antrean dari Meja 1 secara otomatis. Kader memilih anak dari antrean lalu mengisi hasil pengukuran hari ini.

Tabel 13. Kebutuhan fungsional Tahap 2: Pengukuran

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-18 | Menampilkan antrean berisi nomor antrean, nama anak, umur, dan warna sesuai jenis kelamin. | Wajib |
| FR-19 | Isian pengukuran terdiri atas BB (kg), PB/TB (cm), LiLA (cm), dan LK (cm). BB dan PB/TB wajib; LiLA dan LK dianjurkan. | Wajib |
| FR-20 | Isian angka menerima koma maupun titik sebagai tanda desimal, misalnya 8,5 atau 8.5. Petunjuk "Boleh pakai koma atau titik" ditampilkan di bawah setiap isian, dan keyboard angka muncul otomatis di ponsel. | Wajib |
| FR-21 | Isian cara ukur (telentang atau berdiri) terisi otomatis sesuai umur: telentang untuk umur di bawah 24 bulan dan berdiri untuk umur 24 bulan ke atas. Kader dapat mengubahnya jika anak diukur dengan cara berbeda. | Wajib |
| FR-22 | Sistem menolak nilai di luar batas wajar (tabel 7.2) dan memberi peringatan, tanpa menolak, jika BB berubah lebih dari 20% atau PB/TB turun lebih dari 1 cm dibanding kunjungan sebelumnya. | Penting |
| FR-23 | Setelah disimpan, anak otomatis masuk antrean Meja 3 dan layar kembali ke daftar antrean Meja 2. | Wajib |

Kriteria penerimaan:

- Nilai 8,5 dan 8.5 tersimpan sebagai angka yang sama, yaitu 8,5 kg.

- Data tidak dapat disimpan selama BB atau PB/TB masih kosong.

## 4.5 Tahap 3: Pendataan (Meja 3)

Meja 3 menampilkan hasil pengukuran agar kader dapat menyalinnya ke Buku KIA. Data pengukuran di meja ini hanya dapat dilihat dan tidak dapat diubah. Satu-satunya isian di Meja 3 adalah status ASI eksklusif.

Tabel 14. Kebutuhan fungsional Tahap 3: Pendataan

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-24 | Menampilkan nama, NIK, umur dalam bulan, BB, PB/TB beserta cara ukur, LiLA, dan LK hasil kunjungan hari ini dalam mode baca saja. | Wajib |
| FR-25 | Menampilkan perbandingan dengan kunjungan sebelumnya: tanggal kunjungan sebelumnya, nilai sebelumnya, dan selisihnya (naik, tetap, atau turun) untuk setiap ukuran. | Wajib |
| FR-26 | Menampilkan status penimbangan N atau T beserta KBM sesuai umur anak (bagian 5.5) untuk disalin ke KMS di Buku KIA. | Wajib |
| FR-27 | Menyediakan isian ASI eksklusif (Ya atau Tidak) untuk anak berumur 0 sampai 6 bulan. Untuk anak di atas 6 bulan, status ASI eksklusif terakhir ditampilkan sebagai informasi. | Wajib |
| FR-28 | Jika data pengukuran keliru, kader dapat memilih Kembalikan ke Pengukuran dengan alasan singkat, sehingga anak masuk kembali ke antrean Meja 2. | Penting |
| FR-29 | Tombol Data Sudah Disalin ke Buku KIA mengirim anak ke antrean Meja 4. | Wajib |

Kriteria penerimaan:

- Tidak ada satu pun nilai pengukuran yang dapat diedit dari layar Meja 3.

- Untuk anak yang baru pertama kali datang, perbandingan memakai data pengukuran dari Buku KIA yang diisi saat pendaftaran, jika ada.

## 4.6 Tahap 4: Pelayanan (Meja 4)

Meja 4 menentukan layanan yang perlu diberikan berdasarkan umur anak dan riwayat layanan sebelumnya. Kader di Meja 4 tetap berada di mejanya untuk melayani anak berikutnya setelah satu anak diteruskan ke Meja 5.

Tabel 15. Kebutuhan fungsional Tahap 4: Pelayanan

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-30 | Menampilkan rekomendasi imunisasi berikutnya berdasarkan imunisasi terakhir yang tercatat dan jadwal imunisasi Buku KIA (bagian 6.1), termasuk imunisasi yang terlambat (kejar). | Wajib |
| FR-31 | Menampilkan satu atau dua riwayat imunisasi terakhir di bagian bawah layar, dengan tautan untuk melihat seluruh riwayat. | Wajib |
| FR-32 | Kader mencatat imunisasi yang diberikan: jenis vaksin, tanggal pemberian (bawaan hari ini), dan nomor batch (opsional). | Wajib |
| FR-33 | Kader mencatat pemberian vitamin A sesuai umur, yaitu kapsul biru untuk 6 sampai 11 bulan dan kapsul merah untuk 12 sampai 59 bulan, beserta tanggalnya. Sistem mengingatkan bahwa vitamin A diberikan pada bulan Februari dan Agustus. | Wajib |
| FR-34 | Kader mencatat pemberian obat cacing untuk anak berumur 12 bulan ke atas beserta tanggalnya. Sistem menampilkan tanggal pemberian terakhir dan mengingatkan bahwa obat cacing diberikan dua kali dalam satu tahun. | Wajib |
| FR-35 | Menyediakan isian Catatan Pelayanan dan Catatan untuk Penyuluhan. Catatan untuk Penyuluhan ditampilkan di Meja 5. | Wajib |
| FR-36 | Setelah disimpan, seluruh layanan masuk ke riwayat anak dan anak otomatis masuk antrean Meja 5. | Wajib |

Kriteria penerimaan:

- Vaksin yang sudah tercatat tidak muncul lagi sebagai rekomendasi untuk dosis yang sama.

- Pilihan vitamin A dan obat cacing tidak ditampilkan untuk anak yang belum mencapai umur minimalnya.

## 4.7 Tahap 5: Penyuluhan (Meja 5)

Meja 5 menampilkan ringkasan lengkap hasil kunjungan untuk memantau pertumbuhan anak dan menjadi dasar penyuluhan kepada orang tua. Seluruh aturan perhitungan dan grafik mengikuti bagian 5.

Tabel 16. Kebutuhan fungsional Tahap 5: Penyuluhan

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-37 | Menampilkan ringkasan kunjungan: identitas anak, umur, BB, PB/TB, LiLA, LK, dan nilai IMT. | Wajib |
| FR-38 | Menampilkan status gizi untuk setiap indeks beserta nilai z-score dan kategorinya, yaitu BB/U, PB/U atau TB/U, BB/PB atau BB/TB, IMT/U, dan LK/U, ditambah kategori LiLA untuk anak 6 sampai 59 bulan. Kategori di luar normal diberi warna peringatan. | Wajib |
| FR-39 | Menampilkan grafik pertumbuhan sesuai jenis kelamin dan kelompok umur anak (bagian 5.2 dan 5.3). Grafik memuat titik pengukuran sebelumnya dan pengukuran hari ini yang dihubungkan garis. | Wajib |
| FR-40 | Menampilkan status N atau T dan KMS anak, serta pesan rujukan sesuai Buku KIA bila berat badan tidak naik (T), berada di bawah garis merah, atau di atas garis oranye. | Wajib |
| FR-41 | Menampilkan seluruh imunisasi, vitamin A, dan obat cacing yang sudah diterima anak, termasuk layanan hari ini, serta imunisasi yang masih harus dikejar. | Wajib |
| FR-42 | Menampilkan hasil deteksi dan prediksi risiko stunting sesuai aturan pada bagian 5.8. | Wajib |
| FR-43 | Menampilkan edukasi Isi Piringku untuk ibu menyusui (bagian 6.3). Edukasi ini muncul otomatis jika anak berumur di bawah 24 bulan dan dapat ditampilkan manual untuk ibu yang masih menyusui. | Wajib |
| FR-44 | Menampilkan rekomendasi materi penyuluhan yang fleksibel sesuai kondisi nyata anak, meliputi kondisi fisik, perkembangan motorik, dan gizi (bagian 6.4). Kader dapat menandai hasil pengamatan kondisi fisik dan motorik, lalu memilih atau menambah materi. | Wajib |
| FR-45 | Menampilkan Catatan untuk Penyuluhan dari Meja 4 dan menyediakan isian Catatan Tindak Lanjut dari kader. Isian ini wajib diisi jika ada status gizi di luar normal, status T, atau risiko stunting. | Wajib |
| FR-46 | Tombol Selesai mengubah status kunjungan menjadi Selesai dan menambah angka Selesai Dilayani di Beranda. | Wajib |

Kriteria penerimaan:

- Grafik anak laki-laki memakai latar dan garis acuan grafik laki-laki, dan grafik anak perempuan memakai acuan perempuan.

- Anak berumur 23 bulan ditampilkan pada grafik 0 sampai 2 tahun, sedangkan anak berumur 25 bulan pada grafik 2 sampai 5 tahun dengan riwayat sebelumnya tetap dapat dilihat.

## 4.8 Penundaan Antrean

Tabel 17. Kebutuhan fungsional Penundaan Antrean

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-47 | Di setiap meja, kader dapat menekan Tunda pada anak yang belum dapat melanjutkan tahap. Anak berpindah ke daftar Ditunda pada meja tersebut dan kader dapat langsung melayani anak berikutnya. | Wajib |
| FR-48 | Kader dapat menekan Lanjutkan pada anak yang ditunda untuk mengembalikannya ke antrean meja yang sama. Data yang sudah diisi sebelum ditunda tetap tersimpan. | Wajib |
| FR-49 | Daftar Ditunda menampilkan lama waktu penundaan agar anak tidak terlupakan. | Penting |

## 4.9 Menu Data Anak

Tabel 18. Kebutuhan fungsional Menu Data Anak

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-50 | Menampilkan daftar seluruh anak dengan pencarian berdasarkan nama atau NIK, serta penyaringan berdasarkan jenis kelamin, kelompok umur, dan dusun. | Wajib |
| FR-51 | Halaman detail anak memuat identitas, data orang tua, alamat, riwayat kunjungan, riwayat pengukuran, grafik pertumbuhan, dan riwayat layanan. | Wajib |
| FR-52 | Kader dapat mengubah data identitas, orang tua, dan alamat anak. Setiap perubahan dicatat di log aktivitas. | Wajib |
| FR-53 | Ketua Kader dapat menghapus data anak setelah konfirmasi dua langkah. Data yang dihapus dapat dipulihkan dalam 30 hari sebelum terhapus permanen. | Wajib |
| FR-54 | Daftar anak, sesuai pencarian dan penyaringan yang aktif, dapat diunduh dalam format CSV. | Wajib |

## 4.10 Menu Rekapitulasi Imunisasi

Tabel 19. Kebutuhan fungsional Menu Rekapitulasi Imunisasi

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-55 | Menampilkan rekap imunisasi per anak dengan kolom per jenis vaksin berisi tanggal pemberian. | Wajib |
| FR-56 | Menyediakan penyaringan berdasarkan periode tanggal, jenis vaksin, dan dusun, serta ringkasan jumlah anak yang menerima setiap vaksin. | Wajib |
| FR-57 | Menandai anak yang imunisasinya terlambat dari jadwal Buku KIA. | Penting |
| FR-58 | Rekap dapat diunduh dalam format CSV. | Wajib |

## 4.11 Menu Data Posyandu

Tabel 20. Kebutuhan fungsional Menu Data Posyandu

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-59 | Menampilkan profil posyandu: nama posyandu, desa atau kelurahan, kecamatan, kabupaten atau kota, puskesmas pembina, alamat, dan jadwal kegiatan. Profil diubah oleh Ketua Kader. | Wajib |
| FR-60 | Menampilkan daftar kader beserta nomor HP dan meja yang biasa dipegang. | Penting |
| FR-61 | Menampilkan rekap kegiatan bulanan SKDN, yaitu S (jumlah balita sasaran), K (balita yang memiliki Buku KIA), D (balita yang ditimbang), dan N (balita yang berat badannya naik), beserta persentase D/S dan N/D. | Wajib |
| FR-62 | Menampilkan jumlah anak per kategori status gizi, jumlah anak berisiko stunting, serta jumlah pemberian imunisasi, vitamin A, dan obat cacing per bulan. | Wajib |
| FR-63 | Seluruh rekap Data Posyandu dapat diunduh dalam format CSV sebagai bahan arsip cetak. | Wajib |

## 4.12 Input Riwayat dari Buku KIA

Banyak anak sudah memiliki riwayat di Buku KIA sebelum aplikasi digunakan. Kader dapat memindahkan riwayat tersebut ke dalam sistem saat ada waktu luang.

Tabel 21. Kebutuhan fungsional Input Riwayat dari Buku KIA

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-64 | Dari halaman detail anak, kader dapat menambahkan riwayat imunisasi lama: jenis vaksin dan tanggal pemberian. | Wajib |
| FR-65 | Kader dapat menambahkan riwayat pengukuran lama: tanggal, BB, PB/TB, LiLA, dan LK, serta riwayat vitamin A dan obat cacing. | Penting |
| FR-66 | Riwayat yang dimasukkan ditandai bersumber dari Buku KIA, ikut dipakai dalam rekomendasi imunisasi, dan ikut tampil di grafik pertumbuhan. | Wajib |

## 4.13 Tema Warna Berdasarkan Jenis Kelamin

Tabel 22. Kebutuhan fungsional Tema Warna Berdasarkan Jenis Kelamin

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-67 | Saat kader membuka atau melanjutkan progres seorang anak, warna utama layar berubah menjadi biru untuk anak laki-laki dan merah muda untuk anak perempuan. | Wajib |
| FR-68 | Warna yang sama dipakai pada kartu antrean, hasil pencarian, dan latar grafik pertumbuhan, mengikuti warna halaman grafik Buku KIA. | Wajib |

# 5. Standar Pertumbuhan Anak Berdasarkan Buku KIA

## 5.1 Sumber dan Cakupan

Grafik dan kategori status gizi diambil dari Buku KIA 2024 bagian Pengukuran oleh Tenaga Kesehatan, yaitu halaman PDF 69 sampai 78 (nomor halaman buku 134 sampai 153). Halaman berwarna biru memuat grafik anak laki-laki dan halaman berwarna merah muda memuat grafik anak perempuan. Grafik KMS dan BB/U 0 sampai 2 tahun untuk anak laki-laki berada tepat sebelum rentang tersebut (halaman buku 131 sampai 133) dan disertakan agar perangkat grafik kedua jenis kelamin lengkap dan setara.

Seluruh grafik memakai garis acuan z-score. Garis 0 (median) berwarna hijau, garis −1 dan +1 berwarna oranye, garis −2 dan +2 berwarna merah, serta garis −3 dan +3 berwarna hitam. Grafik BB/U dan PB/U atau TB/U hanya menampilkan garis −3, −2, 0, +2, dan +3.

## 5.2 Grafik Anak Laki-laki

Tabel 23. Grafik pertumbuhan anak laki-laki (halaman biru)

| No | Grafik | Umur | Sumbu X / Sumbu Y | Hlm. |
|---|---|---|---|---|
| 1 | KMS (Kartu Menuju Sehat) | 0–2 tahun | Umur 0–24 bulan / BB 1–18 kg | 131 |
| 2 | KMS (Kartu Menuju Sehat) | 2–5 tahun | Umur 24–60 bulan / BB 8–28 kg | 132 |
| 3 | Berat Badan menurut Umur | 0–2 tahun | Umur 0–24 bulan / BB 2–17 kg | 133 |
| 4 | Berat Badan menurut Umur | 2–5 tahun | Umur 24–60 bulan / BB 8–28 kg | 134 |
| 5 | Panjang Badan menurut Umur | 0–2 tahun | Umur 0–24 bulan / PB 45–95 cm | 135 |
| 6 | Tinggi Badan menurut Umur | 2–5 tahun | Umur 24–60 bulan / TB 80–125 cm | 136 |
| 7 | Berat Badan menurut Panjang Badan | 0–2 tahun | PB 45–110 cm / BB 2–24 kg | 137 |
| 8 | Berat Badan menurut Tinggi Badan | 2–5 tahun | TB 65–120 cm / BB 6–30 kg | 138 |
| 9 | Indeks Massa Tubuh menurut Umur | 0–2 tahun | Umur 0–24 bulan / IMT 10–22 kg/m² | 139 |
| 10 | Indeks Massa Tubuh menurut Umur | 2–5 tahun | Umur 24–60 bulan / IMT 12–21 kg/m² | 140 |
| 11 | Lingkar Kepala | 0–5 tahun | Umur 0–60 bulan / LK 30–54 cm | 141 |

## 5.3 Grafik Anak Perempuan

Tabel 24. Grafik pertumbuhan anak perempuan (halaman merah muda)

| No | Grafik | Umur | Sumbu X / Sumbu Y | Hlm. |
|---|---|---|---|---|
| 1 | KMS (Kartu Menuju Sehat) | 0–2 tahun | Umur 0–24 bulan / BB 1–18 kg | 143 |
| 2 | KMS (Kartu Menuju Sehat) | 2–5 tahun | Umur 24–60 bulan / BB 8–30 kg | 144 |
| 3 | Berat Badan menurut Umur | 0–2 tahun | Umur 0–24 bulan / BB 2–17 kg | 145 |
| 4 | Berat Badan menurut Umur | 2–5 tahun | Umur 24–60 bulan / BB 7–30 kg | 146 |
| 5 | Panjang Badan menurut Umur | 0–2 tahun | Umur 0–24 bulan / PB 45–95 cm | 147 |
| 6 | Tinggi Badan menurut Umur | 2–5 tahun | Umur 24–60 bulan / TB 80–125 cm | 148 |
| 7 | Berat Badan menurut Panjang Badan | 0–2 tahun | PB 45–110 cm / BB 2–24 kg | 149 |
| 8 | Berat Badan menurut Tinggi Badan | 2–5 tahun | TB 65–120 cm / BB 6–32 kg | 150 |
| 9 | Indeks Massa Tubuh menurut Umur | 0–2 tahun | Umur 0–24 bulan / IMT 10–22 kg/m² | 151 |
| 10 | Indeks Massa Tubuh menurut Umur | 2–5 tahun | Umur 24–60 bulan / IMT 12–21 kg/m² | 152 |
| 11 | Lingkar Kepala | 0–5 tahun | Umur 0–60 bulan / LK 30–54 cm | 153 |

Perbedaan nilai garis acuan antara laki-laki dan perempuan berasal dari tabel standar WHO yang berbeda untuk setiap jenis kelamin. Karena itu sistem wajib memilih tabel acuan berdasarkan jenis kelamin anak dan tidak boleh memakai satu tabel untuk keduanya.

## 5.4 Klasifikasi Status Gizi

Kategori berikut dikutip dari keterangan Permenkes Nomor 2 Tahun 2020 yang tercantum pada setiap grafik Buku KIA, dan berlaku sama untuk anak laki-laki maupun perempuan.

Tabel 25. Kategori status gizi menurut indeks

| Indeks | Ambang z-score | Kategori |
|---|---|---|
| BB/U | < −3 SD | Berat badan sangat kurang (severely underweight) |
|  | −3 SD sampai < −2 SD | Berat badan kurang (underweight) |
|  | −2 SD sampai +1 SD | Berat badan normal |
|  | > +1 SD | Risiko berat badan lebih |
| PB/U atau TB/U | < −3 SD | Sangat pendek (severely stunted) |
|  | −3 SD sampai < −2 SD | Pendek (stunted) |
|  | −2 SD sampai +3 SD | Normal |
|  | > +3 SD | Tinggi |
| BB/PB, BB/TB, dan IMT/U | < −3 SD | Gizi buruk (severely wasted) |
|  | −3 SD sampai < −2 SD | Gizi kurang (wasted) |
|  | −2 SD sampai +1 SD | Gizi baik (normal) |
|  | > +1 SD sampai +2 SD | Berisiko gizi lebih (possible risk of overweight) |
|  | > +2 SD sampai +3 SD | Gizi lebih (overweight) |
|  | > +3 SD | Obesitas (obese) |
| LK/U | > +2 SD | Makrosefali |
|  | −2 SD sampai +2 SD | Normal |
|  | < −2 SD | Mikrosefali |
| LiLA (6–59 bulan) | < 11,5 cm | Gizi buruk |
|  | 11,5–12,4 cm | Gizi kurang |
|  | > 12,4 cm | Gizi baik |

## 5.5 KMS, Kenaikan Berat Badan Minimal, dan Status N/T

KMS di Buku KIA memuat baris umur, bulan penimbangan, BB, KBM, status N/T, dan ASI eksklusif (umur 0 sampai 6 bulan). Nilai KBM yang dipakai sistem mengikuti KMS tersebut dan sama untuk laki-laki dan perempuan.

Tabel 26. Kenaikan Berat Badan Minimal (KBM) menurut umur

| Umur (bulan) | KBM (gram) | Umur (bulan) | KBM (gram) |
|---|---|---|---|
| 1 | 800 | 5 | 500 |
| 2 | 900 | 6–7 | 400 |
| 3 | 800 | 8–11 | 300 |
| 4 | 600 | 12–60 | 200 |

- N (Naik): grafik BB mengikuti garis pertumbuhan, atau kenaikan BB sama dengan KBM atau lebih.

- T (Tidak Naik): grafik BB mendatar atau menurun memotong garis pertumbuhan di bawahnya, atau kenaikan BB kurang dari KBM.

- Status N/T dihitung jika anak memiliki penimbangan pada bulan sebelumnya. Jika bulan sebelumnya tidak ditimbang, status ditampilkan sebagai "Tidak ditimbang bulan lalu" dan tidak dihitung sebagai N maupun T.

- Aturan rujukan Buku KIA: anak dirujuk bila berat badan tidak naik (T), berada di bawah garis merah, atau di atas garis oranye pada KMS.

## 5.6 Aturan Perhitungan

Tabel 27. Aturan perhitungan antropometri

| Aturan | Ketentuan |
|---|---|
| Umur | Dihitung dalam bulan penuh dari tanggal lahir sampai tanggal kunjungan, sesuai sumbu "Umur (bulan penuh)" pada grafik. |
| PB atau TB | Umur di bawah 24 bulan memakai PB (telentang); umur 24 bulan ke atas memakai TB (berdiri). Jika anak di bawah 24 bulan diukur berdiri, hasil ditambah 0,7 cm; jika anak 24 bulan ke atas diukur telentang, hasil dikurangi 0,7 cm. |
| Pemilihan grafik | Umur 0–23 bulan memakai grafik 0–2 tahun; umur 24–60 bulan memakai grafik 2–5 tahun. Grafik LK memakai satu grafik 0–5 tahun. |
| IMT | IMT = BB (kg) dibagi kuadrat PB/TB (m), dibulatkan satu angka di belakang koma. |
| z-score | Dihitung dengan metode LMS standar WHO, Z = ((X / M)^L − 1) / (L × S), memakai nilai L, M, dan S sesuai jenis kelamin dan umur (atau PB/TB untuk indeks BB/PB dan BB/TB). Untuk indeks berbasis berat badan, nilai di luar ±3 SD memakai penyesuaian sesuai metode WHO. |
| Pembulatan | Nilai ukur disimpan satu angka di belakang koma dan z-score ditampilkan dua angka di belakang koma. |
| Data tidak wajar | z-score BB/U di bawah −6 atau di atas +5, PB/U atau TB/U di bawah −6 atau di atas +6, serta BB/PB, BB/TB, dan IMT/U di bawah −5 atau di atas +5 ditandai "perlu ukur ulang". |

## 5.7 Spesifikasi Tampilan Grafik

- Grafik digambar ulang secara digital dengan sumbu dan rentang yang sama seperti tabel 5.2 dan 5.3, bukan berupa gambar pindaian buku.

- Latar grafik berwarna biru muda untuk laki-laki dan merah muda untuk perempuan, dengan warna garis acuan sesuai bagian 5.1.

- Titik pengukuran sebelumnya dan pengukuran hari ini ditampilkan dan dihubungkan garis. Titik hari ini diberi warna lebih tegas.

- Menyentuh sebuah titik menampilkan tanggal, umur, nilai ukur, z-score, dan kategori.

- Keterangan kategori seperti pada kotak "Permenkes no. 2 tahun 2020" di Buku KIA ditampilkan di bawah grafik.

- Di ponsel, grafik dapat digeser dan diperbesar, serta dipilih melalui tab: KMS, BB/U, PB/U atau TB/U, BB/PB atau BB/TB, IMT/U, dan LK/U.

## 5.8 Deteksi dan Prediksi Risiko Stunting

Sistem melakukan skrining, bukan diagnosis. Hasil deteksi ditampilkan di Meja 5 dan di halaman detail anak, selalu disertai anjuran konfirmasi oleh tenaga kesehatan.

Tabel 28. Aturan deteksi dan prediksi stunting

| Hasil | Syarat | Tindakan yang ditampilkan |
|---|---|---|
| Stunting | PB/U atau TB/U < −2 SD (pendek atau sangat pendek) | Rujuk ke puskesmas untuk konfirmasi, catatan tindak lanjut wajib diisi |
| Berisiko stunting | PB/U atau TB/U antara −2 SD dan −1 SD dengan z-score turun pada dua kunjungan berturut-turut, atau status T dua bulan berturut-turut, atau BB/U < −2 SD | Penyuluhan gizi, pantau setiap bulan |
| Prediksi | Dari minimal tiga pengukuran PB/TB dalam 6 bulan terakhir, sistem menghitung tren z-score PB/U atau TB/U secara linear dan memperkirakan nilainya 3 bulan ke depan. Jika perkiraan < −2 SD, anak diberi tanda "diprediksi berisiko stunting bila tren berlanjut". | Penyuluhan dan pemantauan lebih ketat |
| Normal | Tidak memenuhi syarat di atas | Lanjutkan pemantauan rutin |

# 6. Konten Layanan dan Edukasi

## 6.1 Jadwal Imunisasi

Rekomendasi imunisasi di Meja 4 memakai jadwal imunisasi dasar bayi dan baduta pada Buku KIA 2024. Jadwal disimpan sebagai data acuan yang dapat diperbarui tanpa mengubah program.

Tabel 29. Jadwal imunisasi bayi dan baduta

| Umur | Imunisasi |
|---|---|
| 0–24 jam | Hepatitis B (HB0) |
| 1 bulan | BCG, Polio tetes (OPV) 1 |
| 2 bulan | DPT-HB-Hib 1, OPV 2, PCV 1, Rotavirus (RV) 1 |
| 3 bulan | DPT-HB-Hib 2, OPV 3, PCV 2, RV 2 |
| 4 bulan | DPT-HB-Hib 3, OPV 4, Polio suntik (IPV) 1, RV 3 |
| 9 bulan | Campak-Rubela (MR) 1, IPV 2 |
| 10 bulan | Japanese Encephalitis (JE), khusus daerah endemis |
| 12 bulan | PCV 3 |
| 18 bulan | DPT-HB-Hib lanjutan (4), Campak-Rubela (MR) lanjutan (2) |

Imunisasi yang belum diberikan pada umur yang tepat tetap direkomendasikan sebagai imunisasi kejar selama masih dalam batas umur yang diperbolehkan menurut tabel Pelayanan Imunisasi Buku KIA.

## 6.2 Vitamin A dan Obat Cacing

Tabel 30. Jadwal vitamin A dan obat cacing

| Layanan | Umur | Waktu pemberian |
|---|---|---|
| Vitamin A kapsul biru (100.000 IU) | 6–11 bulan | Februari atau Agustus |
| Vitamin A kapsul merah (200.000 IU) | 1–5 tahun | Februari dan Agustus |
| Obat cacing | 1 tahun ke atas | Dua kali dalam satu tahun |

## 6.3 Isi Piringku untuk Ibu Menyusui

Konten edukasi ini menampilkan porsi makan dan minum ibu menyusui untuk kebutuhan sehari sesuai Buku KIA.

Tabel 31. Porsi makan ibu menyusui (0–12 bulan) untuk sehari

| Bahan makanan | Porsi | Contoh satu porsi |
|---|---|---|
| Nasi atau makanan pokok | 6 | 100 g atau ¾ gelas nasi; 125 g atau 3 buah jagung sedang; 210 g atau 2 kentang sedang |
| Protein hewani | 4 | 50 g atau 1 potong sedang ikan; 55 g atau 1 butir telur ayam |
| Protein nabati | 4 | 50 g atau 1 potong sedang tempe; 100 g atau 2 potong sedang tahu |
| Sayur-sayuran | 4 | 100 g atau 1 mangkuk sayur matang tanpa kuah |
| Buah-buahan | 4 | 100 g atau 1 potong sedang pisang; 100–190 g atau 1 potong besar pepaya |
| Minyak atau lemak | 6 | 5 g atau 1 sendok teh |
| Gula | 2 | 10 g atau 1 sendok makan |
| Air putih | – | 14 gelas per hari pada 6 bulan pertama dan 12 gelas per hari pada 6 bulan kedua |

## 6.4 Materi Penyuluhan Fleksibel

Materi penyuluhan dipilih otomatis sesuai hasil kunjungan, lalu dapat diubah atau ditambah oleh kader sesuai kondisi nyata anak.

Tabel 32. Pemetaan kondisi anak ke materi penyuluhan

| Kondisi anak | Materi yang direkomendasikan |
|---|---|
| Umur 0–6 bulan | ASI eksklusif, cara menyusui, serta memerah dan menyimpan ASI |
| Umur 6–24 bulan | MPASI sesuai umur: tekstur, porsi, frekuensi, dan variasi makanan |
| Status T atau berat badan kurang | Pemenuhan gizi, pemberian makanan tambahan, dan anjuran kunjungan ulang |
| Pendek atau berisiko stunting | Pencegahan stunting: protein hewani, sanitasi, dan pemantauan bulanan |
| Gizi lebih atau obesitas | Pola makan seimbang, pembatasan gula dan makanan ringan, serta aktivitas fisik |
| Kondisi fisik yang diamati kader, misalnya sakit, diare, atau demam | Perawatan anak sakit dan tanda bahaya yang perlu dibawa ke fasilitas kesehatan |
| Perkembangan motorik belum sesuai umur | Stimulasi motorik sesuai umur dan anjuran pemeriksaan perkembangan oleh tenaga kesehatan |
| Imunisasi tertunda | Pentingnya imunisasi lengkap dan jadwal imunisasi kejar |

# 7. Kebutuhan Data

## 7.1 Entitas Utama

Tabel 33. Entitas data utama

| Entitas | Isi utama |
|---|---|
| Akun Kader | Nama, nama pengguna, kata sandi terenkripsi, peran (Kader atau Ketua Kader), status aktif |
| Posyandu | Nama, wilayah, puskesmas pembina, alamat, jadwal kegiatan |
| Anak | Identitas anak, data orang tua, alamat, tanggal dibuat dan diubah |
| Kunjungan | Anak, tanggal, meja saat ini, status antrean, nomor antrean, waktu setiap tahap |
| Pengukuran | Kunjungan, BB, PB/TB, cara ukur, LiLA, LK, IMT, z-score setiap indeks, status N/T, sumber data (posyandu atau Buku KIA) |
| Layanan | Kunjungan, jenis layanan (imunisasi, vitamin A, obat cacing), detail, tanggal, nomor batch, sumber data |
| Pendataan | Kunjungan, status ASI eksklusif, konfirmasi sudah disalin ke Buku KIA |
| Penyuluhan | Kunjungan, pengamatan fisik dan motorik, materi yang diberikan, hasil deteksi stunting, catatan tindak lanjut |
| Log Aktivitas | Akun, waktu, tindakan, data yang diubah |

## 7.2 Aturan Validasi Isian

Tabel 34. Batas nilai dan format isian

| Isian | Aturan |
|---|---|
| NIK | Tepat 16 digit angka |
| Nomor HP | 10 sampai 13 digit, diawali 08 atau +62 |
| Tanggal lahir | Tidak setelah hari ini; umur maksimal 60 bulan saat kunjungan dibuka |
| BB | 1,0 sampai 35,0 kg |
| PB/TB | 40,0 sampai 130,0 cm |
| LiLA | 7,0 sampai 25,0 cm |
| LK | 28,0 sampai 60,0 cm |
| Angka desimal | Koma dan titik diterima, disimpan dalam satu format, maksimal satu angka di belakang koma |

## 7.3 Format Ekspor CSV

- Berkas memakai pengodean UTF-8 dengan BOM agar huruf terbaca benar di aplikasi lembar kerja.

- Pemisah kolom memakai titik koma (;) dan tanda desimal memakai koma agar langsung rapi saat dibuka di aplikasi lembar kerja berbahasa Indonesia.

- Tanggal ditulis dengan format DD/MM/YYYY.

- Nama berkas memuat jenis data dan tanggal unduh, misalnya data-anak_03-11-2026.csv.

- NIK ditulis lengkap dan disimpan sebagai teks agar digit tidak berubah.

# 8. Kebutuhan Antarmuka

## 8.1 Daftar Layar

Tabel 35. Daftar layar aplikasi

| Layar | Isi utama |
|---|---|
| Masuk | Nama pengguna, kata sandi, tombol Masuk |
| Pilih Meja | Lima pilihan meja dengan jumlah antrean saat ini |
| Beranda | Tanggal, kartu ringkasan hari ini, antrean per meja, pintasan menu |
| Meja 1 Pendaftaran | Tombol Tambah Anak dan Lanjutkan Progres Anak, formulir, pencarian |
| Meja 2 Pengukuran | Antrean, formulir empat ukuran, daftar Ditunda |
| Meja 3 Pendataan | Antrean, tampilan baca saja dengan perbandingan kunjungan sebelumnya, isian ASI eksklusif |
| Meja 4 Pelayanan | Antrean, rekomendasi imunisasi, isian layanan, riwayat singkat, catatan |
| Meja 5 Penyuluhan | Antrean, ringkasan kunjungan, status gizi, grafik, edukasi, catatan tindak lanjut |
| Data Anak | Pencarian, penyaringan, daftar anak, detail anak, ubah, hapus, unduh CSV |
| Rekapitulasi Imunisasi | Penyaringan, tabel rekap, ringkasan cakupan, unduh CSV |
| Data Posyandu | Profil, daftar kader, rekap SKDN dan status gizi, unduh CSV |
| Pengaturan Akun | Khusus Ketua Kader: daftar akun, tambah, nonaktifkan, atur ulang kata sandi |

## 8.2 Pedoman Tampilan

- Navigasi utama di ponsel berupa menu bawah berisi Beranda, Meja, Data Anak, dan Lainnya; di laptop berupa menu samping.

- Ukuran huruf isian minimal 16 piksel dan area sentuh tombol minimal 44 × 44 piksel.

- Isian wajib ditandai bintang merah dan pesan kesalahan muncul tepat di bawah isian yang bermasalah.

- Status gizi memakai warna dan teks sekaligus: hijau untuk normal, kuning untuk berisiko, dan merah untuk bermasalah, agar tetap terbaca oleh pengguna dengan gangguan penglihatan warna.

- Seluruh teks memakai bahasa Indonesia yang sederhana dan istilah yang sama dengan Buku KIA.

# 9. Kebutuhan Nonfungsional

Tabel 36. Kebutuhan nonfungsional

| Kode | Aspek | Kebutuhan |
|---|---|---|
| NFR-01 | Kinerja | Layar meja terbuka dalam waktu kurang dari 3 detik pada jaringan seluler 4G. |
| NFR-02 | Sinkronisasi | Perubahan antrean tampil di semua perangkat dalam waktu paling lama 3 detik. |
| NFR-03 | Ketahanan jaringan | Jika sinyal terputus, isian yang sedang dikerjakan tetap tersimpan di perangkat dan dikirim otomatis saat sinyal kembali. |
| NFR-04 | Keamanan | Seluruh koneksi memakai HTTPS, kata sandi disimpan dengan hash yang kuat, dan hak akses dibatasi sesuai peran. |
| NFR-05 | Privasi | NIK ditampilkan tersamar di daftar dan hasil pencarian (contoh 3201********0001) dan tampil lengkap hanya di halaman detail. Pengelolaan data mengikuti UU Nomor 27 Tahun 2022. |
| NFR-06 | Jejak audit | Setiap ubah dan hapus data anak tercatat di log aktivitas beserta akun dan waktunya. |
| NFR-07 | Kompatibilitas | Berjalan baik di Chrome Android versi terbaru dan dua versi sebelumnya, Safari iOS, serta Chrome, Edge, dan Firefox di laptop; lebar layar mulai 360 piksel. |
| NFR-08 | Akurasi | Hasil z-score sama dengan tabel WHO dengan selisih paling besar 0,01 pada seluruh kasus uji. |
| NFR-09 | Ketersediaan | Layanan tersedia minimal 99% pada hari kegiatan posyandu. |
| NFR-10 | Cadangan data | Basis data dicadangkan otomatis setiap hari dan cadangan disimpan minimal 30 hari. |
| NFR-11 | Kemudahan | Kader baru dapat menyelesaikan satu kunjungan di setiap meja setelah pelatihan singkat tanpa bantuan. |

# 10. Rencana Rilis

Tabel 37. Pembagian rilis

| Rilis | Cakupan |
|---|---|
| Rilis 1 (inti) | Masuk sistem dan pengaturan akun, Beranda, lima meja beserta antrean dan penundaan, perhitungan status gizi, grafik pertumbuhan, menu Data Anak, Rekapitulasi Imunisasi, dan Data Posyandu dengan ekspor CSV, serta tema warna jenis kelamin. |
| Rilis 2 (penyempurnaan) | Prediksi risiko stunting berbasis tren, penandaan imunisasi terlambat, input riwayat pengukuran lama, ketahanan jaringan saat sinyal terputus, serta penyempurnaan rekap bulanan. |

Sebelum Rilis 1 digunakan di posyandu, aplikasi diuji coba pada satu kegiatan posyandu secara berdampingan dengan pengisian manual Buku KIA untuk membandingkan hasilnya.

# 11. Risiko dan Mitigasi

Tabel 38. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Sinyal internet di lokasi posyandu lemah | Antrean terlambat sinkron | Penyimpanan sementara di perangkat dan pengiriman ulang otomatis (NFR-03) |
| Salah ketik angka desimal | Status gizi keliru | Koma dan titik diterima, batas nilai wajar, dan peringatan perubahan ekstrem |
| Kesalahan perhitungan z-score | Skrining menyesatkan | Memakai tabel resmi WHO dan uji dengan kasus contoh (NFR-08) |
| Kebocoran data pribadi anak dan orang tua | Pelanggaran privasi | Akses hanya untuk kader, NIK tersamar, enkripsi koneksi, dan log aktivitas |
| Kader belum terbiasa dengan aplikasi | Pelayanan melambat pada awal penggunaan | Tampilan sederhana, pelatihan singkat, dan uji coba berdampingan |
| Data ganda untuk anak yang sama | Riwayat terpecah | Validasi NIK unik dan peringatan kemiripan data (FR-11 dan FR-12) |

# 12. Asumsi, Batasan, dan Pertanyaan Terbuka

## 12.1 Asumsi

- Setiap kader yang bertugas memiliki ponsel dengan browser modern dan kuota data.

- Satu instalasi aplikasi melayani satu posyandu.

- Alat ukur di posyandu sudah sesuai standar dan dikalibrasi secara berkala.

## 12.2 Batasan

- Hasil status gizi dan prediksi stunting bersifat skrining dan tidak menggantikan pemeriksaan tenaga kesehatan.

- Aplikasi hanya dipakai oleh kader dan tidak menyediakan akses bagi orang tua.

- Buku KIA tetap diisi dan dibawa orang tua; aplikasi melengkapi, bukan menggantikan Buku KIA.

## 12.3 Pertanyaan Terbuka

Tabel 39. Pertanyaan yang perlu diputuskan

| No | Pertanyaan | Penanggung jawab |
|---|---|---|
| 1 | Nama resmi aplikasi; nama dalam dokumen ini merupakan nama kerja. | Pemilik produk |
| 2 | Siapa yang ditetapkan sebagai Ketua Kader pertama yang membuat akun kader lain. | Pengelola posyandu |
| 3 | Apakah satu aplikasi perlu melayani lebih dari satu posyandu pada masa mendatang. | Pemilik produk |
| 4 | Apakah diperlukan format cetak (PDF) selain CSV untuk laporan ke puskesmas. | Pengelola posyandu |
