<?php

namespace Database\Factories;

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Anak;
use App\Models\Kunjungan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Bawaan: kunjungan hari ini yang baru dibuka Meja 1 dan menunggu di Meja 2
 * (FR-13, FR-16).
 *
 * @extends Factory<Kunjungan>
 */
class KunjunganFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'anak_id' => Anak::factory(),
            'tanggal' => today()->toDateString(),
            'nomor_antrean' => fake()->unique()->numberBetween(1, 999),
            'meja_saat_ini' => Meja::Pengukuran,
            'status' => StatusAntrean::Menunggu,
            'masuk_meja_pada' => now(),
            'selesai_meja_1_pada' => now(),
        ];
    }

    /**
     * Anak berada di meja tertentu; semua meja sebelumnya sudah selesai.
     */
    public function diMeja(Meja $meja, StatusAntrean $status = StatusAntrean::Menunggu): static
    {
        return $this->state(function () use ($meja, $status) {
            $atribut = [
                'meja_saat_ini' => $meja,
                'status' => $status,
                'ditunda_pada' => $status === StatusAntrean::Ditunda ? now() : null,
            ];

            foreach (Meja::cases() as $sebelumnya) {
                $atribut["selesai_meja_{$sebelumnya->value}_pada"] =
                    $sebelumnya->value < $meja->value ? now() : null;
            }

            return $atribut;
        });
    }

    /** Kunjungan sudah menyelesaikan Meja 5 (PRD 3.2). */
    public function selesai(): static
    {
        return $this->diMeja(Meja::Penyuluhan, StatusAntrean::Selesai)
            ->state(fn () => ['selesai_meja_5_pada' => now()]);
    }
}
