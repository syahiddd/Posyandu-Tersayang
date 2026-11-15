<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Nomor Kartu Keluarga (No. KK) pada biodata anak. Boleh kosong karena
     * data lama belum tentu memilikinya, dan tidak unik: satu KK dipakai
     * bersama oleh beberapa anak dalam satu keluarga.
     */
    public function up(): void
    {
        Schema::table('anak', function (Blueprint $table) {
            $table->char('no_kk', 16)->nullable()->after('nik');
        });
    }

    public function down(): void
    {
        Schema::table('anak', function (Blueprint $table) {
            $table->dropColumn('no_kk');
        });
    }
};
