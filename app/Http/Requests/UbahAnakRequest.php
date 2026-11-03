<?php

namespace App\Http\Requests;

use App\Models\Anak;
use Illuminate\Foundation\Http\FormRequest;

/**
 * S16 Ubah Data Anak (FR-52): identitas, orang tua, dan alamat dengan aturan
 * yang sama seperti Tambah Anak. Riwayat ukur tidak diubah di sini.
 */
class UbahAnakRequest extends FormRequest
{
    use IsianIdentitasAnak;

    public function authorize(): bool
    {
        $anak = $this->route('anak');

        return $anak instanceof Anak && ($this->user()?->can('update', $anak) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $this->rapikanNoHp();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $anak = $this->route('anak');

        return $this->aturanIdentitas($anak instanceof Anak ? $anak : null);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->pesanIdentitas();
    }
}
