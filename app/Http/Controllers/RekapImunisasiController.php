<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Rekap\RekapImunisasi;
use App\Support\Tanggal;
use App\Support\Umur;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S18 Rekapitulasi Imunisasi (PRD 4.10, DESIGN 6.5): penyaring periode,
 * jenis vaksin, dan dusun; tile cakupan per vaksin; tabel anak × vaksin
 * (FR-55, FR-56). Penandaan imunisasi terlambat (FR-57) menunggu tabel
 * Pelayanan Imunisasi Buku KIA.
 */
class RekapImunisasiController extends Controller
{
    public function index(Request $request): Response
    {
        $penyaring = $this->penyaring($request);
        $rekap = $penyaring['galat'] === null ? $this->rekap($penyaring) : null;
        $baris = $rekap?->baris() ?? [];

        return Inertia::render('rekap-imunisasi/index', [
            'penyaring' => collect($penyaring)->except('galat'),
            'galatPeriode' => $penyaring['galat'],
            'hariIni' => today()->toDateString(),
            'adaAnak' => Anak::query()->exists(),
            'daftarDusun' => Anak::query()->distinct()->orderBy('dusun')->pluck('dusun'),
            'daftarVaksin' => collect(RekapImunisasi::daftarKelompok())
                ->map(fn (string $nama, string $kode) => ['nilai' => $kode, 'label' => $nama])
                ->values(),
            'kolom' => collect($rekap?->kolom() ?? [])
                ->map(fn (string $nama, string $kode) => ['kode' => $kode, 'nama' => $nama])
                ->values(),
            'baris' => collect($baris)->map(fn (array $satu) => [
                'id' => $satu['anak']->id,
                'nama' => $satu['anak']->nama,
                'jenisKelamin' => $satu['anak']->jenis_kelamin->value,
                'umurBulan' => Umur::bulanPenuh($satu['anak']->tanggal_lahir),
                'dusun' => $satu['anak']->dusun,
                'sel' => collect($satu['sel'])->map(fn (?array $sel) => $sel === null ? null : [
                    'tanggal' => Tanggal::singkat($sel['tanggal']),
                    'dariBukuKia' => $sel['dariBukuKia'],
                ])->values(),
            ]),
            'jumlahPerDosis' => array_values($rekap?->jumlahPerDosis($baris) ?? []),
            'cakupan' => collect($rekap?->jumlahPerKelompok($baris) ?? [])
                ->map(fn (int $jumlah, string $kode) => [
                    'kode' => $kode,
                    'nama' => RekapImunisasi::daftarKelompok()[$kode],
                    'jumlah' => $jumlah,
                ])
                ->values(),
        ]);
    }

    /**
     * Penyaring dari query string. Tanggal yang tidak sah memakai bawaan
     * (1 Januari tahun berjalan sampai hari ini); tanggal sampai dibatasi
     * hari ini. Kelompok vaksin atau dusun yang tidak dikenal diabaikan.
     *
     * @return array{dari: string, sampai: string, vaksin: string|null, dusun: string|null, galat: string|null}
     */
    private function penyaring(Request $request): array
    {
        $hariIni = CarbonImmutable::today();
        $dari = $this->tanggal($request->query('dari')) ?? $hariIni->startOfYear();
        $sampai = $this->tanggal($request->query('sampai')) ?? $hariIni;

        if ($sampai->greaterThan($hariIni)) {
            $sampai = $hariIni;
        }

        $vaksin = (string) $request->query('vaksin');
        $dusun = trim((string) $request->query('dusun'));

        return [
            'dari' => $dari->toDateString(),
            'sampai' => $sampai->toDateString(),
            'vaksin' => array_key_exists($vaksin, RekapImunisasi::daftarKelompok()) ? $vaksin : null,
            'dusun' => $dusun === '' ? null : $dusun,
            'galat' => $sampai->lessThan($dari) ? 'Tanggal sampai tidak boleh sebelum tanggal dari.' : null,
        ];
    }

    private function tanggal(mixed $nilai): ?CarbonImmutable
    {
        if (! is_string($nilai) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $nilai) !== 1) {
            return null;
        }

        $tanggal = CarbonImmutable::createFromFormat('!Y-m-d', $nilai);

        return $tanggal !== null && $tanggal->toDateString() === $nilai ? $tanggal : null;
    }

    /** @param  array{dari: string, sampai: string, vaksin: string|null, dusun: string|null, galat: string|null}  $penyaring */
    private function rekap(array $penyaring): RekapImunisasi
    {
        return new RekapImunisasi(
            CarbonImmutable::parse($penyaring['dari']),
            CarbonImmutable::parse($penyaring['sampai']),
            $penyaring['vaksin'],
            $penyaring['dusun'],
        );
    }
}
