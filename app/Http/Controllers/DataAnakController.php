<?php

namespace App\Http\Controllers;

use App\Anak\KelompokUmur;
use App\Anak\PencarianAnak;
use App\Anak\TampilanDetailAnak;
use App\Antrean\TampilanAnak;
use App\Enums\JenisKelamin;
use App\Enums\StatusAntrean;
use App\Http\Requests\UbahAnakRequest;
use App\Models\Anak;
use App\Models\User;
use App\Support\Tanggal;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
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
            'jumlahTerhapus' => fn () => $request->user()?->can('viewTrashed', Anak::class)
                ? Anak::onlyTrashed()->count()
                : null,
            'daftarKelompokUmur' => array_map(
                fn (KelompokUmur $kelompok) => ['nilai' => $kelompok->value, 'label' => $kelompok->label()],
                KelompokUmur::cases(),
            ),
        ]);
    }

    /** S15 Detail Anak: tab Ringkasan, Grafik, dan Riwayat (FR-51). */
    public function show(Request $request, Anak $anak): Response
    {
        return Inertia::render('data-anak/detail', [
            'bolehHapus' => $request->user()?->can('delete', $anak) ?? false,
            'anak' => TampilanDetailAnak::identitas($anak),
            'pengukuran' => TampilanDetailAnak::pengukuran($anak),
            'kunjungan' => TampilanDetailAnak::kunjungan($anak),
            'layanan' => TampilanDetailAnak::layanan($anak),
            'perubahanTerakhir' => TampilanDetailAnak::perubahanTerakhir($anak),
        ]);
    }

    /** S16 Ubah Data Anak (FR-52). */
    public function edit(Anak $anak): Response
    {
        return Inertia::render('data-anak/ubah', [
            'anak' => TampilanDetailAnak::isian($anak),
            'hariIni' => today()->toDateString(),
            'daftarDusun' => Anak::query()->distinct()->orderBy('dusun')->pluck('dusun'),
        ]);
    }

    /** Perubahan dicatat di log aktivitas beserta akun dan waktunya (NFR-06). */
    public function update(UbahAnakRequest $request, Anak $anak): RedirectResponse
    {
        $anak->update(collect($request->validated())->only(UbahAnakRequest::KOLOM_IDENTITAS)->all());

        Inertia::flash('toast', [
            'pesan' => $anak->wasChanged() ? "Data {$anak->nama} disimpan" : 'Tidak ada perubahan',
        ]);

        return redirect()->route('data-anak.detail', $anak);
    }

    /**
     * Ketua Kader menghapus data anak setelah mengetik namanya (FR-53).
     * Data dapat dipulihkan selama 30 hari lalu terhapus permanen (prune).
     */
    public function destroy(Request $request, Anak $anak): RedirectResponse
    {
        Gate::authorize('delete', $anak);

        $request->validate(['konfirmasi' => ['required', 'string']]);

        if (mb_strtolower(trim((string) $request->input('konfirmasi'))) !== mb_strtolower(trim($anak->nama))) {
            throw ValidationException::withMessages(['konfirmasi' => 'Nama yang diketik tidak sama dengan nama anak.']);
        }

        $masihDiAntrean = $anak->kunjungan()
            ->whereDate('tanggal', today())
            ->where('status', '!=', StatusAntrean::Selesai)
            ->exists();

        if ($masihDiAntrean) {
            throw ValidationException::withMessages([
                'konfirmasi' => "{$anak->nama} masih di antrean hari ini. Selesaikan kunjungannya dulu.",
            ]);
        }

        $anak->delete();

        Inertia::flash('toast', ['pesan' => "Data {$anak->nama} dihapus. Dapat dipulihkan dalam ".Anak::HARI_PULIH.' hari.']);

        return redirect()->route('data-anak');
    }

    /** Daftar anak terhapus yang masih dapat dipulihkan, khusus Ketua Kader (FR-53). */
    public function terhapus(): Response
    {
        Gate::authorize('viewTrashed', Anak::class);

        $anak = Anak::onlyTrashed()
            ->with(['activitiesAsSubject' => fn ($q) => $q->where('event', 'deleted')->latest('id')->with('causer')])
            ->orderByDesc('deleted_at')
            ->get()
            ->map(function (Anak $anak) {
                $hapus = $anak->activitiesAsSubject->first();
                $oleh = $hapus?->causer;
                $deletedAt = $anak->deleted_at ?? now();

                return [
                    ...TampilanAnak::ringkas($anak),
                    'dihapusPada' => Tanggal::singkat($deletedAt),
                    'dihapusOleh' => $oleh instanceof User ? $oleh->name : null,
                    'sisaHari' => max(0, Anak::HARI_PULIH - (int) $deletedAt->startOfDay()->diffInDays(today())),
                ];
            });

        return Inertia::render('data-anak/terhapus', ['anak' => $anak]);
    }

    public function pulihkan(Anak $anak): RedirectResponse
    {
        Gate::authorize('restore', $anak);

        $anak->restore();

        Inertia::flash('toast', ['pesan' => "Data {$anak->nama} dipulihkan"]);

        return redirect()->route('data-anak.detail', $anak);
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
