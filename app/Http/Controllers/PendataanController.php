<?php

namespace App\Http\Controllers;

use App\Antrean\LayananAntrean;
use App\Antrean\TampilanKunjungan;
use App\Antrean\Urungan;
use App\Enums\Meja;
use App\Gizi\PengukuranSebelumnya;
use App\Gizi\StatusPenimbangan;
use App\Models\Kunjungan;
use App\Models\Pendataan;
use App\Support\Tanggal;
use App\Support\Umur;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Meja 3 Pendataan (PRD 4.5): hasil ukur hanya dibaca untuk disalin ke
 * Buku KIA, dengan perbandingan, status N/T, dan ASI eksklusif
 * (FR-24 sampai FR-29).
 */
class PendataanController extends Controller
{
    /** ASI eksklusif diisi untuk anak umur 0 sampai 6 bulan (FR-27). */
    public const BULAN_MAKS_ASI = 6;

    public function __construct(private LayananAntrean $antrean) {}

    /**
     * Props layar Meja 3 (S10).
     *
     * @return array<string, mixed>
     */
    public static function props(Kunjungan $kunjungan): array
    {
        $anak = $kunjungan->anak;
        $umur = Umur::bulanPenuh($anak->tanggal_lahir, $kunjungan->tanggal);
        $sekarang = $kunjungan->pengukuran;
        $sebelumnya = PengukuranSebelumnya::untuk($kunjungan);

        $penimbangan = $sekarang?->bb !== null
            ? StatusPenimbangan::hitung($anak, $kunjungan->tanggal, (float) $sekarang->bb, $sekarang->id)
            : null;

        $asiTerakhir = Pendataan::query()
            ->whereNotNull('asi_eksklusif')
            ->whereHas('kunjungan', fn ($q) => $q
                ->where('anak_id', $anak->id)
                ->whereKeyNot($kunjungan->id))
            ->with('kunjungan')
            ->latest('id')
            ->first();

        $draf = ($kunjungan->draf ?? [])[Meja::Pendataan->value] ?? null;
        $asiSekarang = $kunjungan->pendataan?->asi_eksklusif;

        return [
            'anak' => TampilanKunjungan::header($kunjungan),
            'sekarang' => $sekarang ? [
                'bb' => $sekarang->bb,
                'pb_tb' => $sekarang->pb_tb,
                'cara_ukur' => $sekarang->cara_ukur?->value,
                'lila' => $sekarang->lila,
                'lk' => $sekarang->lk,
            ] : null,
            'sebelumnya' => $sebelumnya ? [
                'tanggal' => Tanggal::pendek($sebelumnya->tanggal_ukur),
                'bb' => $sebelumnya->bb,
                'pb_tb' => $sebelumnya->pb_tb,
                'lila' => $sebelumnya->lila,
                'lk' => $sebelumnya->lk,
            ] : null,
            'penimbangan' => $penimbangan ? [
                'status' => $penimbangan['status']?->value,
                'kenaikanGram' => $penimbangan['kenaikanGram'],
                'kbmGram' => $penimbangan['kbmGram'],
            ] : null,
            'asi' => [
                'isian' => $umur <= self::BULAN_MAKS_ASI,
                'nilai' => $asiSekarang ?? (isset($draf['asi_eksklusif']) ? $draf['asi_eksklusif'] === 'ya' : null),
                'terakhir' => $asiTerakhir ? [
                    'nilai' => $asiTerakhir->asi_eksklusif,
                    'tanggal' => Tanggal::singkat($asiTerakhir->kunjungan->tanggal),
                ] : null,
            ],
        ];
    }

    /** "Sudah disalin ke KIA": anak masuk antrean Meja 4 (FR-27, FR-29). */
    public function simpan(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        $this->pastikanDiMeja3($kunjungan, $request);

        $data = $request->validate([
            'asi_eksklusif' => ['nullable', 'in:ya,tidak'],
        ]);

        $umur = Umur::bulanPenuh($kunjungan->anak->tanggal_lahir, $kunjungan->tanggal);
        $sebelum = Urungan::potret($kunjungan);

        DB::transaction(function () use ($kunjungan, $data, $umur, $request) {
            Pendataan::query()->updateOrCreate(
                ['kunjungan_id' => $kunjungan->id],
                [
                    'asi_eksklusif' => $umur <= self::BULAN_MAKS_ASI && isset($data['asi_eksklusif'])
                        ? $data['asi_eksklusif'] === 'ya'
                        : null,
                    'disalin_ke_kia_pada' => now(),
                ],
            );

            $this->antrean->teruskan($kunjungan, $request->user());
        });

        Urungan::catat($request, $kunjungan, $sebelum);
        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} sudah disalin · masuk Meja 4",
            'batal' => true,
        ]);

        return redirect()->route('meja', Meja::Pendataan->value);
    }

    /** Data keliru: kembalikan ke antrean Meja 2 dengan alasan (FR-28). */
    public function kembalikan(Request $request, Kunjungan $kunjungan): RedirectResponse
    {
        $this->pastikanDiMeja3($kunjungan, $request);

        $data = $request->validate([
            'alasan' => ['required', 'string', 'max:255'],
        ]);

        $sebelum = Urungan::potret($kunjungan);
        $this->antrean->kembalikanKePengukuran($kunjungan, $request->user(), $data['alasan']);
        Urungan::catat($request, $kunjungan, $sebelum);

        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} dikembalikan ke Meja 2",
            'batal' => true,
        ]);

        return redirect()->route('meja', Meja::Pendataan->value);
    }

    private function pastikanDiMeja3(Kunjungan $kunjungan, Request $request): void
    {
        $this->antrean->pastikanDipegang($kunjungan, $request->user());

        if ($kunjungan->meja_saat_ini !== Meja::Pendataan) {
            throw ValidationException::withMessages(['kunjungan' => 'Anak ini tidak sedang di Meja 3.']);
        }
    }
}
