<?php

namespace Database\Factories;

use App\Models\Kunjungan;
use App\Models\Pendataan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pendataan>
 */
class PendataanFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kunjungan_id' => Kunjungan::factory(),
            'asi_eksklusif' => null,
            'disalin_ke_kia_pada' => null,
        ];
    }
}
