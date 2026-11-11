# Sistem Informasi Posyandu Lima Meja

Aplikasi web untuk kader posyandu balita dengan antrean realtime lima meja. Pendaftaran, pengukuran, pendataan, Data Anak, Rekapitulasi Imunisasi, dan Data Posyandu (SKDN) sudah tersedia. Formulir pelayanan Meja 4 dan penyuluhan Meja 5 masih berupa layar sementara.

Dokumen acuan ada di `docs/`: [PRD](docs/PRD.md) (kebutuhan), [DESIGN](docs/DESIGN.md) (tampilan), [TECHSTACK](docs/TECHSTACK.md) (teknologi). Aturan kerja proyek ada di [CLAUDE.md](CLAUDE.md).

Stack: Laravel 13, Inertia 3 + React 19 + TypeScript, Tailwind 4, Vite+ (`vp`), Fortify, Reverb + Echo (realtime), Pest, MySQL.

## Prasyarat

| Perangkat | Versi                     | Catatan                                                                                                                                  |
| --------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| PHP       | 8.3 ke atas              | Ekstensi `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `xml`, `tokenizer`, `curl`.                                  |
| Composer  | 2.x                       |                                                                                                                                          |
| Node.js   | 22 ke atas                | npm ikut terpasang.                                                                                                                      |
| MySQL     | 8.x                       |                                                                                                                                          |

Di Windows, jalankan perintah dari Terminal Laragon atau pastikan PHP Laragon, Composer, dan Node.js tersedia di `PATH`. PHP harus tetap tersedia saat `npm run build` atau `npm run dev`, karena plugin Wayfinder memanggil `php artisan`.

## Instalasi pertama

1. Pasang dependensi:

    ```bash
    composer install
    ```

    ```bash
    npm ci
    ```

2. Buat berkas lingkungan dan kunci aplikasi:

    ```bash
    cp .env.example .env
    ```

    ```bash
    php artisan key:generate
    ```

3. Siapkan basis data dan akun MySQL lokal (sekali saja, jalankan di klien MySQL sebagai root). `posyandu_testing` dipakai oleh tes otomatis:

    ```sql
    CREATE DATABASE posyandu_tersayang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE posyandu_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'posyandu'@'127.0.0.1' IDENTIFIED BY 'ganti-dengan-sandi-anda';
    GRANT ALL PRIVILEGES ON posyandu_tersayang.* TO 'posyandu'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON posyandu_testing.* TO 'posyandu'@'127.0.0.1';
    ```

4. Lengkapi `.env`:
    - `DB_DATABASE=posyandu_tersayang`, `DB_USERNAME=posyandu`, dan `DB_PASSWORD`: sesuaikan dengan basis data dan akun yang dibuat di langkah sebelumnya. Jika sandi mengandung `#`, apit dengan kutip tunggal, misalnya `DB_PASSWORD='abc#123'`.
    - `SEED_PASSWORD`: kata sandi untuk semua akun contoh (lihat [Akun contoh](#akun-contoh)).
    - `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`: isi dengan string acak, misalnya hasil perintah di bawah (jalankan tiga kali). `VITE_REVERB_APP_KEY` otomatis mengikuti `REVERB_APP_KEY`.

        ```bash
        php -r "echo bin2hex(random_bytes(16)), PHP_EOL;"
        ```

5. Buat tabel dan isi data contoh:

    ```bash
    php artisan migrate --seed
    ```

    Seeder berisi akun, 12 anak fiktif, dan kunjungan hari ini; seeder menolak berjalan bila `APP_ENV=production`. Untuk mengulang dari nol (hanya di DB lokal):

    ```bash
    php artisan migrate:fresh --seed
    ```

## Menjalankan

### Mode pengembangan (disarankan)

```bash
composer dev
```

Perintah ini menjalankan server Laravel (`http://127.0.0.1:8000`), worker antrean, dan Vite dengan hot reload. Reverb tidak ikut berjalan otomatis; jalankan di terminal kedua agar pembaruan antrean realtime aktif:

```bash
php artisan reverb:start
```

Buka http://127.0.0.1:8000 lalu masuk dengan salah satu [akun contoh](#akun-contoh).

### Tanpa Vite dev server

Berguna bila memori terbatas atau hanya ingin mencoba aplikasinya:

```bash
npm run build
```

Lalu jalankan dua proses ini di terminal terpisah:

```bash
php artisan reverb:start
```

```bash
php artisan serve --port=8000
```

Jika halaman masih mencari aset di Vite (layar kosong), hapus berkas `public/hot` yang tertinggal dari `npm run dev`.

### Uji di ponsel pada jaringan yang sama

Jalankan server pada semua antarmuka, lalu buka `http://<IP-laptop>:8000` dari ponsel. Sesuaikan `APP_URL` dan `REVERB_HOST` di `.env` dengan IP laptop agar realtime tersambung.

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## Akun contoh

Semua akun memakai kata sandi dari `SEED_PASSWORD` di `.env`. Setelah masuk, kader memilih meja yang dipegang hari itu.

| Nama pengguna | Peran          | Keterangan                                                               |
| ------------- | -------------- | ------------------------------------------------------------------------ |
| `ketua`       | Ketua Kader    | Dapat mengelola akun, mengubah profil posyandu, dan menghapus data anak. |
| `dewi`        | Kader          | Biasa di Meja 2.                                                         |
| `sitirahma`   | Kader          | Biasa di Meja 1.                                                         |
| `yuni`        | Kader          | Biasa di Meja 4.                                                         |
| `lestari`     | Kader          |                                                                          |
| `rina`        | Kader nonaktif | Tidak dapat masuk (untuk menguji akun nonaktif).                         |

Lima kali gagal masuk berturut-turut mengunci nama pengguna itu selama 15 menit.

## Tes dan pemeriksaan kode

Tes PHP memakai basis data MySQL `posyandu_testing` dengan kredensial yang sama seperti `.env`, serta manifest Vite. Buat basis data tes dan berikan hak akses kepada akun MySQL di atas. Jalankan `npm run build` setelah menambah atau mengganti halaman sebelum menjalankan tes PHP.

| Tujuan                                               | Perintah                                                 |
| ---------------------------------------------------- | -------------------------------------------------------- |
| Tes PHP (Pest)                                       | `php artisan test`                                       |
| Tes TypeScript (Vitest)                              | `npx vp test run`                                        |
| Pemeriksaan tipe TypeScript                          | `npm run types:check`                                    |
| Format dan lint TS/CSS                               | `npm run check` (perbaiki otomatis: `npm run check:fix`) |
| Format PHP                                           | `vendor/bin/pint --test` (perbaiki: `vendor/bin/pint`)   |
| Analisis statis PHP                                  | `vendor/bin/phpstan analyse --memory-limit=1G`           |
| Bangun aset produksi                                 | `npm run build`                                          |
| Buat ulang helper rute TS setelah mengubah `routes/` | `php artisan wayfinder:generate --with-form`             |

## Catatan produksi

- Pakai `APP_ENV=production`, `APP_DEBUG=false`, dan HTTPS (NFR-04). Jangan menjalankan seeder; akun pertama Ketua Kader dibuat manual, lalu akun kader lain dibuat dari menu Pengaturan Akun.
- Jalankan `php artisan reverb:start` dan `php artisan queue:work` sebagai layanan tetap (misalnya Supervisor). Sesuaikan `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`, serta nilai `VITE_REVERB_*` sebelum membangun aset produksi.
- Pasang cron setiap menit untuk tugas terjadwal (penghapusan permanen data anak yang sudah 30 hari di tempat sampah):

    ```
    * * * * * cd /path/ke/aplikasi && php artisan schedule:run >> /dev/null 2>&1
    ```

- Zona waktu aplikasi `Asia/Jakarta` (WIB).

## Struktur singkat

| Lokasi                                                      | Isi                                                                           |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `app/Antrean`                                               | Logika antrean, kunci "sedang dilayani", tunda, siaran realtime               |
| `app/Gizi`, `app/Rekap`, `app/Ekspor`                       | Status N/T dan KBM, Rekap Imunisasi dan SKDN, ekspor CSV                      |
| `app/Http/Controllers`                                      | Controller per layar (Meja, Kunjungan, Data Anak, Rekap, Data Posyandu, Akun) |
| `config/imunisasi.php`, `config/kms.php`                    | Data acuan jadwal imunisasi (PRD Tabel 29–30) dan KBM (Tabel 26)              |
| `resources/js/pages`                                        | Halaman Inertia (React)                                                       |
| `resources/js/components/dasar`                             | Komponen dasar sesuai DESIGN bab 7                                            |
| `resources/js/layouts`                                      | Tata letak aplikasi dan tata letak meja (ponsel, tablet, desktop)             |
| `resources/css/app.css`                                     | Design token (`@theme`); palet bawaan Tailwind dimatikan                      |
| `tests/Feature`, `tests/Unit`, `resources/js/lib/*.test.ts` | Tes Pest dan Vitest                                                           |

## Cakupan yang belum tersedia

- Formulir Meja 4 (Pelayanan) dan Meja 5 (Penyuluhan) belum tersedia; layarnya masih berupa placeholder. Tabel batas umur imunisasi kejar Meja 4 menunggu sumber resmi Buku KIA.
- Z-score, grafik pertumbuhan, serta rekap jumlah per status gizi menunggu tabel standar WHO (L/M/S).
- Penandaan imunisasi terlambat (FR-57), mode offline (NFR-03), dan cadangan otomatis (NFR-10).

## Masalah umum

| Gejala                                                                | Penyebab dan solusi                                                                                                                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build` gagal karena `php` tidak ditemukan                    | PHP belum ada di `PATH` terminal itu (lihat [Prasyarat](#prasyarat)).                                                                    |
| Tes gagal dengan `Unable to locate file in Vite manifest`             | Jalankan `npm run build` lalu ulangi tes.                                                                                                |
| Koneksi DB ditolak padahal sandi benar                                | Sandi berisi `#` tanpa kutip tunggal di `.env`.                                                                                          |
| Node, Vite, atau formatter berhenti karena kehabisan memori (Windows) | Tutup aplikasi berat seperti Chrome atau Android Studio, lalu ulangi.                                                                    |
| `tsc`/`vp` tidak bisa jalan karena modul hilang                       | Pasang ulang dari lockfile: `npm ci`.                                                                                                    |
| Antrean tidak berubah sendiri antar perangkat                         | Pastikan `php artisan reverb:start` berjalan dan nilai `REVERB_*` di `.env` sama dengan yang dipakai saat `npm run build`/`npm run dev`. |
| Gagal masuk berulang kali                                             | Nama pengguna terkunci 15 menit setelah 5 kali gagal; tunggu atau jalankan `php artisan cache:clear` di lokal.                           |
