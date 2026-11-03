<?php

use App\Enums\Meja;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\MejaController;
use App\Http\Controllers\PilihMejaController;
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

        // Layar Meja 1–5: halaman sementara di Fase 1.
        Route::get('meja/{meja}', MejaController::class)
            ->whereIn('meja', array_map(fn (Meja $meja) => (string) $meja->value, Meja::cases()))
            ->name('meja');

        // S20: menu Lainnya (DESIGN Tabel 11).
        Route::inertia('lainnya', 'lainnya')->name('lainnya');

        // Menu yang dikerjakan pada fase berikutnya (halaman sementara).
        Route::inertia('data-anak', 'halaman-sementara', [
            'judul' => 'Data Anak',
            'rujukan' => 'PRD 4.9 (FR-50 sampai FR-54)',
        ])->name('data-anak');

        Route::inertia('rekap-imunisasi', 'halaman-sementara', [
            'judul' => 'Rekapitulasi Imunisasi',
            'rujukan' => 'PRD 4.10 (FR-55 sampai FR-58)',
        ])->name('rekap-imunisasi');

        Route::inertia('data-posyandu', 'halaman-sementara', [
            'judul' => 'Data Posyandu',
            'rujukan' => 'PRD 4.11 (FR-59 sampai FR-63)',
        ])->name('data-posyandu');

        // Pengaturan Akun khusus Ketua Kader (FR-02).
        Route::inertia('pengaturan-akun', 'halaman-sementara', [
            'judul' => 'Pengaturan Akun',
            'rujukan' => 'PRD 4.1 (FR-02)',
        ])->middleware('can:kelola-akun')->name('pengaturan-akun');
    });
});
