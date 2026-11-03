<?php

namespace Database\Factories;

use App\Enums\JenisLayanan;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Layanan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Catatan layanan contoh. Nama vaksin diambil dari daftar di PRD Tabel 29;
 * factory ini tidak memuat aturan jadwal imunisasi.
 *
 * @extends Factory<Layanan>
 */
class LayananFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'anak_id' => Anak::factory(),
            'kunjungan_id' => null,
            'jenis' => JenisLayanan::Imunisasi,
            'detail' => fake()->randomElement(['BCG', 'OPV 1', 'DPT-HB-Hib 1', 'PCV 1']),
            'tanggal' => today()->toDateString(),
            'nomor_batch' => fake()->optional()->bothify('??####'),
            'sumber' => SumberData::Posyandu,
        ];
    }
}
