<?php

namespace App\Models;

use App\Enums\JenisKelamin;
use Database\Factories\AnakFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * Data anak (PRD 7.1, Tabel 10). Dihapus lunak agar dapat dipulihkan (FR-53).
 * Ubah, hapus, dan pulihkan tercatat di log aktivitas (FR-52, NFR-06).
 *
 * @property int $id
 * @property string $nama
 * @property JenisKelamin $jenis_kelamin
 * @property string|null $tempat_lahir
 * @property Carbon $tanggal_lahir
 * @property string|null $nik
 * @property string $nama_ibu
 * @property string|null $nik_ibu
 * @property string|null $nama_ayah
 * @property string|null $nik_ayah
 * @property string|null $no_hp
 * @property string $alamat
 * @property int|null $rt
 * @property int|null $rw
 * @property string $dusun
 * @property Carbon|null $deleted_at
 */
#[Table('anak')]
#[Fillable([
    'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'nik',
    'nama_ibu', 'nik_ibu', 'nama_ayah', 'nik_ayah', 'no_hp',
    'alamat', 'rt', 'rw', 'dusun',
])]
class Anak extends Model
{
    /** @use HasFactory<AnakFactory> */
    use HasFactory, LogsActivity, SoftDeletes;

    /** @var list<string> Yang dicatat: ubah, hapus, dan pulihkan (NFR-06). */
    protected static array $recordEvents = ['updated', 'deleted', 'restored'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('anak')
            ->logOnly([
                'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'nik',
                'nama_ibu', 'nik_ibu', 'nama_ayah', 'nik_ayah', 'no_hp',
                'alamat', 'rt', 'rw', 'dusun',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenis_kelamin' => JenisKelamin::class,
            'tanggal_lahir' => 'date',
            'rt' => 'integer',
            'rw' => 'integer',
        ];
    }

    /** @return HasMany<Kunjungan, $this> */
    public function kunjungan(): HasMany
    {
        return $this->hasMany(Kunjungan::class);
    }

    /** @return HasMany<Pengukuran, $this> */
    public function pengukuran(): HasMany
    {
        return $this->hasMany(Pengukuran::class);
    }

    /** @return HasMany<Layanan, $this> */
    public function layanan(): HasMany
    {
        return $this->hasMany(Layanan::class);
    }
}
