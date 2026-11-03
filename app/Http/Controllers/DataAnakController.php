<?php

namespace App\Http\Controllers;

use App\Anak\KelompokUmur;
use App\Anak\PencarianAnak;
use App\Anak\TampilanDetailAnak;
use App\Antrean\TampilanAnak;
use App\Enums\JenisKelamin;
use App\Models\Anak;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Menu Data Anak (PRD 4.9, DESIGN S14): daftar seluruh anak dengan
 * pencarian nama atau NIK, serta penyaring jenis kelamin, kelompok umur,
 * dan dusun (FR-50). NIK tersamar di daftar (NFR-05).
 */
class DataAnakController extends Controller
{
    private const PER_HALAMAN = 20;

    public function index(Request $request): Response
    {
        $penyaring = $this->penyaring($request);

        return Inertia::render('data-anak/daftar', [
            'penyaring' => $penyaring,
            'jumlah' => fn () => $this->query($penyaring)->count(),
            'adaAnak' => fn () => Anak::query()->exists(),
            'anak' => Inertia::scroll(fn () => TampilanAnak::denganRingkasan($this->query($penyaring))
                ->orderBy('nama')
                ->orderBy('id')
                ->paginate(self::PER_HALAMAN)
                ->through(fn (Anak $anak) => TampilanAnak::ringkas($anak))),
            'daftarDusun' => fn () => Anak::query()->distinct()->orderBy('dusun')->pluck('dusun'),
            'daftarKelompokUmur' => array_map(
                fn (KelompokUmur $kelompok) => ['nilai' => $kelompok->value, 'label' => $kelompok->label()],
                KelompokUmur::cases(),
            ),
        ]);
    }

    /** S15 Detail Anak: tab Ringkasan, Grafik, dan Riwayat (FR-51). */
    public function show(Anak $anak): Response
    {
        return Inertia::render('data-anak/detail', [
            'anak' => TampilanDetailAnak::identitas($anak),
            'pengukuran' => TampilanDetailAnak::pengukuran($anak),
            'kunjungan' => TampilanDetailAnak::kunjungan($anak),
            'layanan' => TampilanDetailAnak::layanan($anak),
        ]);
    }

    /**
     * Penyaring dari query string; nilai yang tidak dikenal diabaikan.
     *
     * @return array{cari: string, jk: string|null, umur: string|null, dusun: string|null}
     */
    private function penyaring(Request $request): array
    {
        $jk = JenisKelamin::tryFrom((string) $request->query('jk'));
        $umur = KelompokUmur::tryFrom((string) $request->query('umur'));
        $dusun = trim((string) $request->query('dusun'));

        return [
            'cari' => trim((string) $request->query('cari')),
            'jk' => $jk?->value,
            'umur' => $umur?->value,
            'dusun' => $dusun === '' ? null : $dusun,
        ];
    }

    /**
     * Query daftar sesuai penyaring; dipakai juga untuk unduh CSV (FR-54).
     *
     * @param  array{cari: string, jk: string|null, umur: string|null, dusun: string|null}  $penyaring
     * @return Builder<Anak>
     */
    private function query(array $penyaring): Builder
    {
        $query = PencarianAnak::terapkan(Anak::query(), PencarianAnak::kata($penyaring['cari']));

        if ($penyaring['jk'] !== null) {
            $query->where('jenis_kelamin', $penyaring['jk']);
        }

        if ($penyaring['umur'] !== null) {
            KelompokUmur::from($penyaring['umur'])->terapkan($query);
        }

        if ($penyaring['dusun'] !== null) {
            $query->where('dusun', $penyaring['dusun']);
        }

        return $query;
    }
}
