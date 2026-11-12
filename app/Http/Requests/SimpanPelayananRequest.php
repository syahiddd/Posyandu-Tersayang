<?php

namespace App\Http\Requests;

use App\Models\Kunjungan;
use App\Pelayanan\RekomendasiLayanan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Isian Meja 4 Pelayanan (FR-32 sampai FR-35). Hanya layanan yang
 * ditawarkan untuk anak ini yang dapat dicatat, sehingga dosis yang sudah
 * tercatat dan layanan di luar umur ditolak (PRD 4.6, kriteria penerimaan).
 */
class SimpanPelayananRequest extends FormRequest
{
    public const MAKS_CATATAN = 500;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Kunjungan $kunjungan */
        $kunjungan = $this->route('kunjungan');
        $rekomendasi = new RekomendasiLayanan($kunjungan);

        $vitaminA = $rekomendasi->vitaminA()['pilihan']['kode'] ?? null;
        $obatCacing = $rekomendasi->obatCacing()['boleh'] ?? false;

        return [
            'tanggal' => [
                'required', 'date', 'before_or_equal:today',
                'after_or_equal:'.$kunjungan->anak->tanggal_lahir->toDateString(),
            ],
            'imunisasi' => ['present', 'array'],
            'imunisasi.*.kode' => [
                'required', 'distinct',
                Rule::in(array_column($rekomendasi->imunisasi(), 'kode')),
            ],
            'imunisasi.*.batch' => ['nullable', 'string', 'max:50'],
            'vitamin_a' => ['nullable', Rule::in($vitaminA === null ? [] : [$vitaminA])],
            'obat_cacing' => $obatCacing ? ['boolean'] : ['boolean', 'declined'],
            'catatan_pelayanan' => ['nullable', 'string', 'max:'.self::MAKS_CATATAN],
            'catatan_penyuluhan' => ['nullable', 'string', 'max:'.self::MAKS_CATATAN],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tanggal.before_or_equal' => 'Tanggal pemberian tidak boleh setelah hari ini.',
            'tanggal.after_or_equal' => 'Tanggal pemberian tidak boleh sebelum tanggal lahir anak.',
            'imunisasi.*.kode.in' => 'Imunisasi ini tidak sedang jatuh tempo atau sudah tercatat.',
            'imunisasi.*.kode.distinct' => 'Imunisasi yang sama dipilih dua kali.',
            'imunisasi.*.batch.max' => 'Nomor batch paling banyak 50 huruf.',
            'vitamin_a.in' => 'Vitamin A belum waktunya untuk anak ini.',
            'obat_cacing.declined' => 'Obat cacing belum waktunya untuk anak ini.',
            'catatan_pelayanan.max' => 'Catatan pelayanan paling banyak '.self::MAKS_CATATAN.' huruf.',
            'catatan_penyuluhan.max' => 'Catatan untuk penyuluhan paling banyak '.self::MAKS_CATATAN.' huruf.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['tanggal' => 'tanggal pemberian'];
    }
}
