<?php

namespace App\Models;

use App\Enums\HasilDeteksiStunting;
use Database\Factories\PenyuluhanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Hasil Meja 5 (PRD 7.1, FR-42, FR-44, FR-45).
 *
 * @property int $id
 * @property int $kunjungan_id
 * @property array<int, string>|null $pengamatan_fisik
 * @property array<int, string>|null $pengamatan_motorik
 * @property array<int, string>|null $materi
 * @property HasilDeteksiStunting|null $hasil_deteksi_stunting
 * @property string|null $catatan_tindak_lanjut
 */
#[Table('penyuluhan')]
#[Fillable([
    'kunjungan_id', 'pengamatan_fisik', 'pengamatan_motorik', 'materi',
    'hasil_deteksi_stunting', 'catatan_tindak_lanjut',
])]
class Penyuluhan extends Model
{
    /** @use HasFactory<PenyuluhanFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pengamatan_fisik' => 'array',
            'pengamatan_motorik' => 'array',
            'materi' => 'array',
            'hasil_deteksi_stunting' => HasilDeteksiStunting::class,
        ];
    }

    /** @return BelongsTo<Kunjungan, $this> */
    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(Kunjungan::class);
    }
}
