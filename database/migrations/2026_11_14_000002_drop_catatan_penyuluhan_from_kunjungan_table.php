<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Meja 4 hanya mencatat pelayanan. Pencatatan penyuluhan dihapus, jadi
     * kolom catatan_penyuluhan tidak dipakai lagi.
     */
    public function up(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->dropColumn('catatan_penyuluhan');
        });
    }

    public function down(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->text('catatan_penyuluhan')->nullable()->after('catatan_pelayanan');
        });
    }
};
