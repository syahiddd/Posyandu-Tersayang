<?php

namespace App\Models;

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use Database\Factories\KunjunganFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Satu kehadiran anak pada satu tanggal, beserta posisinya di antrean meja
 * (PRD 3.2, 3.3, 7.1). Unik per anak per tanggal.
 *
 * @property int $id
 * @property int $anak_id
 * @property Carbon $tanggal
 * @property int $nomor_antrean
 * @property Meja $meja_saat_ini
 * @property StatusAntrean $status
 * @property int|null $dibuka_oleh
 * @property Carbon|null $dibuka_pada
 * @property Carbon $masuk_meja_pada
 * @property Carbon|null $ditunda_pada
 * @property Carbon|null $selesai_meja_1_pada
 * @property Carbon|null $selesai_meja_2_pada
 * @property Carbon|null $selesai_meja_3_pada
 * @property Carbon|null $selesai_meja_4_pada
 * @property Carbon|null $selesai_meja_5_pada
 */
#[Table('kunjungan')]
#[Fillable([
    'anak_id', 'tanggal', 'nomor_antrean', 'meja_saat_ini', 'status',
    'dibuka_oleh', 'dibuka_pada', 'masuk_meja_pada', 'ditunda_pada',
    'selesai_meja_1_pada', 'selesai_meja_2_pada', 'selesai_meja_3_pada',
    'selesai_meja_4_pada', 'selesai_meja_5_pada',
])]
class Kunjungan extends Model
{
    /** @use HasFactory<KunjunganFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'meja_saat_ini' => Meja::class,
            'status' => StatusAntrean::class,
            'dibuka_pada' => 'datetime',
            'masuk_meja_pada' => 'datetime',
            'ditunda_pada' => 'datetime',
            'selesai_meja_1_pada' => 'datetime',
            'selesai_meja_2_pada' => 'datetime',
            'selesai_meja_3_pada' => 'datetime',
            'selesai_meja_4_pada' => 'datetime',
            'selesai_meja_5_pada' => 'datetime',
        ];
    }

    /**
     * Kunjungan pada tanggal hari ini (zona waktu aplikasi, FR-06).
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function hariIni(Builder $query): void
    {
        $query->whereDate('tanggal', today());
    }

    /** @return BelongsTo<Anak, $this> */
    public function anak(): BelongsTo
    {
        return $this->belongsTo(Anak::class);
    }

    /** @return BelongsTo<User, $this> */
    public function pembuka(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuka_oleh');
    }

    /** @return HasOne<Pengukuran, $this> */
    public function pengukuran(): HasOne
    {
        return $this->hasOne(Pengukuran::class);
    }

    /** @return HasMany<Layanan, $this> */
    public function layanan(): HasMany
    {
        return $this->hasMany(Layanan::class);
    }

    /** @return HasOne<Pendataan, $this> */
    public function pendataan(): HasOne
    {
        return $this->hasOne(Pendataan::class);
    }

    /** @return HasOne<Penyuluhan, $this> */
    public function penyuluhan(): HasOne
    {
        return $this->hasOne(Penyuluhan::class);
    }
}
