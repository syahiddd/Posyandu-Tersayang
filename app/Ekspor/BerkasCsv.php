<?php

namespace App\Ekspor;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Berkas CSV sesuai PRD 7.3: UTF-8 dengan BOM, pemisah titik koma, tanggal
 * DD/MM/YYYY, nama berkas berisi jenis data dan tanggal unduh, serta NIK
 * dan nomor HP lengkap sebagai teks agar digit tidak berubah. Dipakai Data
 * Anak (FR-54), lalu Rekap Imunisasi dan Data Posyandu.
 */
final class BerkasCsv
{
    private const BOM = "\xEF\xBB\xBF";

    /**
     * @param  list<string>  $kepala
     * @param  iterable<array<int, string|int|null>>  $baris
     */
    public static function unduh(string $jenis, array $kepala, iterable $baris): StreamedResponse
    {
        return response()->streamDownload(function () use ($kepala, $baris) {
            $keluaran = fopen('php://output', 'w');

            if ($keluaran === false) {
                return;
            }

            fwrite($keluaran, self::BOM);
            self::tulis($keluaran, $kepala);

            foreach ($baris as $satu) {
                self::tulis($keluaran, $satu);
            }

            fclose($keluaran);
        }, self::namaBerkas($jenis), [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /** Contoh: data-anak_03-11-2026.csv (PRD 7.3). */
    public static function namaBerkas(string $jenis, ?CarbonInterface $pada = null): string
    {
        return $jenis.'_'.($pada ?? today())->format('d-m-Y').'.csv';
    }

    /** Tanggal DD/MM/YYYY. */
    public static function tanggal(CarbonInterface|string|null $tanggal): string
    {
        if ($tanggal === null) {
            return '';
        }

        return (is_string($tanggal) ? CarbonImmutable::parse($tanggal) : $tanggal)->format('d/m/Y');
    }

    /**
     * Angka panjang yang harus tetap teks di lembar kerja (NIK, nomor HP):
     * ditulis sebagai rumus ="…" sehingga nol di depan dan digit ke-16 tidak
     * berubah.
     */
    public static function teks(?string $nilai): string
    {
        return $nilai === null || $nilai === '' ? '' : '="'.$nilai.'"';
    }

    /**
     * @param  resource  $keluaran
     * @param  array<int, string|int|null>  $kolom
     */
    private static function tulis($keluaran, array $kolom): void
    {
        fputcsv($keluaran, $kolom, ';', '"', '', "\r\n");
    }
}
