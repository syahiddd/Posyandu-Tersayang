<?php

namespace App\Http\Controllers;

use App\Antrean\LayananAntrean;
use App\Antrean\TampilanKunjungan;
use App\Antrean\Urungan;
use App\Enums\CaraUkur;
use App\Enums\Meja;
use App\Enums\SumberData;
use App\Gizi\StatusPenimbangan;
use App\Http\Requests\SimpanPengukuranRequest;
use App\Models\Kunjungan;
use App\Models\Pengukuran;
use App\Support\Tanggal;
use App\Support\Umur;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Meja 2 Pengukuran (PRD 4.4): BB, PB/TB beserta cara ukur, LiLA, LK
 * (FR-18 sampai FR-23).
 */
class PengukuranController extends Controller
{
    /** Umur mulai diukur berdiri (FR-21, PRD 5.6). */
    public const BULAN_MULAI_BERDIRI = 24;

    public function __construct(private LayananAntrean $antrean) {}

    /**
     * Props layar Meja 2 (S09).
     *
     * @return array<string, mixed>
     */
    public static function props(Kunjungan $kunjungan): array
    {
        $anak = $kunjungan->anak;
        $umur = Umur::bulanPenuh($anak->tanggal_lahir, $kunjungan->tanggal);
        $sekarang = $kunjungan->pengukuran;

        // Pembanding: pengukuran terakhir sebelum kunjungan ini, termasuk
        // data yang disalin dari Buku KIA saat pendaftaran.
        $sebelumnya = Pengukuran::query()
            ->where('anak_id', $anak->id)
            ->whereDate('tanggal_ukur', '<=', $kunjungan->tanggal)
            ->when($sekarang, fn ($q) => $q->whereKeyNot($sekarang->id))
            ->where(fn ($q) => $q->whereNull('kunjungan_id')->orWhere('kunjungan_id', '!=', $kunjungan->id))
            ->orderByDesc('tanggal_ukur')
            ->orderByDesc('id')
            ->first();

        $draf = ($kunjungan->draf ?? [])[Meja::Pengukuran->value] ?? null;

        return [
            'anak' => TampilanKunjungan::header($kunjungan),
            'caraUkurBawaan' => ($umur < self::BULAN_MULAI_BERDIRI ? CaraUkur::Telentang : CaraUkur::Berdiri)->value,
            'nilaiAwal' => $sekarang ? [
                'bb' => self::koma($sekarang->bb),
                'pb_tb' => self::koma($sekarang->pb_tb),
                'cara_ukur' => $sekarang->cara_ukur?->value,
                'lila' => self::koma($sekarang->lila),
                'lk' => self::koma($sekarang->lk),
            ] : $draf,
            'sebelumnya' => $sebelumnya ? [
                'tanggal' => Tanggal::pendek($sebelumnya->tanggal_ukur),
                'sumber' => $sebelumnya->sumber->value,
                'bb' => $sebelumnya->bb,
                'pb_tb' => $sebelumnya->pb_tb,
                'lila' => $sebelumnya->lila,
                'lk' => $sebelumnya->lk,
            ] : null,
        ];
    }

    public function update(SimpanPengukuranRequest $request, Kunjungan $kunjungan): RedirectResponse
    {
        $this->antrean->pastikanDipegang($kunjungan, $request->user());

        if ($kunjungan->meja_saat_ini !== Meja::Pengukuran) {
            throw ValidationException::withMessages(['kunjungan' => 'Anak ini tidak sedang di Meja 2.']);
        }

        $data = $request->validated();
        $sebelum = Urungan::potret($kunjungan);

        DB::transaction(function () use ($kunjungan, $data, $request) {
            $pengukuran = Pengukuran::query()->updateOrCreate(
                ['kunjungan_id' => $kunjungan->id],
                [
                    'anak_id' => $kunjungan->anak_id,
                    'tanggal_ukur' => $kunjungan->tanggal->toDateString(),
                    'sumber' => SumberData::Posyandu,
                    'bb' => $data['bb'],
                    'pb_tb' => $data['pb_tb'],
                    'cara_ukur' => $data['cara_ukur'],
                    'lila' => $data['lila'] ?? null,
                    'lk' => $data['lk'] ?? null,
                ],
            );

            $penimbangan = StatusPenimbangan::hitung(
                $kunjungan->anak,
                $kunjungan->tanggal,
                (float) $data['bb'],
                $pengukuran->id,
            );
            $pengukuran->update(['status_nt' => $penimbangan['status']]);

            $this->antrean->teruskan($kunjungan, $request->user());
        });

        Urungan::catat($request, $kunjungan, $sebelum);
        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} tersimpan · masuk Meja 3",
            'batal' => true,
        ]);

        return redirect()->route('meja', Meja::Pengukuran->value);
    }

    private static function koma(?string $nilai): ?string
    {
        return $nilai === null ? null : str_replace('.', ',', $nilai);
    }
}
