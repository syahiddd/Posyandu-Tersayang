<?php

namespace App\Antrean;

use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Tombol Batal selama 5 detik setelah tindakan antrean (DESIGN Prinsip 1).
 *
 * Keadaan kunjungan sebelum dan sesudah tindakan disimpan di sesi kader
 * yang bertindak. Pembatalan hanya berlaku bila masih dalam 5 detik dan
 * kunjungan belum diubah oleh kader lain.
 */
final class Urungan
{
    public const DETIK = 5;

    /** Toleransi jeda jaringan antara toast muncul dan permintaan Batal. */
    private const DETIK_TOLERANSI = 2;

    private const KUNCI_SESI = 'urungan';

    private const KOLOM = [
        'meja_saat_ini', 'status', 'dibuka_oleh', 'dibuka_pada', 'masuk_meja_pada',
        'ditunda_pada', 'selesai_meja_1_pada', 'selesai_meja_2_pada', 'selesai_meja_3_pada',
        'selesai_meja_4_pada', 'selesai_meja_5_pada', 'draf', 'perlu_ukur_ulang', 'alasan_kembali',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function potret(Kunjungan $kunjungan): array
    {
        return Arr::only($kunjungan->getAttributes(), self::KOLOM);
    }

    /**
     * @param  array<string, mixed>|null  $sebelum  Null berarti Batal menghapus kunjungan baru.
     */
    public static function catat(Request $request, Kunjungan $kunjungan, ?array $sebelum): void
    {
        $request->session()->put(self::KUNCI_SESI, [
            'kunjungan_id' => $kunjungan->id,
            'sebelum' => $sebelum,
            'sesudah' => self::potret($kunjungan->refresh()),
            'batas' => now()->addSeconds(self::DETIK + self::DETIK_TOLERANSI)->getTimestamp(),
        ]);
    }

    /**
     * Mengembalikan kunjungan ke keadaan sebelum tindakan terakhir.
     * Mengembalikan null bila kunjungan dihapus (pembukaan kunjungan dibatalkan).
     */
    public static function urungkan(Request $request): ?Kunjungan
    {
        /** @var array{kunjungan_id: int, sebelum: array<string, mixed>|null, sesudah: array<string, mixed>, batas: int}|null $data */
        $data = $request->session()->pull(self::KUNCI_SESI);

        if ($data === null || now()->getTimestamp() > $data['batas']) {
            throw ValidationException::withMessages(['urungan' => 'Waktu untuk membatalkan sudah habis.']);
        }

        $hasil = DB::transaction(function () use ($data) {
            $kunjungan = Kunjungan::query()->lockForUpdate()->find($data['kunjungan_id']);

            if ($kunjungan === null || self::potret($kunjungan) != $data['sesudah']) {
                throw ValidationException::withMessages([
                    'urungan' => 'Tidak bisa dibatalkan karena anak sudah diproses kader lain.',
                ]);
            }

            $mejaSesudah = $kunjungan->meja_saat_ini->value;

            if ($data['sebelum'] === null) {
                $kunjungan->delete();

                return [null, [$mejaSesudah]];
            }

            $kunjungan->setRawAttributes(array_merge($kunjungan->getAttributes(), $data['sebelum']));
            $kunjungan->save();

            return [$kunjungan->refresh(), [$mejaSesudah, $kunjungan->meja_saat_ini->value]];
        });

        [$kunjungan, $meja] = $hasil;
        SiarAntrean::kabari(...$meja);

        return $kunjungan;
    }
}
