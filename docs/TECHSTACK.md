<!-- Dikonversi otomatis dari docs/sumber/Teknologi Sistem Informasi Posyandu Lima Meja (Laravel).docx tanpa mengubah isi. Jika berbeda, berkas .docx yang berlaku. -->

# Teknologi Sistem Informasi Posyandu Lima Meja (Laravel)

Nov 3, 2026 · @dijey

Aplikasi dibangun dengan Laravel + Inertia.js + React: Laravel mengurus server, login, database, dan realtime, sedangkan React mengurus tampilan agar syarat offline dan grafik pertumbuhan dari design brief tetap terpenuhi.

## Susunan teknologi

| Bagian | Teknologi | Fungsinya di aplikasi ini |
|---|---|---|
| Framework | Laravel 11 atau yang lebih baru | Routing, validasi, login, dan database. Minimal versi 11 karena butuh Reverb. |
| Penghubung tampilan | Inertia.js | Halaman React dikirim lewat route Laravel biasa, tanpa API terpisah. |
| Frontend | React + TypeScript (starter kit React bawaan Laravel) | Formulir meja, antrean, dan grafik SVG buatan sendiri. |
| Tampilan | Tailwind CSS dengan token dari design brief | Gaya bawaan starter kit diganti dengan warna dan ukuran dari brief. |
| Database | MySQL 8 (atau MariaDB) + Eloquent | Tabel anak, kunjungan, pengukuran, layanan, penyuluhan, dan akun kader. |
| Login | Session auth Laravel (Breeze/Fortify) dengan username | Login tanpa Google; terkunci 15 menit setelah 5 kali gagal (RateLimiter); sesi habis setelah 2 jam (SESSION_LIFETIME=120). |
| Hak akses | Policy dan Gate + kolom role (kader / ketua) | Hanya Ketua Kader yang bisa menghapus anak dan mengelola akun. |
| Realtime antrean | Laravel Reverb + Laravel Echo | Antrean meja berikutnya di ponsel kader lain berubah dalam 3 detik (NFR-02). |
| Hapus dan pulihkan | SoftDeletes + Prunable + scheduler | Data anak yang dihapus bisa dipulihkan 30 hari, lalu terhapus permanen (FR-53). |
| Jejak audit | spatie/laravel-activitylog | Mencatat siapa mengubah atau menghapus data anak dan kapan (NFR-06). |
| Ekspor CSV | response()->streamDownload() + fputcsv, pemisah ; dan BOM UTF-8 | Data Anak, Rekap Imunisasi, dan Data Posyandu langsung rapi di Excel. |
| Z-score | Kelas PertumbuhanService (PHP) + tabel WHO dalam JSON lewat seeder | Status gizi, status N/T, dan deteksi stunting di server. |
| Offline | vite-plugin-pwa + IndexedDB (Dexie) | Isian aman saat sinyal hilang; rumus z-score juga ditulis di TypeScript agar grafik jalan offline. |
| Cadangan data | spatie/laravel-backup | Cadangan harian disimpan 30 hari (NFR-10). |
| Pengujian | Pest, Vitest, Playwright | Kasus uji z-score yang sama dijalankan di Pest dan Vitest supaya hasil PHP dan TypeScript identik. |

## Kenapa bukan Livewire atau Blade saja

Livewire bergantung pada server untuk setiap klik. Saat sinyal di posyandu putus, formulir tidak bisa disimpan, padahal PRD mewajibkan isian tetap aman saat offline. Grafik SVG interaktif dengan zona warna juga jauh lebih mudah dibuat di React.

## Hosting

Reverb harus berjalan terus sebagai proses, jadi butuh VPS (Nginx + PHP-FPM + Supervisor) atau layanan seperti Laravel Forge. Shared hosting biasa tidak bisa menjalankan Reverb; di sana realtime diganti dengan polling setiap 3 detik (TanStack Query refetchInterval). Cara ini tetap memenuhi target 3 detik, tetapi beban server lebih besar.

## Model data utama

| Model | Isi utama |
|---|---|
| User | Akun kader dengan kolom username dan role (kader / ketua) |
| Posyandu | Nama, wilayah, puskesmas pembina, jadwal |
| Anak | Identitas anak, data orang tua, alamat |
| Kunjungan | Tanggal, meja saat ini, status antrean, nomor antrean |
| Pengukuran | BB, PB/TB, cara ukur, LiLA, LK, IMT, z-score, status N/T |
| Layanan | Imunisasi, vitamin A, obat cacing, tanggal, nomor batch |
| Penyuluhan | Materi, hasil deteksi stunting, catatan tindak lanjut |
