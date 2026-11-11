<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kepemilikan Buku KIA untuk huruf K pada rekap SKDN (FR-61). Data lama
     * bernilai null (belum diisi) dan tidak dihitung sebagai K.
     */
    public function up(): void
    {
        Schema::table('anak', function (Blueprint $table) {
            $table->boolean('punya_buku_kia')->nullable()->after('nik');
        });
    }

    public function down(): void
    {
        Schema::table('anak', function (Blueprint $table) {
            $table->dropColumn('punya_buku_kia');
        });
    }
};
