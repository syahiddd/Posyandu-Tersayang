<?php

use Illuminate\Support\Facades\Route;

// Halaman pertama adalah halaman masuk (FR-01); tamu tidak dapat membuka
// halaman lain (PRD 4.1, kriteria penerimaan).
Route::get('/', fn () => redirect()->route(auth()->check() ? 'dashboard' : 'login'))
    ->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
