<?php

namespace Database\Factories;

use App\Enums\JenisKelamin;
use App\Models\Anak;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Data anak fiktif. NIK berupa 16 digit acak, bukan NIK asli.
 *
 * @extends Factory<Anak>
 */
class AnakFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jenisKelamin = fake()->randomElement(JenisKelamin::cases());

        return [
            'nama' => fake()->firstName($jenisKelamin === JenisKelamin::LakiLaki ? 'male' : 'female')
                .' '.fake()->lastName(),
            'jenis_kelamin' => $jenisKelamin,
            'tempat_lahir' => fake()->optional()->city(),
            // Umur balita 0–59 bulan (PRD 7.2).
            'tanggal_lahir' => fake()->dateTimeBetween('-59 months', '-1 week')->format('Y-m-d'),
            'nik' => fake()->optional(0.7)->numerify('################'),
            'punya_buku_kia' => fake()->boolean(90),
            'nama_ibu' => fake()->name('female'),
            'nik_ibu' => fake()->optional(0.7)->numerify('################'),
            'nama_ayah' => fake()->optional()->name('male'),
            'nik_ayah' => fake()->optional(0.5)->numerify('################'),
            'no_hp' => fake()->optional()->numerify('08##########'),
            'alamat' => fake()->streetAddress(),
            'rt' => fake()->numberBetween(1, 15),
            'rw' => fake()->numberBetween(1, 8),
            'dusun' => 'Dusun '.fake()->randomElement(['Melati', 'Mawar', 'Kenanga', 'Anggrek']),
        ];
    }

    public function lakiLaki(): static
    {
        return $this->state(fn () => [
            'jenis_kelamin' => JenisKelamin::LakiLaki,
            'nama' => fake()->firstName('male').' '.fake()->lastName(),
        ]);
    }

    public function perempuan(): static
    {
        return $this->state(fn () => [
            'jenis_kelamin' => JenisKelamin::Perempuan,
            'nama' => fake()->firstName('female').' '.fake()->lastName(),
        ]);
    }
}
