<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hasil Meja 5 (PRD 7.1, FR-42, FR-44, FR-45).
     */
    public function up(): void
    {
        Schema::create('penyuluhan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->unique()
                ->constrained('kunjungan')->cascadeOnDelete();
            $table->json('pengamatan_fisik')->nullable();
            $table->json('pengamatan_motorik')->nullable();
            $table->json('materi')->nullable();
            $table->enum('hasil_deteksi_stunting', [
                'normal', 'berisiko_stunting', 'stunting', 'diprediksi_berisiko',
            ])->nullable();
            $table->text('catatan_tindak_lanjut')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penyuluhan');
    }
};
