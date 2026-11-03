<?php

namespace App\Models;

use Database\Factories\PosyanduFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Profil posyandu (PRD 7.1, FR-59).
 *
 * @property int $id
 * @property string $nama
 * @property string|null $desa_kelurahan
 * @property string|null $kecamatan
 * @property string|null $kabupaten_kota
 * @property string|null $puskesmas_pembina
 * @property string|null $alamat
 * @property string|null $jadwal_kegiatan
 */
#[Table('posyandu')]
#[Fillable([
    'nama', 'desa_kelurahan', 'kecamatan', 'kabupaten_kota',
    'puskesmas_pembina', 'alamat', 'jadwal_kegiatan',
])]
class Posyandu extends Model
{
    /** @use HasFactory<PosyanduFactory> */
    use HasFactory;
}
