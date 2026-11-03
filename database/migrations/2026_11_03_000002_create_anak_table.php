<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Identitas anak, orang tua, dan alamat (PRD 7.1, Tabel 10).
     * NIK disimpan sebagai teks 16 digit (PRD 7.2, 7.3). SoftDeletes untuk
     * pemulihan 30 hari (FR-53).
     */
    public function up(): void
    {
        Schema::create('anak', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100)->index();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir');
            $table->char('nik', 16)->nullable()->unique();
            $table->string('nama_ibu', 100)->index();
            $table->char('nik_ibu', 16)->nullable()->index();
            $table->string('nama_ayah', 100)->nullable();
            $table->char('nik_ayah', 16)->nullable();
            $table->string('no_hp', 16)->nullable();
            $table->string('alamat');
            $table->unsignedSmallInteger('rt')->nullable();
            $table->unsignedSmallInteger('rw')->nullable();
            $table->string('dusun', 100)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anak');
    }
};
