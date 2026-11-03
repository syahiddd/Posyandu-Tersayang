<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom pendukung antrean Fase 2:
     * - draf: isian per meja yang tersimpan saat anak ditunda (FR-48).
     * - perlu_ukur_ulang dan alasan_kembali: anak dikembalikan dari Meja 3
     *   ke Meja 2 (FR-28, DESIGN 5.5 langkah 3a).
     */
    public function up(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->json('draf')->nullable()->after('ditunda_pada');
            $table->boolean('perlu_ukur_ulang')->default(false)->after('draf');
            $table->string('alasan_kembali')->nullable()->after('perlu_ukur_ulang');
        });
    }

    public function down(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->dropColumn(['draf', 'perlu_ukur_ulang', 'alasan_kembali']);
        });
    }
};
