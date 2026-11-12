<?php

use App\Enums\Meja;
use App\Http\Controllers\AkunController;
use App\Http\Controllers\AntreanController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\DataAnakController;
use App\Http\Controllers\DataPosyanduController;
use App\Http\Controllers\GantiSandiController;
use App\Http\Controllers\KunjunganController;
use App\Http\Controllers\Meja1Controller;
use App\Http\Controllers\MejaController;
use App\Http\Controllers\PelayananController;
use App\Http\Controllers\PendataanController;
use App\Http\Controllers\PengukuranController;
use App\Http\Controllers\PilihMejaController;
use App\Http\Controllers\RekapImunisasiController;
use App\Http\Controllers\RiwayatBukuKiaController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

// Halaman pertama adalah halaman masuk (FR-01); tamu tidak dapat membuka
// halaman lain (PRD 4.1, kriteria penerimaan).
Route::get('/', fn () => redirect()->route(auth()->check() ? 'beranda' : 'login'))
    ->name('home');

// Masuk dan keluar (FR-01, FR-05). Tanpa daftar, lupa sandi, dan 2FA.
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    // S02: pilih meja setelah masuk (FR-03).
    Route::get('pilih-meja', [PilihMejaController::class, 'edit'])->name('pilih-meja');
    Route::put('pilih-meja', [PilihMejaController::class, 'update'])->name('pilih-meja.update');

    Route::middleware('meja.dipilih')->group(function () {
        // S03: Beranda (FR-06 sampai FR-08).
        Route::get('beranda', BerandaController::class)->name('beranda');

        // Layar meja: Meja 1 pencarian, Meja 2–5 antrean.
        Route::get('meja/{meja}', MejaController::class)
            ->whereIn('meja', array_map(fn (Meja $meja) => (string) $meja->value, Meja::cases()))
            ->name('meja');

        // Meja 1 Pendaftaran (PRD 4.3, FR-10 sampai FR-17).
        Route::get('meja/1/anak-baru', [Meja1Controller::class, 'create'])->name('meja1.anak-baru');
        Route::post('meja/1/anak', [Meja1Controller::class, 'store'])->name('meja1.simpan');
        Route::get('meja/1/anak/{anak}', [Meja1Controller::class, 'tersimpan'])->name('meja1.anak');
        Route::post('meja/1/anak/{anak}/kirim', [Meja1Controller::class, 'kirim'])->name('meja1.kirim');

        // Antrean dan layar kerja per anak (PRD 3.2–3.3, FR-47 sampai FR-49).
        Route::get('kunjungan/{kunjungan}', [KunjunganController::class, 'layar'])->name('kunjungan.layar');
        Route::post('kunjungan/{kunjungan}/buka', [AntreanController::class, 'buka'])->name('kunjungan.buka');
        Route::post('kunjungan/{kunjungan}/lepas', [AntreanController::class, 'lepas'])->name('kunjungan.lepas');
        Route::post('kunjungan/{kunjungan}/tunda', [AntreanController::class, 'tunda'])->name('kunjungan.tunda');
        Route::post('kunjungan/{kunjungan}/lanjutkan', [AntreanController::class, 'lanjutkan'])->name('kunjungan.lanjutkan');
        Route::post('antrean/urungkan', [AntreanController::class, 'urungkan'])->name('antrean.urungkan');

        // Meja 2 Pengukuran (PRD 4.4, FR-18 sampai FR-23).
        Route::put('kunjungan/{kunjungan}/pengukuran', [PengukuranController::class, 'update'])->name('kunjungan.pengukuran');

        // Meja 3 Pendataan (PRD 4.5, FR-24 sampai FR-29); nilai ukur tidak dapat diubah di sini.
        Route::post('kunjungan/{kunjungan}/pendataan', [PendataanController::class, 'simpan'])->name('kunjungan.pendataan');
        Route::post('kunjungan/{kunjungan}/kembalikan', [PendataanController::class, 'kembalikan'])->name('kunjungan.kembalikan');

        // Meja 4 Pelayanan (PRD 4.6, FR-30 sampai FR-36).
        Route::post('kunjungan/{kunjungan}/pelayanan', [PelayananController::class, 'simpan'])->name('kunjungan.pelayanan');

        // S20: menu Lainnya (DESIGN Tabel 11).
        Route::inertia('lainnya', 'lainnya')->name('lainnya');

        // S14–S16 Data Anak (PRD 4.9, FR-50 sampai FR-54).
        Route::get('data-anak', [DataAnakController::class, 'index'])->name('data-anak');
        Route::get('data-anak/unduh', [DataAnakController::class, 'unduh'])->name('data-anak.unduh');
        Route::get('data-anak/terhapus', [DataAnakController::class, 'terhapus'])->name('data-anak.terhapus');
        Route::whereNumber('anak')->group(function () {
            Route::get('data-anak/{anak}', [DataAnakController::class, 'show'])->name('data-anak.detail');
            Route::get('data-anak/{anak}/ubah', [DataAnakController::class, 'edit'])->name('data-anak.ubah');
            Route::put('data-anak/{anak}', [DataAnakController::class, 'update'])->name('data-anak.perbarui');
            // Hapus dan pulihkan khusus Ketua Kader (FR-53, AnakPolicy).
            Route::delete('data-anak/{anak}', [DataAnakController::class, 'destroy'])->name('data-anak.hapus');
            Route::post('data-anak/{anak}/pulihkan', [DataAnakController::class, 'pulihkan'])
                ->withTrashed()
                ->name('data-anak.pulihkan');

            // S17 Tambah Riwayat dari Buku KIA (PRD 4.12, FR-64 sampai FR-66).
            Route::get('data-anak/{anak}/riwayat-buku-kia', [RiwayatBukuKiaController::class, 'create'])->name('riwayat-buku-kia');
            Route::post('data-anak/{anak}/riwayat-buku-kia', [RiwayatBukuKiaController::class, 'store'])->name('riwayat-buku-kia.simpan');
        });
        Route::post('data-anak/riwayat-buku-kia/urungkan', [RiwayatBukuKiaController::class, 'urungkan'])->name('riwayat-buku-kia.urungkan');

        // S19 Data Posyandu: profil, kader, rekap SKDN dan layanan, CSV (PRD 4.11, FR-59 sampai FR-63).
        Route::get('data-posyandu', [DataPosyanduController::class, 'index'])->name('data-posyandu');
        Route::get('data-posyandu/unduh', [DataPosyanduController::class, 'unduh'])->name('data-posyandu.unduh');
        Route::get('data-posyandu/ubah', [DataPosyanduController::class, 'edit'])->name('data-posyandu.ubah');
        Route::put('data-posyandu', [DataPosyanduController::class, 'update'])->name('data-posyandu.perbarui');

        // S18 Rekapitulasi Imunisasi (PRD 4.10, FR-55, FR-56, FR-58).
        Route::get('rekap-imunisasi', [RekapImunisasiController::class, 'index'])->name('rekap-imunisasi');
        Route::get('rekap-imunisasi/unduh', [RekapImunisasiController::class, 'unduh'])->name('rekap-imunisasi.unduh');

        // Kader mengganti kata sandinya sendiri.
        Route::get('ganti-sandi', [GantiSandiController::class, 'edit'])->name('ganti-sandi');
        Route::put('ganti-sandi', [GantiSandiController::class, 'update'])->name('ganti-sandi.update');

        // S21 Pengaturan Akun khusus Ketua Kader (FR-02, FR-60).
        Route::middleware('can:kelola-akun')->group(function () {
            Route::get('pengaturan-akun', [AkunController::class, 'index'])->name('pengaturan-akun');
            Route::get('pengaturan-akun/tambah', [AkunController::class, 'create'])->name('akun.tambah');
            Route::post('pengaturan-akun', [AkunController::class, 'store'])->name('akun.simpan');
            Route::get('pengaturan-akun/{user}/ubah', [AkunController::class, 'edit'])->name('akun.ubah');
            Route::put('pengaturan-akun/{user}', [AkunController::class, 'update'])->name('akun.perbarui');
            Route::put('pengaturan-akun/{user}/status', [AkunController::class, 'status'])->name('akun.status');
            Route::post('pengaturan-akun/{user}/atur-ulang-sandi', [AkunController::class, 'aturUlangSandi'])->name('akun.atur-ulang-sandi');
        });
    });
});
