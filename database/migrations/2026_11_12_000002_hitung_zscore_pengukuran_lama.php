<?php

use App\Models\Pengukuran;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Mengisi IMT dan z-score pengukuran yang tersimpan sebelum perhitungan
     * otomatis ada (PRD 5.6, 7.1), agar rekap status gizi (FR-62) dan grafik
     * memakai data lama juga. Nilai ukur tidak diubah.
     */
    public function up(): void
    {
        Pengukuran::query()
            ->whereNull('zscore_bb_u')
            ->whereNull('zscore_pb_tb_u')
            ->orderBy('id')
            ->chunkById(200, function ($daftar) {
                foreach ($daftar as $ukur) {
                    $ukur->hitungAntropometri();
                    $ukur->saveQuietly();
                }
            });
    }

    public function down(): void
    {
        // Kolom hasil hitung dibiarkan; nilai ukur asli tidak berubah.
    }
};
