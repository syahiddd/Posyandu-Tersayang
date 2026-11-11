<?php

namespace App\Http\Controllers;

use App\Models\Posyandu;
use App\Models\User;
use App\Rekap\RekapBulanan;
use App\Support\Tanggal;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S19 Data Posyandu (PRD 4.11): profil posyandu yang diubah Ketua Kader
 * (FR-59) dan daftar kader dengan nomor HP serta meja yang biasa dipegang
 * (FR-60), serta rekap SKDN dan layanan bulanan (FR-61, FR-62). Jumlah per
 * status gizi dan risiko stunting menunggu tabel standar WHO.
 */
class DataPosyanduController extends Controller
{
    private const KOLOM = [
        'nama', 'desa_kelurahan', 'kecamatan', 'kabupaten_kota',
        'puskesmas_pembina', 'alamat', 'jadwal_kegiatan',
    ];

    public function index(Request $request): Response
    {
        $posyandu = $this->posyandu();
        $bulan = $this->bulan($request->query('bulan'));
        $bulanIni = CarbonImmutable::today()->startOfMonth();

        return Inertia::render('data-posyandu/profil', [
            'profil' => $posyandu->only(self::KOLOM),
            'rekap' => [
                'bulan' => $bulan->format('Y-m'),
                'label' => Tanggal::bulan($bulan),
                'sebelumnya' => $bulan->subMonthNoOverflow()->format('Y-m'),
                'berikutnya' => $bulan->lessThan($bulanIni) ? $bulan->addMonthNoOverflow()->format('Y-m') : null,
                ...(new RekapBulanan($bulan))->hitung(),
            ],
            'bolehUbah' => $request->user()?->can('update', $posyandu) ?? false,
            'kader' => User::query()
                ->where('is_active', true)
                ->orderByRaw("role = 'ketua' desc")
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'nama' => $user->name,
                    'peran' => $user->role->label(),
                    'noHp' => $user->no_hp,
                    'mejaBiasa' => $user->meja_biasa
                        ? "Meja {$user->meja_biasa->value} · {$user->meja_biasa->tahap()}"
                        : null,
                ]),
        ]);
    }

    public function edit(): Response
    {
        $posyandu = $this->posyandu();
        Gate::authorize('update', $posyandu);

        return Inertia::render('data-posyandu/ubah', [
            'profil' => collect($posyandu->only(self::KOLOM))->map(fn ($nilai) => $nilai ?? ''),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $posyandu = $this->posyandu();
        Gate::authorize('update', $posyandu);

        $posyandu->fill($request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'desa_kelurahan' => ['nullable', 'string', 'max:255'],
            'kecamatan' => ['nullable', 'string', 'max:255'],
            'kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'puskesmas_pembina' => ['nullable', 'string', 'max:255'],
            'alamat' => ['nullable', 'string', 'max:255'],
            'jadwal_kegiatan' => ['nullable', 'string', 'max:255'],
        ], [], [
            'nama' => 'nama posyandu',
            'desa_kelurahan' => 'desa atau kelurahan',
            'kabupaten_kota' => 'kabupaten atau kota',
            'puskesmas_pembina' => 'puskesmas pembina',
            'jadwal_kegiatan' => 'jadwal kegiatan',
        ]))->save();

        Inertia::flash('toast', ['pesan' => 'Profil posyandu disimpan']);

        return redirect()->route('data-posyandu');
    }

    /**
     * Bulan rekap dari query "YYYY-MM"; bawaan dan batas atasnya bulan
     * berjalan (DESIGN 6.5: SKDN bulan berjalan).
     */
    private function bulan(mixed $nilai): CarbonImmutable
    {
        $bulanIni = CarbonImmutable::today()->startOfMonth();

        if (! is_string($nilai) || preg_match('/^(\d{4})-(0[1-9]|1[0-2])$/', $nilai, $cocok) !== 1) {
            return $bulanIni;
        }

        $bulan = CarbonImmutable::create((int) $cocok[1], (int) $cocok[2], 1);

        return $bulan === null || $bulan->greaterThan($bulanIni) || $bulan->year < 2000 ? $bulanIni : $bulan;
    }

    /** Satu instalasi melayani satu posyandu (PRD 12.1). */
    private function posyandu(): Posyandu
    {
        return Posyandu::query()->oldest('id')->firstOrNew();
    }
}
