<?php

namespace App\Http\Requests;

use App\Enums\CaraUkur;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Isian Meja 2 Pengukuran (FR-19 sampai FR-22, PRD 7.2): BB dan PB/TB
 * wajib, LiLA dan LK dianjurkan; koma dan titik diterima.
 */
class SimpanPengukuranRequest extends FormRequest
{
    use BatasUkur;

    private const UKUR = ['bb' => 'bb', 'pb_tb' => 'pb_tb', 'lila' => 'lila', 'lk' => 'lk'];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->normalkanDesimal(array_keys(self::UKUR));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bb' => $this->aturanUkur('bb', wajib: true),
            'pb_tb' => $this->aturanUkur('pb_tb', wajib: true),
            'cara_ukur' => ['required', Rule::enum(CaraUkur::class)],
            'lila' => $this->aturanUkur('lila'),
            'lk' => $this->aturanUkur('lk'),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $pesan = [];

        foreach (self::UKUR as $kolom => $jenis) {
            $pesan = [...$pesan, ...$this->pesanUkur($kolom, $jenis)];
        }

        return $pesan;
    }
}
