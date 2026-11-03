<?php

namespace App\Http\Requests;

use App\Antrean\TampilanAnak;
use App\Enums\JenisKelamin;
use App\Models\Anak;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Formulir Tambah Anak (FR-10, PRD Tabel 10 dan 7.2).
 */
class SimpanAnakRequest extends FormRequest
{
    use BatasUkur;

    private const UKUR = ['ukur_bb' => 'bb', 'ukur_pb_tb' => 'pb_tb', 'ukur_lila' => 'lila', 'ukur_lk' => 'lk'];

    public function authorize(): bool
    {
        return $this->user()?->can('create', Anak::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->normalkanDesimal(array_keys(self::UKUR));

        // Nomor HP boleh ditulis dengan spasi atau tanda hubung.
        if (is_string($this->input('no_hp'))) {
            $this->merge(['no_hp' => preg_replace('/[\s\-]/', '', $this->input('no_hp')) ?: null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $aturan = [
            'nama' => ['required', 'string', 'max:100'],
            'jenis_kelamin' => ['required', Rule::enum(JenisKelamin::class)],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date', 'before_or_equal:today'],
            'nik' => ['nullable', 'digits:16', Rule::unique('anak', 'nik')],
            'nama_ibu' => ['required', 'string', 'max:100'],
            'nik_ibu' => ['nullable', 'digits:16'],
            'nama_ayah' => ['nullable', 'string', 'max:100'],
            'nik_ayah' => ['nullable', 'digits:16'],
            'no_hp' => ['nullable', 'regex:/^(08\d{8,11}|\+62\d{8,11})$/'],
            'alamat' => ['required', 'string', 'max:255'],
            'rt' => ['nullable', 'integer', 'min:0', 'max:999'],
            'rw' => ['nullable', 'integer', 'min:0', 'max:999'],
            'dusun' => ['required', 'string', 'max:100'],
            'ukur_tanggal' => [
                'nullable', 'required_with:ukur_bb,ukur_pb_tb,ukur_lila,ukur_lk',
                'date', 'before_or_equal:today', 'after_or_equal:tanggal_lahir',
            ],
            'abaikan_kemiripan' => ['nullable', 'boolean'],
        ];

        foreach (self::UKUR as $kolom => $jenis) {
            $aturan[$kolom] = $this->aturanUkur($jenis);
        }

        return $aturan;
    }

    /**
     * FR-11: bila NIK sudah terdaftar, tampilkan data anak pemilik NIK itu.
     */
    protected function failedValidation(Validator $validator): void
    {
        $nik = $this->input('nik');

        if ($validator->errors()->has('nik') && is_string($nik) && strlen($nik) === 16) {
            $anak = Anak::withTrashed()->where('nik', $nik)->first();

            if ($anak !== null) {
                $this->session()->flash('anakSamaNik', TampilanAnak::ringkas($anak));
            }
        }

        parent::failedValidation($validator);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $pesan = [
            'no_hp.regex' => 'Nomor HP 10 sampai 13 digit, diawali 08 atau +62.',
            'ukur_tanggal.after_or_equal' => 'Tanggal pengukuran tidak boleh sebelum tanggal lahir.',
        ];

        foreach (self::UKUR as $kolom => $jenis) {
            $pesan = [...$pesan, ...$this->pesanUkur($kolom, $jenis)];
        }

        return $pesan;
    }
}
