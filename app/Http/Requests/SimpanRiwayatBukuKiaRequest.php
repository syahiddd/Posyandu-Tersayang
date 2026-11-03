<?php

namespace App\Http\Requests;

use App\Enums\JenisLayanan;
use App\Models\Anak;
use App\Support\Tanggal;
use App\Support\Umur;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * S17 Tambah Riwayat dari Buku KIA (FR-64, FR-65): imunisasi lama (vaksin
 * dan tanggal), pengukuran lama (tanggal dan empat ukuran, PRD 7.2), serta
 * vitamin A dan obat cacing sesuai umur pada tanggal pemberian (PRD Tabel 30).
 */
class SimpanRiwayatBukuKiaRequest extends FormRequest
{
    use BatasUkur;

    public const UKUR = ['bb', 'pb_tb', 'lila', 'lk'];

    public function authorize(): bool
    {
        $anak = $this->anak();

        return $anak !== null && ($this->user()?->can('update', $anak) ?? false);
    }

    public function anak(): ?Anak
    {
        $anak = $this->route('anak');

        return $anak instanceof Anak ? $anak : null;
    }

    protected function prepareForValidation(): void
    {
        $this->normalkanDesimal(self::UKUR);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $lahir = $this->anak()?->tanggal_lahir->toDateString();
        $aturan = [
            'jenis' => ['required', Rule::in(['imunisasi', 'pengukuran', 'vitamin_obat'])],
            'tanggal' => ['required', 'date', 'before_or_equal:today', 'after_or_equal:'.$lahir],
            'vaksin' => ['exclude_unless:jenis,imunisasi', 'required', Rule::in(array_keys((array) config('imunisasi.vaksin')))],
            'layanan' => ['exclude_unless:jenis,vitamin_obat', 'required', Rule::in(array_keys((array) config('imunisasi.vitamin_obat')))],
        ];

        foreach (self::UKUR as $kolom) {
            $aturan[$kolom] = ['exclude_unless:jenis,pengukuran', ...$this->aturanUkur($kolom)];
        }

        return $aturan;
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator) {
            $anak = $this->anak();

            if ($anak === null || $validator->errors()->isNotEmpty()) {
                return;
            }

            $data = $validator->validated();
            $tanggal = CarbonImmutable::parse($data['tanggal']);

            match ($data['jenis']) {
                'imunisasi' => $this->periksaDosis($validator, $anak, $data['vaksin']),
                'pengukuran' => $this->periksaPengukuran($validator, $anak, $tanggal, $data),
                default => $this->periksaVitaminObat($validator, $anak, $tanggal, $data['layanan']),
            };
        }];
    }

    /** Dosis yang sama tidak dicatat dua kali (PRD 4.6, kriteria penerimaan). */
    private function periksaDosis(Validator $validator, Anak $anak, string $vaksin): void
    {
        $ada = $anak->layanan()
            ->where('jenis', JenisLayanan::Imunisasi)
            ->where('detail', $vaksin)
            ->value('tanggal');

        if ($ada !== null) {
            $validator->errors()->add('vaksin', "{$vaksin} sudah tercatat pada ".Tanggal::singkat($ada).'.');
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function periksaPengukuran(Validator $validator, Anak $anak, CarbonImmutable $tanggal, array $data): void
    {
        if (collect(self::UKUR)->every(fn (string $kolom) => blank($data[$kolom] ?? null))) {
            $validator->errors()->add('bb', 'Isi paling sedikit satu ukuran.');

            return;
        }

        if ($anak->pengukuran()->whereDate('tanggal_ukur', $tanggal)->exists()) {
            $validator->errors()->add('tanggal', 'Sudah ada pengukuran pada tanggal ini.');
        }
    }

    /** Umur pada tanggal pemberian harus sesuai PRD Tabel 30. */
    private function periksaVitaminObat(Validator $validator, Anak $anak, CarbonImmutable $tanggal, string $layanan): void
    {
        /** @var array{jenis: string, nama: string, umur_min: int, umur_maks: int|null} $acuan */
        $acuan = config("imunisasi.vitamin_obat.{$layanan}");
        $umur = Umur::bulanPenuh($anak->tanggal_lahir, $tanggal);

        if ($umur < $acuan['umur_min'] || ($acuan['umur_maks'] !== null && $umur > $acuan['umur_maks'])) {
            $batas = $acuan['umur_maks'] === null
                ? "{$acuan['umur_min']} bulan ke atas"
                : "{$acuan['umur_min']}–{$acuan['umur_maks']} bulan";
            $validator->errors()->add('layanan', "{$acuan['nama']} untuk umur {$batas}; pada tanggal itu anak berumur {$umur} bulan.");

            return;
        }

        $ada = $anak->layanan()
            ->where('jenis', $acuan['jenis'])
            ->where('detail', $layanan)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($ada) {
            $validator->errors()->add('tanggal', "{$layanan} pada tanggal ini sudah tercatat.");
        }
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $pesan = [
            'tanggal.after_or_equal' => 'Tanggal tidak boleh sebelum tanggal lahir anak.',
        ];

        foreach (self::UKUR as $kolom) {
            $pesan = [...$pesan, ...$this->pesanUkur($kolom, $kolom)];
        }

        return $pesan;
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['tanggal' => 'tanggal', 'vaksin' => 'vaksin', 'layanan' => 'layanan'];
    }
}
