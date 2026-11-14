<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ganti nama Posyandu contoh "Posyandu Melati" menjadi "Posyandu
     * Tersayang". Hanya nilai contoh yang ikut berganti; nama yang sudah
     * diubah kader lewat Data Posyandu dibiarkan apa adanya.
     */
    public function up(): void
    {
        DB::table('posyandu')
            ->where('nama', 'Posyandu Melati')
            ->update(['nama' => 'Posyandu Tersayang']);
    }

    public function down(): void
    {
        DB::table('posyandu')
            ->where('nama', 'Posyandu Tersayang')
            ->update(['nama' => 'Posyandu Melati']);
    }
};
