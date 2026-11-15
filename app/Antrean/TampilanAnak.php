<?php

namespace App\Antrean;

use App\Enums\JenisLayanan;
use App\Gizi\DeteksiStunting;
use App\Gizi\HasilAntropometri;
use App\Models\Anak;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Pelayanan\JadwalImunisasi;
use App\Support\Nik;
use App\Support\Tanggal;
use App\Support\Umur;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Ringkasan anak untuk hasil pencarian dan kartu pembanding Meja 1
 * (FR-11, FR-12, FR-15). NIK selalu tersamar (NFR-05).
 */
final class TampilanAnak
{
    /**
     * @return array<string, mixed>
     */
    public static function ringkas(Anak $anak): array
    {
        // Daftar panjang memuat keduanya lewat denganRingkasan() agar tidak N+1.
        $terakhir = array_key_exists('kunjungan_terakhir', $anak->getAttributes())
            ? $anak->getAttribute('kunjungan_terakhir')
            : $anak->kunjungan()->max('tanggal');
        $hariIni = array_key_exists('di_antrean_hari_ini', $anak->getAttributes())
            ? (bool) $anak->getAttribute('di_antrean_hari_ini')
            : $anak->kunjungan()->whereDate('tanggal', today())->exists();

        return [
            'id' => $anak->id,
            'nama' => $anak->nama,
            'jenisKelamin' => $anak->jenis_kelamin->value,
            'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir),
            'tanggalLahir' => Tanggal::singkat($anak->tanggal_lahir),
            'namaIbu' => $anak->nama_ibu,
            'nikSamar' => Nik::samarkan($anak->nik),
            'kunjunganTerakhir' => is_string($terakhir) ? Tanggal::singkat($terakhir) : null,
            'sudahDiAntrean' => $hariIni,
        ];
    }

    /**
     * Memuat kunjungan terakhir dan status antrean hari ini dalam satu query.
     *
     * @param  Builder<Anak>  $query
     * @return Builder<Anak>
     */
    public static function denganRingkasan(Builder $query): Builder
    {
        return $query
            ->withMax('kunjungan as kunjungan_terakhir', 'tanggal')
            ->withExists(['kunjungan as di_antrean_hari_ini' => fn (Builder $q) => $q->whereDate('tanggal', today())]);
    }

    /**
     * Ringkasan lengkap untuk kartu daftar Data Anak: ringkasan dasar ditambah
     * hasil ukur terakhir, status imunisasi (FR-70), dan status stunting
     * (FR-42) agar aman/rentan/stunting terlihat sejak daftar. Butuh relasi
     * dari denganUkurTerakhir() agar tidak N+1.
     *
     * @return array<string, mixed>
     */
    public static function ringkasLengkap(Anak $anak): array
    {
        $umur = Umur::bulanPenuh($anak->tanggal_lahir);

        $ukur = $anak->relationLoaded('pengukuranTerakhir')
            ? $anak->getRelation('pengukuranTerakhir')
            : $anak->pengukuranTerakhir()->first();

        $sudahImunisasi = array_values(($anak->relationLoaded('layanan')
            ? $anak->layanan
            : $anak->layanan()->get())
            ->where('jenis', JenisLayanan::Imunisasi)
            ->map(fn (Layanan $layanan) => $layanan->detail)
            ->all());

        $jatuhTempo = JadwalImunisasi::jatuhTempo($umur, $sudahImunisasi);

        return [
            ...self::ringkas($anak),
            'ukurTerakhir' => $ukur === null ? null : [
                'tanggal' => Tanggal::singkat($ukur->tanggal_ukur),
                // Kolom angka kosong diperlakukan sebagai belum ada nilai.
                'bb' => $ukur->bb === '' ? null : $ukur->bb,
                'pbTb' => $ukur->pb_tb === '' ? null : $ukur->pb_tb,
            ],
            'imunisasi' => [
                'sesuai' => $jatuhTempo === [],
                'berikutnya' => $jatuhTempo[0]['nama'] ?? null,
                'terlambat' => $jatuhTempo[0]['terlambat'] ?? false,
            ],
            'stunting' => self::stunting($anak),
        ];
    }

    /**
     * Status stunting anak dari seluruh riwayat ukurnya (PRD 5.8). Diambil
     * dari perhitungan yang sama dengan Meja 5 agar kesimpulannya konsisten.
     * Null bila anak belum pernah diukur: tanpa data, status tidak dapat
     * ditentukan dan tidak boleh terlihat "aman".
     *
     * @return array{hasil: string, judul: string, alasan: string|null, tindakan: string}|null
     */
    private static function stunting(Anak $anak): ?array
    {
        $riwayat = array_values(($anak->relationLoaded('pengukuran')
            ? $anak->pengukuran
            : $anak->pengukuran()->orderBy('tanggal_ukur')->orderBy('id')->get())
            ->sortBy(fn (Pengukuran $ukur) => [$ukur->tanggal_ukur->toDateString(), $ukur->id])
            ->map(function (Pengukuran $ukur) use ($anak) {
                $hasil = HasilAntropometri::riwayat($anak, $ukur);

                return [
                    'tanggal' => $hasil['tanggal'],
                    'umurBulan' => $hasil['umurBulan'],
                    'zscore' => $hasil['zscore'],
                    'statusNt' => $hasil['statusNt'],
                ];
            })
            ->all());

        if ($riwayat === []) {
            return null;
        }

        $hasil = DeteksiStunting::nilai($riwayat);

        return [...$hasil, 'hasil' => $hasil['hasil']->value];
    }

    /**
     * Memuat hasil ukur terakhir, riwayat ukur (untuk status stunting), dan
     * riwayat imunisasi untuk daftar panjang dalam satu query tambahan per
     * relasi.
     *
     * @param  Builder<Anak>  $query
     * @return Builder<Anak>
     */
    public static function denganUkurTerakhir(Builder $query): Builder
    {
        return $query->with([
            'pengukuranTerakhir',
            'pengukuran' => fn (HasMany $q) => $q->orderBy('tanggal_ukur')->orderBy('id'),
            'layanan' => fn (HasMany $q) => $q->where('jenis', JenisLayanan::Imunisasi->value),
        ]);
    }
}
