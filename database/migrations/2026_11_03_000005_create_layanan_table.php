<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Imunisasi, vitamin A, dan obat cacing (PRD 7.1, FR-32 sampai FR-34).
     * Riwayat dari Buku KIA (FR-64) tidak memiliki kunjungan.
     */
    public function up(): void
    {
        Schema::create('layanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anak_id')->constrained('anak')->cascadeOnDelete();
            $table->foreignId('kunjungan_id')->nullable()
                ->constrained('kunjungan')->cascadeOnDelete();
            $table->enum('jenis', ['imunisasi', 'vitamin_a', 'obat_cacing']);
            $table->string('detail', 100);
            $table->date('tanggal');
            $table->string('nomor_batch', 50)->nullable();
            $table->enum('sumber', ['posyandu', 'buku_kia'])->default('posyandu');
            $table->timestamps();

            $table->index(['anak_id', 'jenis', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('layanan');
    }
};
