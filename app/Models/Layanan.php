<?php

namespace App\Models;

use App\Enums\JenisLayanan;
use App\Enums\SumberData;
use Database\Factories\LayananFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Imunisasi, vitamin A, dan obat cacing (PRD 7.1).
 *
 * @property int $id
 * @property int $anak_id
 * @property int|null $kunjungan_id
 * @property JenisLayanan $jenis
 * @property string $detail
 * @property Carbon $tanggal
 * @property string|null $nomor_batch
 * @property SumberData $sumber
 */
#[Table('layanan')]
#[Fillable([
    'anak_id', 'kunjungan_id', 'jenis', 'detail', 'tanggal',
    'nomor_batch', 'sumber',
])]
class Layanan extends Model
{
    /** @use HasFactory<LayananFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenis' => JenisLayanan::class,
            'tanggal' => 'date',
            'sumber' => SumberData::class,
        ];
    }

    /** @return BelongsTo<Anak, $this> */
    public function anak(): BelongsTo
    {
        return $this->belongsTo(Anak::class);
    }

    /** @return BelongsTo<Kunjungan, $this> */
    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(Kunjungan::class);
    }
}
