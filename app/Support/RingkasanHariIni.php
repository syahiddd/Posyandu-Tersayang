<?php

namespace App\Support;

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Kunjungan;
use Carbon\CarbonInterface;

/**
 * Angka ringkasan untuk tanggal hari ini (FR-06, FR-07). Dihitung ulang
 * setiap permintaan, sehingga otomatis berganti saat tanggal berganti.
 */
final class RingkasanHariIni
{
    /**
     * @return array{terdaftar: int, sudahDitimbang: int, selesai: int}
     */
    public static function kartu(): array
    {
        return [
            'terdaftar' => Kunjungan::query()->hariIni()->count(),
            // Sudah ditimbang = selesai Meja 2 (FR-06).
            'sudahDitimbang' => Kunjungan::query()->hariIni()
                ->whereNotNull('selesai_meja_2_pada')->count(),
            'selesai' => Kunjungan::query()->hariIni()
                ->where('status', StatusAntrean::Selesai)->count(),
        ];
    }

    /**
     * Jumlah anak menunggu dan ditunda di setiap meja (FR-07).
     *
     * @return list<array{nomor: int, tahap: string, menunggu: int, ditunda: int}>
     */
    public static function antreanPerMeja(): array
    {
        $jumlah = Kunjungan::query()
            ->hariIni()
            ->whereIn('status', [StatusAntrean::Menunggu, StatusAntrean::Ditunda])
            ->selectRaw('meja_saat_ini, status, count(*) as jumlah')
            ->groupBy('meja_saat_ini', 'status')
            ->toBase()
            ->get()
            ->mapWithKeys(fn (object $baris) => [
                $baris->meja_saat_ini.'|'.$baris->status => (int) $baris->jumlah,
            ]);

        return array_map(fn (Meja $meja) => [
            'nomor' => $meja->value,
            'tahap' => $meja->tahap(),
            'menunggu' => $jumlah->get($meja->value.'|'.StatusAntrean::Menunggu->value, 0),
            'ditunda' => $jumlah->get($meja->value.'|'.StatusAntrean::Ditunda->value, 0),
        ], Meja::cases());
    }

    /** Contoh: "Kamis, 5 November 2026". */
    public static function tanggalPanjang(?CarbonInterface $tanggal = null): string
    {
        return ($tanggal ?? today())->locale('id')->translatedFormat('l, j F Y');
    }
}
