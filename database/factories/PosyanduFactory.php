<?php

namespace Database\Factories;

use App\Models\Posyandu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Posyandu>
 */
class PosyanduFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => 'Posyandu '.fake()->randomElement(['Melati', 'Mawar', 'Kenanga', 'Anggrek']),
            'desa_kelurahan' => 'Desa '.fake()->lastName(),
            'kecamatan' => 'Kecamatan '.fake()->lastName(),
            'kabupaten_kota' => fake()->city(),
            'puskesmas_pembina' => 'Puskesmas '.fake()->lastName(),
            'alamat' => fake()->streetAddress(),
            'jadwal_kegiatan' => 'Setiap tanggal '.fake()->numberBetween(1, 28),
        ];
    }
}
