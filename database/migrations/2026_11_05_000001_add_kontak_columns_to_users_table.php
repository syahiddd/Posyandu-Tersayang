<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Nomor HP dan meja yang biasa dipegang untuk daftar kader di Data
     * Posyandu (FR-60). Diisi Ketua Kader di Pengaturan Akun (FR-02).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('no_hp', 16)->nullable()->after('username');
            $table->unsignedTinyInteger('meja_biasa')->nullable()->after('no_hp');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['no_hp', 'meja_biasa']);
        });
    }
};
