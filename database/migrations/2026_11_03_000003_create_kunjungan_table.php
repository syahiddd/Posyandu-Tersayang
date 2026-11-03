<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kunjungan dan antrean meja (PRD 3.2, 3.3, 7.1).
     */
    public function up(): void
    {
        Schema::create('kunjungan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anak_id')->constrained('anak')->cascadeOnDelete();
            $table->date('tanggal');
            $table->unsignedSmallInteger('nomor_antrean');
            $table->unsignedTinyInteger('meja_saat_ini')->default(1);
            $table->enum('status', ['menunggu', 'sedang_dilayani', 'ditunda', 'selesai'])
                ->default('menunggu');

            // Satu anak hanya dibuka satu kader pada saat yang sama (PRD 3.3).
            $table->foreignId('dibuka_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dibuka_pada')->nullable();

            // Urutan antrean mengikuti waktu masuk ke meja (PRD 3.3).
            $table->timestamp('masuk_meja_pada')->useCurrent();
            // Lama penundaan (FR-49).
            $table->timestamp('ditunda_pada')->nullable();

            // Waktu setiap tahap (PRD 7.1).
            $table->timestamp('selesai_meja_1_pada')->nullable();
            $table->timestamp('selesai_meja_2_pada')->nullable();
            $table->timestamp('selesai_meja_3_pada')->nullable();
            $table->timestamp('selesai_meja_4_pada')->nullable();
            $table->timestamp('selesai_meja_5_pada')->nullable();

            $table->timestamps();

            // Satu kunjungan per anak per tanggal (PRD 3.3, FR-17).
            $table->unique(['anak_id', 'tanggal']);
            $table->unique(['tanggal', 'nomor_antrean']);
            $table->index(['tanggal', 'meja_saat_ini', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kunjungan');
    }
};
