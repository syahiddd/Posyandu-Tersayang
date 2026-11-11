<?php

namespace App\Http\Requests;

use App\Enums\JenisKelamin;
use App\Models\Anak;
use Illuminate\Validation\Rule;

/**
 * Isian identitas, orang tua, dan alamat anak (PRD Tabel 10, 7.2), dipakai
 * Tambah Anak (FR-10) dan Ubah Data Anak (FR-52).
 */
trait IsianIdentitasAnak
{
    /** Kolom yang disimpan ke tabel anak. */
    public const KOLOM_IDENTITAS = [
        'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'nik',
        'punya_buku_kia', 'nama_ibu', 'nik_ibu', 'nama_ayah', 'nik_ayah', 'no_hp',
        'alamat', 'rt', 'rw', 'dusun',
    ];

    /** Nomor HP boleh ditulis dengan spasi atau tanda hubung. */
    protected function rapikanNoHp(): void
    {
        if (is_string($this->input('no_hp'))) {
            $this->merge(['no_hp' => preg_replace('/[\s\-]/', '', $this->input('no_hp')) ?: null]);
        }
    }

    /**
     * NIK unik di seluruh data anak, termasuk yang dihapus dan dapat
     * dipulihkan (FR-11, FR-53), kecuali milik anak yang sedang diubah.
     *
     * @return array<string, mixed>
     */
    protected function aturanIdentitas(?Anak $abaikan = null): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'jenis_kelamin' => ['required', Rule::enum(JenisKelamin::class)],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date', 'before_or_equal:today'],
            'nik' => ['nullable', 'digits:16', Rule::unique('anak', 'nik')->ignore($abaikan)],
            // Huruf K pada SKDN (FR-61); wajib dipilih, termasuk data lama saat diubah.
            'punya_buku_kia' => ['required', 'boolean'],
            'nama_ibu' => ['required', 'string', 'max:100'],
            'nik_ibu' => ['nullable', 'digits:16'],
            'nama_ayah' => ['nullable', 'string', 'max:100'],
            'nik_ayah' => ['nullable', 'digits:16'],
            'no_hp' => ['nullable', 'regex:/^(08\d{8,11}|\+62\d{8,11})$/'],
            'alamat' => ['required', 'string', 'max:255'],
            'rt' => ['nullable', 'integer', 'min:0', 'max:999'],
            'rw' => ['nullable', 'integer', 'min:0', 'max:999'],
            'dusun' => ['required', 'string', 'max:100'],
        ];
    }

    /** @return array<string, string> */
    protected function pesanIdentitas(): array
    {
        return [
            'no_hp.regex' => 'Nomor HP 10 sampai 13 digit, diawali 08 atau +62.',
            'punya_buku_kia.required' => 'Pilih apakah anak punya Buku KIA.',
        ];
    }
}
