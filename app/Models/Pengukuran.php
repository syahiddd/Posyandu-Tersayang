<?php

namespace App\Models;

use App\Enums\CaraUkur;
use App\Enums\StatusNT;
use App\Enums\SumberData;
use Database\Factories\PengukuranFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Hasil ukur (PRD 7.1). Nilai satu desimal, z-score dua desimal (PRD 5.6).
 * z-score dan status N/T belum dihitung di Fase 1.
 *
 * @property int $id
 * @property int $anak_id
 * @property int|null $kunjungan_id
 * @property Carbon $tanggal_ukur
 * @property SumberData $sumber
 * @property string|null $bb
 * @property string|null $pb_tb
 * @property CaraUkur|null $cara_ukur
 * @property string|null $lila
 * @property string|null $lk
 * @property string|null $imt
 * @property string|null $zscore_bb_u
 * @property string|null $zscore_pb_tb_u
 * @property string|null $zscore_bb_pb_tb
 * @property string|null $zscore_imt_u
 * @property string|null $zscore_lk_u
 * @property StatusNT|null $status_nt
 */
#[Table('pengukuran')]
#[Fillable([
    'anak_id', 'kunjungan_id', 'tanggal_ukur', 'sumber',
    'bb', 'pb_tb', 'cara_ukur', 'lila', 'lk', 'imt',
    'zscore_bb_u', 'zscore_pb_tb_u', 'zscore_bb_pb_tb', 'zscore_imt_u',
    'zscore_lk_u', 'status_nt',
])]
class Pengukuran extends Model
{
    /** @use HasFactory<PengukuranFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_ukur' => 'date',
            'sumber' => SumberData::class,
            'cara_ukur' => CaraUkur::class,
            'status_nt' => StatusNT::class,
            'bb' => 'decimal:1',
            'pb_tb' => 'decimal:1',
            'lila' => 'decimal:1',
            'lk' => 'decimal:1',
            'imt' => 'decimal:1',
            'zscore_bb_u' => 'decimal:2',
            'zscore_pb_tb_u' => 'decimal:2',
            'zscore_bb_pb_tb' => 'decimal:2',
            'zscore_imt_u' => 'decimal:2',
            'zscore_lk_u' => 'decimal:2',
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
