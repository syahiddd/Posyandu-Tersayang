<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hasil Meja 3 (PRD 7.1, FR-27, FR-29).
     */
    public function up(): void
    {
        Schema::create('pendataan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->unique()
                ->constrained('kunjungan')->cascadeOnDelete();
            $table->boolean('asi_eksklusif')->nullable();
            $table->timestamp('disalin_ke_kia_pada')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendataan');
    }
};
