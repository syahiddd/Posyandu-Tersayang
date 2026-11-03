<?php

namespace App\Http\Requests;

/**
 * Batas nilai ukur dan format desimal (PRD 7.2, FR-20, FR-22): koma dan
 * titik diterima, disimpan satu format, maksimal satu angka di belakang
 * koma. Dipakai formulir Tambah Anak (ukuran Buku KIA) dan Meja 2.
 */
trait BatasUkur
{
    /** @var array<string, array{0: float, 1: float, 2: string}> */
    protected static array $batasUkur = [
        'bb' => [1.0, 35.0, 'kg'],
        'pb_tb' => [40.0, 130.0, 'cm'],
        'lila' => [7.0, 25.0, 'cm'],
        'lk' => [28.0, 60.0, 'cm'],
    ];

    /**
     * Mengganti koma dengan titik sebelum validasi.
     *
     * @param  list<string>  $kolom
     */
    protected function normalkanDesimal(array $kolom): void
    {
        $ganti = [];

        foreach ($kolom as $nama) {
            $nilai = $this->input($nama);

            if (is_string($nilai)) {
                $nilai = str_replace(',', '.', trim($nilai));
                $ganti[$nama] = $nilai === '' ? null : $nilai;
            }
        }

        $this->merge($ganti);
    }

    /**
     * @return list<string>
     */
    protected function aturanUkur(string $jenis, bool $wajib = false): array
    {
        [$min, $maks] = self::$batasUkur[$jenis];

        return [
            $wajib ? 'required' : 'nullable',
            'regex:/^\d+(\.\d)?$/',
            'numeric',
            "between:{$min},{$maks}",
        ];
    }

    /**
     * Pesan batas dengan koma desimal, misalnya "Isi antara 40,0 dan 130,0 cm."
     *
     * @return array<string, string>
     */
    protected function pesanUkur(string $kolom, string $jenis): array
    {
        [$min, $maks, $satuan] = self::$batasUkur[$jenis];
        $teks = fn (float $angka) => number_format($angka, 1, ',', '');

        return [
            "{$kolom}.between" => "Isi antara {$teks($min)} dan {$teks($maks)} {$satuan}.",
            "{$kolom}.regex" => 'Tulis angka dengan paling banyak satu angka di belakang koma, misalnya 8,5.',
            "{$kolom}.numeric" => 'Tulis angka dengan paling banyak satu angka di belakang koma, misalnya 8,5.',
        ];
    }
}
