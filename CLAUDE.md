# Sistem Informasi Posyandu Lima Meja — aturan wajib

Sumber kebenaran: `docs/PRD.md` (apa yang dibangun), `docs/DESIGN.md` (tampilan, mockup di `docs/img/`), `docs/TECHSTACK.md` (teknologi). Baca bagian yang relevan sebelum mengerjakan fitur; jangan mengarang kebutuhan di luar dokumen. Jika .md berbeda dari `docs/sumber/*.docx`, .docx yang berlaku.

- Jika dokumen bertentangan: aturan bisnis/perhitungan/validasi → PRD; tampilan/warna/ukuran → DESIGN (mis. target sentuh 48 px); implementasi teknis → TECHSTACK. Masih ambigu → berhenti dan tanya pemilik produk.
- Jangan mengubah isi `docs/` tanpa persetujuan; laporkan kesalahan dokumen.
- Jangan mengarang data klinis (tabel WHO L/M/S, KBM, jadwal imunisasi); minta file sumber resmi.
- Rujuk kode kebutuhan di commit dan komentar: `feat(auth): ... (FR-01, FR-04)`, `NFR-xx`. Commit kecil per langkah.
- Commit tanpa trailer `Co-Authored-By` atau atribusi Claude/AI apa pun; jangan push tanpa diminta.
- Dependensi baru hanya bila fiturnya sedang dikerjakan dan tercantum di TECHSTACK.
- UI: hanya token `@theme` di `resources/css/app.css` (palet bawaan Tailwind dimatikan); satu tombol utama per layar; target sentuh ≥ 48 px, kontrol 52 px; label di atas isian.
- Dilarang (DESIGN 2.3): gradien, bayangan tebal, emoji, ilustrasi dekoratif, mode gelap, menu hamburger, ikon tanpa label, teks abu-abu tipis, carousel.
- Bahasa antarmuka: Indonesia sederhana dengan istilah Buku KIA; `<html lang="id">`.
- Jangan menjalankan perintah destruktif (`migrate:fresh` selain DB lokal, `rm -rf`, force push) dan jangan commit `.env`.

Perintah (PHP dari php.new di `%USERPROFILE%\.config\herd-lite\bin`):

- Dev: `composer dev` · Build: `npm run build` · Tes PHP: `php artisan test` · Tes TS: `npx vp test run`
- Lint/typecheck: `npx tsc --noEmit`, `npm run check`, `vendor/bin/pint --test`
- DB lokal: `php artisan migrate:fresh --seed` (DB `posyandu`; tes memakai `posyandu_testing`)
