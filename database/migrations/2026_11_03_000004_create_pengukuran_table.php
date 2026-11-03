<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hasil ukur (PRD 7.1). Riwayat dari Buku KIA (FR-10, FR-65) tidak
     * memiliki kunjungan, sehingga kunjungan_id boleh kosong.
     * Nilai ukur satu desimal, z-score dua desimal (PRD 5.6).
     */
    public function up(): void
    {
        Schema::create('pengukuran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anak_id')->constrained('anak')->cascadeOnDelete();
            $table->foreignId('kunjungan_id')->nullable()->unique()
                ->constrained('kunjungan')->cascadeOnDelete();
            $table->date('tanggal_ukur');
            $table->enum('sumber', ['posyandu', 'buku_kia'])->default('posyandu');

            $table->decimal('bb', 4, 1)->nullable();
            $table->decimal('pb_tb', 4, 1)->nullable();
            $table->enum('cara_ukur', ['telentang', 'berdiri'])->nullable();
            $table->decimal('lila', 4, 1)->nullable();
            $table->decimal('lk', 4, 1)->nullable();
            $table->decimal('imt', 4, 1)->nullable();

            $table->decimal('zscore_bb_u', 5, 2)->nullable();
            $table->decimal('zscore_pb_tb_u', 5, 2)->nullable();
            $table->decimal('zscore_bb_pb_tb', 5, 2)->nullable();
            $table->decimal('zscore_imt_u', 5, 2)->nullable();
            $table->decimal('zscore_lk_u', 5, 2)->nullable();
            $table->enum('status_nt', ['N', 'T', 'tidak_ditimbang'])->nullable();

            $table->timestamps();

            $table->index(['anak_id', 'tanggal_ukur']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengukuran');
    }
};
