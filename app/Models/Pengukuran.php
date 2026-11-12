<?php

namespace App\Models;

use App\Enums\CaraUkur;
use App\Enums\StatusNT;
use App\Enums\SumberData;
use App\Gizi\HasilAntropometri;
use Database\Factories\PengukuranFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Hasil ukur (PRD 7.1). Nilai satu desimal, z-score dua desimal (PRD 5.6).
 * IMT dan z-score dihitung ulang setiap kali nilai ukur disimpan, dari meja
 * mana pun (Meja 1 riwayat Buku KIA, Meja 2, input riwayat), sehingga rekap
 * status gizi (FR-62) dan Beranda selalu memakai angka yang sama.
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

    /** Kolom yang memengaruhi IMT dan z-score. */
    private const KOLOM_UKUR = ['anak_id', 'tanggal_ukur', 'bb', 'pb_tb', 'cara_ukur', 'lila', 'lk'];

    protected static function booted(): void
    {
        static::saving(function (Pengukuran $ukur) {
            if ($ukur->isDirty(self::KOLOM_UKUR)) {
                $ukur->hitungAntropometri();
            }
        });
    }

    /** Mengisi IMT dan z-score dari nilai ukur (PRD 5.6). */
    public function hitungAntropometri(): void
    {
        $anak = $this->anak()->withTrashed()->first();

        if ($anak === null) {
            return;
        }

        $this->fill(HasilAntropometri::hitung(
            $anak,
            $this->bb === null ? null : (float) $this->bb,
            $this->pb_tb === null ? null : (float) $this->pb_tb,
            $this->cara_ukur,
            $this->lila === null ? null : (float) $this->lila,
            $this->lk === null ? null : (float) $this->lk,
            $this->tanggal_ukur,
        )['kolom']);
    }

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
