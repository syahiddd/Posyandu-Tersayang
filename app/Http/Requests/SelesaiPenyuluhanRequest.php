<?php

namespace App\Http\Requests;

use App\Http\Controllers\PenyuluhanController;
use App\Models\Kunjungan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Isian Meja 5 Penyuluhan (FR-44, FR-45): pengamatan kader, materi, dan
 * Catatan Tindak Lanjut yang wajib bila ada status gizi di luar normal,
 * status T, atau risiko stunting.
 */
class SelesaiPenyuluhanRequest extends FormRequest
{
    public const MAKS_CATATAN = 500;

    public const MAKS_MATERI = 150;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $materi = collect((array) $this->input('materi', []))
            ->map(fn ($satu) => is_string($satu) ? trim($satu) : $satu)
            ->filter(fn ($satu) => $satu !== '' && $satu !== null)
            ->values()
            ->all();

        $this->merge(['materi' => $materi]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Kunjungan $kunjungan */
        $kunjungan = $this->route('kunjungan');
        $wajib = PenyuluhanController::alasanCatatanWajib($kunjungan) !== [];

        return [
            'pengamatan_fisik' => ['present', 'array'],
            'pengamatan_fisik.*' => ['distinct', Rule::in(array_keys((array) config('penyuluhan.pengamatan_fisik')))],
            'pengamatan_motorik' => ['present', 'array'],
            'pengamatan_motorik.*' => ['distinct', Rule::in(array_keys((array) config('penyuluhan.pengamatan_motorik')))],
            'materi' => ['array'],
            'materi.*' => ['string', 'distinct', 'max:'.self::MAKS_MATERI],
            'catatan_tindak_lanjut' => [$wajib ? 'required' : 'nullable', 'string', 'max:'.self::MAKS_CATATAN],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'catatan_tindak_lanjut.required' => 'Isi catatan tindak lanjut karena ada status yang perlu ditindaklanjuti.',
            'catatan_tindak_lanjut.max' => 'Catatan tindak lanjut paling banyak '.self::MAKS_CATATAN.' huruf.',
            'materi.*.max' => 'Nama materi paling banyak '.self::MAKS_MATERI.' huruf.',
            'materi.*.distinct' => 'Materi yang sama ditambahkan dua kali.',
            'pengamatan_fisik.*.in' => 'Pilihan pengamatan fisik tidak dikenal.',
            'pengamatan_motorik.*.in' => 'Pilihan pengamatan motorik tidak dikenal.',
        ];
    }
}
