<?php

namespace App\Models;

use Database\Factories\PendataanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Hasil Meja 3 (PRD 7.1, FR-27, FR-29).
 *
 * @property int $id
 * @property int $kunjungan_id
 * @property bool|null $asi_eksklusif
 * @property Carbon|null $disalin_ke_kia_pada
 */
#[Table('pendataan')]
#[Fillable(['kunjungan_id', 'asi_eksklusif', 'disalin_ke_kia_pada'])]
class Pendataan extends Model
{
    /** @use HasFactory<PendataanFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'asi_eksklusif' => 'boolean',
            'disalin_ke_kia_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Kunjungan, $this> */
    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(Kunjungan::class);
    }
}
