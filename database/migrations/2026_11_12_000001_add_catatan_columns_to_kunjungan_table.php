<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catatan Meja 4 (FR-35): Catatan Pelayanan dan Catatan untuk
     * Penyuluhan; yang kedua ditampilkan di Meja 5 (FR-45).
     */
    public function up(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->text('catatan_pelayanan')->nullable()->after('alasan_kembali');
            $table->text('catatan_penyuluhan')->nullable()->after('catatan_pelayanan');
        });
    }

    public function down(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->dropColumn(['catatan_pelayanan', 'catatan_penyuluhan']);
        });
    }
};
