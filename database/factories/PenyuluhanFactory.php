<?php

namespace Database\Factories;

use App\Models\Kunjungan;
use App\Models\Penyuluhan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Penyuluhan>
 */
class PenyuluhanFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kunjungan_id' => Kunjungan::factory(),
            'pengamatan_fisik' => null,
            'pengamatan_motorik' => null,
            'materi' => null,
            'hasil_deteksi_stunting' => null,
            'catatan_tindak_lanjut' => null,
        ];
    }
}
