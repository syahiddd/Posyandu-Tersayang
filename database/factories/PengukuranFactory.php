<?php

namespace Database\Factories;

use App\Enums\CaraUkur;
use App\Enums\SumberData;
use App\Models\Anak;
use App\Models\Pengukuran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Nilai acak di dalam batas isian PRD 7.2; bukan data acuan klinis.
 * z-score dan status N/T dibiarkan kosong (belum dihitung di Fase 1).
 *
 * @extends Factory<Pengukuran>
 */
class PengukuranFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'anak_id' => Anak::factory(),
            'kunjungan_id' => null,
            'tanggal_ukur' => today()->toDateString(),
            'sumber' => SumberData::Posyandu,
            'bb' => fake()->randomFloat(1, 3, 20),
            'pb_tb' => fake()->randomFloat(1, 50, 110),
            'cara_ukur' => fake()->randomElement(CaraUkur::cases()),
            'lila' => fake()->randomFloat(1, 11, 17),
            'lk' => fake()->randomFloat(1, 35, 50),
        ];
    }

    /** Riwayat yang disalin dari Buku KIA (FR-10, FR-65, FR-66). */
    public function dariBukuKia(): static
    {
        return $this->state(fn () => [
            'sumber' => SumberData::BukuKia,
            'kunjungan_id' => null,
            'tanggal_ukur' => fake()->dateTimeBetween('-6 months', '-1 month')->format('Y-m-d'),
        ]);
    }
}
