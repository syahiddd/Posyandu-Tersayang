<?php

namespace App\Http\Requests;

use App\Antrean\TampilanAnak;
use App\Models\Anak;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Formulir Tambah Anak (FR-10, PRD Tabel 10 dan 7.2).
 */
class SimpanAnakRequest extends FormRequest
{
    use BatasUkur, IsianIdentitasAnak;

    private const UKUR = ['ukur_bb' => 'bb', 'ukur_pb_tb' => 'pb_tb', 'ukur_lila' => 'lila', 'ukur_lk' => 'lk'];

    public function authorize(): bool
    {
        return $this->user()?->can('create', Anak::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->normalkanDesimal(array_keys(self::UKUR));

        $this->rapikanNoHp();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $aturan = [
            ...$this->aturanIdentitas(),
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
            ...$this->pesanIdentitas(),
            'ukur_tanggal.after_or_equal' => 'Tanggal pengukuran tidak boleh sebelum tanggal lahir.',
        ];

        foreach (self::UKUR as $kolom => $jenis) {
            $pesan = [...$pesan, ...$this->pesanUkur($kolom, $jenis)];
        }

        return $pesan;
    }
}
