<?php

namespace App\Http\Controllers;

use App\Antrean\LayananAntrean;
use App\Antrean\TampilanKunjungan;
use App\Antrean\Urungan;
use App\Enums\JenisLayanan;
use App\Enums\Meja;
use App\Enums\SumberData;
use App\Http\Requests\SimpanPelayananRequest;
use App\Models\Kunjungan;
use App\Models\Layanan;
use App\Pelayanan\RekomendasiLayanan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Meja 4 Pelayanan (PRD 4.6): imunisasi, vitamin A, obat cacing, dan
 * catatan (FR-30 sampai FR-36; DESIGN 5.6, 6.3, Gambar 5).
 */
class PelayananController extends Controller
{
    /** Riwayat imunisasi singkat di layar (FR-31). */
    public const JUMLAH_RIWAYAT = 2;

    public function __construct(private LayananAntrean $antrean) {}

    /**
     * Props layar Meja 4 (S11).
     *
     * @return array<string, mixed>
     */
    public static function props(Kunjungan $kunjungan): array
    {
        $rekomendasi = new RekomendasiLayanan($kunjungan);
        $riwayat = $rekomendasi->riwayatImunisasi();

        return [
            'anak' => TampilanKunjungan::header($kunjungan),
            'hariIni' => today()->toDateString(),
            'tanggalLahir' => $kunjungan->anak->tanggal_lahir->toDateString(),
            'jatuhTempo' => $rekomendasi->imunisasi(),
            'vitaminA' => $rekomendasi->vitaminA(),
            'obatCacing' => $rekomendasi->obatCacing(),
            'riwayatTerakhir' => array_slice($riwayat, 0, self::JUMLAH_RIWAYAT),
            'semuaRiwayat' => $riwayat,
            'nilaiAwal' => self::nilaiAwal($kunjungan),
        ];
    }

    /**
     * Isian yang sudah ada: layanan kunjungan ini (setelah Batal) atau draf
     * saat ditunda (FR-48). Null berarti layar memakai centang bawaan.
     *
     * @return array<string, mixed>|null
     */
    private static function nilaiAwal(Kunjungan $kunjungan): ?array
    {
        $tersimpan = $kunjungan->layanan()->orderBy('id')->get();

        if ($tersimpan->isEmpty()) {
            return ($kunjungan->draf ?? [])[Meja::Pelayanan->value] ?? null;
        }

        return [
            'tanggal' => $tersimpan->first()->tanggal->toDateString(),
            'imunisasi' => $tersimpan
                ->where('jenis', JenisLayanan::Imunisasi)
                ->map(fn (Layanan $layanan) => ['kode' => $layanan->detail, 'batch' => $layanan->nomor_batch ?? ''])
                ->values()
                ->all(),
            'vitamin_a' => $tersimpan->firstWhere('jenis', JenisLayanan::VitaminA)->detail ?? '',
            'obat_cacing' => $tersimpan->contains('jenis', JenisLayanan::ObatCacing),
            'catatan_pelayanan' => $kunjungan->catatan_pelayanan ?? '',
            'catatan_penyuluhan' => $kunjungan->catatan_penyuluhan ?? '',
        ];
    }

    /** "Simpan · ke Meja 5": layanan masuk riwayat, anak masuk antrean Meja 5 (FR-36). */
    public function simpan(SimpanPelayananRequest $request, Kunjungan $kunjungan): RedirectResponse
    {
        $this->antrean->pastikanDipegang($kunjungan, $request->user());

        if ($kunjungan->meja_saat_ini !== Meja::Pelayanan) {
            throw ValidationException::withMessages(['kunjungan' => 'Anak ini tidak sedang di Meja 4.']);
        }

        $data = $request->validated();
        $sebelum = Urungan::potret($kunjungan);

        DB::transaction(function () use ($kunjungan, $data, $request) {
            // Simpan ulang setelah Batal mengganti catatan kunjungan ini.
            $kunjungan->layanan()->delete();

            $umum = [
                'anak_id' => $kunjungan->anak_id,
                'tanggal' => $data['tanggal'],
                'sumber' => SumberData::Posyandu,
            ];

            foreach ($data['imunisasi'] as $imunisasi) {
                $kunjungan->layanan()->create([
                    ...$umum,
                    'jenis' => JenisLayanan::Imunisasi,
                    'detail' => $imunisasi['kode'],
                    'nomor_batch' => filled($imunisasi['batch'] ?? null) ? trim($imunisasi['batch']) : null,
                ]);
            }

            if (filled($data['vitamin_a'] ?? null)) {
                $kunjungan->layanan()->create([
                    ...$umum,
                    'jenis' => JenisLayanan::VitaminA,
                    'detail' => $data['vitamin_a'],
                ]);
            }

            if ($data['obat_cacing'] ?? false) {
                $kunjungan->layanan()->create([
                    ...$umum,
                    'jenis' => JenisLayanan::ObatCacing,
                    'detail' => 'Obat cacing',
                ]);
            }

            $kunjungan->update([
                'catatan_pelayanan' => filled($data['catatan_pelayanan'] ?? null) ? trim($data['catatan_pelayanan']) : null,
                'catatan_penyuluhan' => filled($data['catatan_penyuluhan'] ?? null) ? trim($data['catatan_penyuluhan']) : null,
            ]);

            $this->antrean->teruskan($kunjungan, $request->user());
        });

        Urungan::catat($request, $kunjungan, $sebelum);
        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} tersimpan · masuk Meja 5",
            'batal' => true,
        ]);

        return redirect()->route('meja', Meja::Pelayanan->value);
    }
}
