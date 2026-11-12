<?php

namespace App\Gizi;

use App\Enums\HasilDeteksiStunting;
use App\Enums\StatusNT;
use Carbon\CarbonImmutable;

/**
 * Deteksi dan prediksi risiko stunting (PRD 5.8, Tabel 28; FR-42).
 * Skrining, bukan diagnosis: hasil selalu disertai anjuran konfirmasi oleh
 * tenaga kesehatan.
 *
 * Masukan adalah riwayat dari HasilAntropometri::riwayat(), urut tanggal
 * naik; elemen terakhir adalah pengukuran yang dinilai.
 *
 * Pengukuran bertanda "perlu ukur ulang" (z-score di luar batas wajar, PRD
 * 5.6) tidak dipakai. Bila pengukuran yang dinilai sendiri tidak wajar,
 * hasilnya null: belum dapat dinilai sampai anak diukur ulang.
 *
 * @phpstan-type Riwayat array{tanggal: string, umurBulan: int, zscore: array<string, float|null>, statusNt: string|null, perluUkurUlang?: bool}
 */
final class DeteksiStunting
{
    /** Prediksi memakai pengukuran dalam 6 bulan terakhir, minimal 3. */
    public const BULAN_TREN = 6;

    public const MIN_TITIK_TREN = 3;

    /** Perkiraan z-score PB/U atau TB/U 3 bulan ke depan. */
    public const BULAN_PREDIKSI = 3;

    /**
     * @param  list<Riwayat>  $riwayat
     * @return array{hasil: HasilDeteksiStunting|null, judul: string, alasan: string|null, tindakan: string}
     */
    public static function nilai(array $riwayat): array
    {
        if ($riwayat === []) {
            return self::hasil(HasilDeteksiStunting::Normal, null);
        }

        if ($riwayat[count($riwayat) - 1]['perluUkurUlang'] ?? false) {
            return [
                'hasil' => null,
                'judul' => 'Belum dapat dinilai',
                'alasan' => 'Pengukuran terakhir di luar batas wajar standar WHO',
                'tindakan' => 'Ukur ulang anak, lalu nilai kembali',
            ];
        }

        $riwayat = array_values(array_filter($riwayat, fn (array $ukur) => ! ($ukur['perluUkurUlang'] ?? false)));

        $terbaru = $riwayat[count($riwayat) - 1];
        $zPanjang = $terbaru['zscore']['pb_tb_u'] ?? null;
        $label = $terbaru['umurBulan'] < 24 ? 'PB/U' : 'TB/U';

        if ($zPanjang !== null && $zPanjang < -2) {
            return self::hasil(
                HasilDeteksiStunting::Stunting,
                "{$label} z ".self::angka($zPanjang).($zPanjang < -3 ? ' (sangat pendek)' : ' (pendek)'),
            );
        }

        $alasanBerisiko = self::alasanBerisiko($riwayat, $label);

        if ($alasanBerisiko !== null) {
            return self::hasil(HasilDeteksiStunting::BerisikoStunting, $alasanBerisiko);
        }

        $perkiraan = self::perkiraan($riwayat);

        if ($perkiraan !== null && $perkiraan < -2) {
            return self::hasil(
                HasilDeteksiStunting::DiprediksiBerisiko,
                "Perkiraan {$label} ".self::BULAN_PREDIKSI.' bulan lagi z '.self::angka($perkiraan).' bila tren berlanjut',
            );
        }

        return self::hasil(HasilDeteksiStunting::Normal, null);
    }

    /**
     * Berisiko: PB/U atau TB/U antara −2 dan −1 dengan z-score turun pada
     * dua kunjungan berturut-turut, status T dua bulan berturut-turut, atau
     * BB/U < −2 SD.
     *
     * @param  list<Riwayat>  $riwayat
     */
    private static function alasanBerisiko(array $riwayat, string $label): ?string
    {
        $terbaru = $riwayat[count($riwayat) - 1];
        $zPanjang = $terbaru['zscore']['pb_tb_u'] ?? null;

        $skor = array_values(array_filter(
            array_map(fn (array $ukur) => $ukur['zscore']['pb_tb_u'] ?? null, $riwayat),
            fn (?float $z) => $z !== null,
        ));
        $tigaTerakhir = array_slice($skor, -3);

        if ($zPanjang !== null && $zPanjang >= -2 && $zPanjang <= -1
            && count($tigaTerakhir) === 3
            && $tigaTerakhir[0] > $tigaTerakhir[1] && $tigaTerakhir[1] > $tigaTerakhir[2]) {
            return "{$label} z ".self::angka($zPanjang).' dan turun dua kunjungan berturut-turut';
        }

        $statusNt = array_values(array_filter(
            array_map(fn (array $ukur) => $ukur['statusNt'] ?? null, $riwayat),
            fn (?string $status) => $status !== null,
        ));
        $duaTerakhir = array_slice($statusNt, -2);

        if (($terbaru['statusNt'] ?? null) === StatusNT::TidakNaik->value
            && $duaTerakhir === [StatusNT::TidakNaik->value, StatusNT::TidakNaik->value]) {
            return 'Berat badan tidak naik (T) dua bulan berturut-turut';
        }

        $zBerat = $terbaru['zscore']['bb_u'] ?? null;

        if ($zBerat !== null && $zBerat < -2) {
            return 'BB/U z '.self::angka($zBerat).' (berat badan kurang)';
        }

        return null;
    }

    /**
     * Tren linear z-score PB/U atau TB/U dari pengukuran 6 bulan terakhir,
     * diperkirakan 3 bulan setelah pengukuran terbaru.
     *
     * @param  list<Riwayat>  $riwayat
     */
    public static function perkiraan(array $riwayat): ?float
    {
        if ($riwayat === []) {
            return null;
        }

        $terbaru = CarbonImmutable::parse($riwayat[count($riwayat) - 1]['tanggal']);
        $batas = $terbaru->subMonthsNoOverflow(self::BULAN_TREN);

        $titik = [];

        foreach ($riwayat as $ukur) {
            $z = $ukur['zscore']['pb_tb_u'] ?? null;
            $tanggal = CarbonImmutable::parse($ukur['tanggal']);

            if ($z !== null && $tanggal->greaterThanOrEqualTo($batas)) {
                // Sumbu x dalam hari sejak pengukuran terbaru (≤ 0).
                $titik[] = [(float) $terbaru->diffInDays($tanggal, false), $z];
            }
        }

        if (count($titik) < self::MIN_TITIK_TREN) {
            return null;
        }

        $rataX = array_sum(array_column($titik, 0)) / count($titik);
        $rataY = array_sum(array_column($titik, 1)) / count($titik);
        $atas = 0.0;
        $bawah = 0.0;

        foreach ($titik as [$x, $y]) {
            $atas += ($x - $rataX) * ($y - $rataY);
            $bawah += ($x - $rataX) ** 2;
        }

        if ($bawah == 0.0) {
            return null;
        }

        $target = (float) $terbaru->diffInDays($terbaru->addMonthsNoOverflow(self::BULAN_PREDIKSI));

        return round($rataY + ($atas / $bawah) * ($target - $rataX), 2);
    }

    /**
     * Judul dan tindakan dari PRD Tabel 28.
     *
     * @return array{hasil: HasilDeteksiStunting, judul: string, alasan: string|null, tindakan: string}
     */
    private static function hasil(HasilDeteksiStunting $hasil, ?string $alasan): array
    {
        [$judul, $tindakan] = match ($hasil) {
            HasilDeteksiStunting::Stunting => ['Stunting', 'Rujuk ke puskesmas untuk konfirmasi, catatan tindak lanjut wajib diisi'],
            HasilDeteksiStunting::BerisikoStunting => ['Berisiko stunting', 'Penyuluhan gizi, pantau setiap bulan'],
            HasilDeteksiStunting::DiprediksiBerisiko => ['Diprediksi berisiko stunting bila tren berlanjut', 'Penyuluhan dan pemantauan lebih ketat'],
            HasilDeteksiStunting::Normal => ['Normal', 'Lanjutkan pemantauan rutin'],
        };

        return compact('hasil', 'judul', 'alasan', 'tindakan');
    }

    /** Contoh: −2,31 (minus tipografis dan koma desimal). */
    public static function angka(float $nilai): string
    {
        $teks = number_format(abs($nilai), 2, ',', '');

        return ($nilai < 0 ? '−' : ($nilai > 0 ? '+' : '')).$teks;
    }
}
