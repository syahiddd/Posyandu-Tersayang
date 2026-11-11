# Sistem Informasi Posyandu Lima Meja

Aplikasi web untuk kader posyandu balita: alur lima meja (pendaftaran, pengukuran, pendataan, pelayanan, penyuluhan) dengan antrean realtime, Data Anak, Rekapitulasi Imunisasi, dan Data Posyandu (SKDN) beserta ekspor CSV.

Dokumen acuan ada di `docs/`: [PRD](docs/PRD.md) (kebutuhan), [DESIGN](docs/DESIGN.md) (tampilan), [TECHSTACK](docs/TECHSTACK.md) (teknologi). Aturan kerja proyek ada di [CLAUDE.md](CLAUDE.md).

Stack: Laravel 13, Inertia 3 + React 19 + TypeScript, Tailwind 4, Vite+ (`vp`), Fortify, Reverb + Echo (realtime), Pest, MySQL.

## Prasyarat

| Perangkat | Versi                     | Catatan                                                                                                                                  |
| --------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| PHP       | 8.3 ke atas (dipakai 8.5) | Ekstensi `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `xml`, `tokenizer`, `curl`. Di Windows bisa memakai [php.new](https://php.new). |
| Composer  | 2.x                       |                                                                                                                                          |
| Node.js   | 22 ke atas (dipakai 24)   | npm ikut terpasang.                                                                                                                      |
| MySQL     | 8.x (dipakai 8.4)         |                                                                                                                                          |

PHP harus ada di `PATH` juga saat `npm run build`/`npm run dev`, karena plugin Wayfinder memanggil `php artisan`. Pengguna php.new di Windows (Git Bash):

```bash
export PATH="$HOME/.config/herd-lite/bin:$PATH"
```

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

3. Siapkan basis data (sekali saja, di klien MySQL sebagai root). `posyandu_testing` dipakai oleh tes otomatis:

    ```sql
    CREATE DATABASE posyandu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE posyandu_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'posyandu'@'localhost' IDENTIFIED BY 'ganti-dengan-sandi-anda';
    GRANT ALL PRIVILEGES ON posyandu.* TO 'posyandu'@'localhost';
    GRANT ALL PRIVILEGES ON posyandu_testing.* TO 'posyandu'@'localhost';
    ```

4. Lengkapi `.env`:
    - `DB_PASSWORD`: sandi pengguna MySQL di atas. Jika sandi mengandung `#`, apit dengan kutip tunggal, misalnya `DB_PASSWORD='abc#123'`.
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

Perintah ini menjalankan empat proses sekaligus: `php artisan serve` (http://localhost:8000), `php artisan reverb:start` (WebSocket port 8080), `php artisan queue:listen`, dan `npm run dev` (Vite dengan hot reload). Buka http://localhost:8000 lalu masuk dengan salah satu [akun contoh](#akun-contoh).

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

Tes PHP memakai basis data `posyandu_testing` dan manifest Vite, jadi jalankan `npm run build` dulu setelah menambah atau mengganti halaman.

| Tujuan                                               | Perintah                                                 |
| ---------------------------------------------------- | -------------------------------------------------------- |
| Tes PHP (Pest)                                       | `php artisan test`                                       |
| Tes TypeScript (Vitest)                              | `npx vp test run`                                        |
| Pemeriksaan tipe TypeScript                          | `npx tsc --noEmit`                                       |
| Format dan lint TS/CSS                               | `npm run check` (perbaiki otomatis: `npm run check:fix`) |
| Format PHP                                           | `vendor/bin/pint --test` (perbaiki: `vendor/bin/pint`)   |
| Analisis statis PHP                                  | `vendor/bin/phpstan analyse --memory-limit=1G`           |
| Bangun aset produksi                                 | `npm run build`                                          |
| Buat ulang helper rute TS setelah mengubah `routes/` | `php artisan wayfinder:generate --with-form`             |

## Catatan produksi

- Pakai `APP_ENV=production`, `APP_DEBUG=false`, dan HTTPS (NFR-04). Jangan menjalankan seeder; akun pertama Ketua Kader dibuat manual, lalu akun kader lain dibuat dari menu Pengaturan Akun.
- Jalankan `php artisan reverb:start` sebagai layanan tetap (misalnya Supervisor) dan sesuaikan `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` dengan domain publik.
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

## Belum tersedia

- Meja 4 (Pelayanan): menunggu tabel batas umur imunisasi kejar dari Buku KIA.
- Meja 5 (Penyuluhan), z-score, grafik pertumbuhan, dan jumlah per status gizi: menunggu tabel standar WHO (L/M/S).
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
