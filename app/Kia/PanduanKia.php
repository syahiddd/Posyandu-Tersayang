<?php

namespace App\Kia;

/**
 * Acuan isi Buku KIA 2024 untuk Meja 5, Detail Anak, dan halaman Panduan
 * KIA. Seluruh teks diambil dari config/kia.php yang disalin dari buku;
 * kelas ini hanya memilih bagian yang sesuai umur dan status gizi anak.
 *
 * Tindak lanjut selalu berupa anjuran, bukan diagnosis: hasil skrining tetap
 * harus dikonfirmasi tenaga kesehatan (PRD 5.8).
 */
final class PanduanKia
{
    /**
     * Kelompok umur yang berlaku untuk satu umur (bulan penuh).
     *
     * @return array{dari: int, sampai: int, label: string, halaman: string, anjuran: list<string>}|null
     */
    public static function anjuranUmur(int $umurBulan): ?array
    {
        foreach ((array) config('kia.anjuran_umur') as $kelompok) {
            if ($umurBulan >= $kelompok['dari'] && $umurBulan <= $kelompok['sampai']) {
                return $kelompok;
            }
        }

        return null;
    }

    /**
     * Anjuran Buku KIA untuk kelompok umur tertentu, misalnya teks yang
     * ditampilkan di bawah status gizi di Meja 5.
     *
     * @return list<string>
     */
    public static function anjuranUntukUmur(int $umurBulan): array
    {
        return self::anjuranUmur($umurBulan)['anjuran'] ?? [];
    }

    /**
     * Tindak lanjut untuk status gizi anak hari ini, digabung dengan anjuran
     * sesuai umur. Satu kategori yang muncul pada beberapa indeks (misalnya
     * gizi buruk pada BB/TB dan IMT/U) digabung menjadi satu baris.
     *
     * @param  list<array{indeks: string, label: string, kode: string, kategori: string, varian: string, tingkat: int}>  $statusGizi
     * @return list<array{indeks: string, label: string, kode: string, kategori: string, varian: string, tingkat: string, tindakan: list<string>, sumber: string, anjuran: list<string>, halamanAnjuran: string|null}>
     */
    public static function tindakLanjut(int $umurBulan, array $statusGizi): array
    {
        /** @var array<string, array{judul: string, tingkat: string, tindakan: list<string>, sumber: string}> $acuan */
        $acuan = (array) config('kia.tindak_lanjut');
        $kelompokUmur = self::anjuranUmur($umurBulan);
        $hasil = [];

        foreach ($statusGizi as $satu) {
            if ($satu['kode'] === 'normal' || $satu['kode'] === 'tinggi') {
                continue;
            }

            $aturan = $acuan[$satu['kode']] ?? null;

            if ($aturan === null) {
                continue;
            }

            if (isset($hasil[$satu['kode']])) {
                $hasil[$satu['kode']]['label'] .= " & {$satu['label']}";

                continue;
            }

            $hasil[$satu['kode']] = [
                'indeks' => $satu['indeks'],
                'label' => $satu['label'],
                'kode' => $satu['kode'],
                'kategori' => $satu['kategori'],
                'varian' => $satu['varian'],
                'tingkat' => $aturan['tingkat'],
                'tindakan' => $aturan['tindakan'],
                'sumber' => $aturan['sumber'],
                'anjuran' => $kelompokUmur['anjuran'] ?? [],
                'halamanAnjuran' => $kelompokUmur['halaman'] ?? null,
            ];
        }

        // Paling berat lebih dulu: rujuk, tindak lanjut, pantau.
        $urutan = ['rujuk' => 0, 'tindak_lanjut' => 1, 'pantau' => 2];
        $hasil = array_values($hasil);

        usort($hasil, fn (array $a, array $b) => $urutan[$a['tingkat']] <=> $urutan[$b['tingkat']]);

        return $hasil;
    }

    /**
     * Tanda bahaya sesuai kelompok umur (Buku KIA hlm. 40–41 dan 50–51).
     * Bayi baru lahir tidak boleh memakai daftar balita.
     *
     * @return array{dari: int, sampai: int, label: string, halaman: string, daftar: list<string>}|null
     */
    public static function tandaBahaya(int $umurBulan): ?array
    {
        foreach ((array) config('kia.tanda_bahaya') as $kelompok) {
            if ($umurBulan >= $kelompok['dari'] && $umurBulan <= $kelompok['sampai']) {
                return $kelompok;
            }
        }

        return null;
    }

    /**
     * Anjuran MPASI yang berlaku untuk umur anak (Buku KIA hlm. 56–61).
     *
     * @return array{dari: int, sampai: int, label: string, jumlah: string, frekuensi: string, energi: string, tekstur: string, cairan: string}|null
     */
    public static function porsiMpasi(int $umurBulan): ?array
    {
        foreach ((array) config('kia.mpasi.porsi') as $porsi) {
            if ($umurBulan >= $porsi['dari'] && $umurBulan <= $porsi['sampai']) {
                return $porsi;
            }
        }

        return null;
    }

    /**
     * Stimulasi perkembangan sesuai umur (Buku KIA hlm. 52–83).
     *
     * @return array{dari: int, sampai: int, label: string, halaman: string, daftar: list<string>}|null
     */
    public static function stimulasi(int $umurBulan): ?array
    {
        foreach ((array) config('kia.stimulasi') as $kelompok) {
            if ($umurBulan >= $kelompok['dari'] && $umurBulan <= $kelompok['sampai']) {
                return $kelompok;
            }
        }

        return null;
    }

    /**
     * Isi halaman Panduan KIA. Bagian yang bergantung umur ditandai agar
     * halaman dapat menyorot bagian yang sesuai anak yang sedang dibuka.
     *
     * @return array<string, mixed>
     */
    public static function halaman(int $umurBulan): array
    {
        return [
            'umurBulan' => $umurBulan,
            'asi' => config('kia.asi'),
            'mpasi' => config('kia.mpasi'),
            'porsiMpasi' => self::porsiMpasi($umurBulan),
            'anjuranUmur' => self::anjuranUmur($umurBulan),
            'anjuranSemua' => config('kia.anjuran_umur'),
            'tandaBahaya' => self::tandaBahaya($umurBulan),
            'tandaBahayaSemua' => config('kia.tanda_bahaya'),
            'pemantauanBulanan' => config('kia.pemantauan_bulanan'),
            'perawatanSakit' => config('kia.perawatan_sakit'),
            'cairan' => config('kia.cairan'),
            'gigi' => config('kia.gigi'),
            'stimulasi' => self::stimulasi($umurBulan),
            'stimulasiSemua' => config('kia.stimulasi'),
            'tidur' => config('kia.tidur'),
            'tindakLanjut' => collect((array) config('kia.tindak_lanjut'))
                ->map(fn (array $satu, string $kode) => ['kode' => $kode, ...$satu])
                ->values(),
            'tindakLanjutLila' => config('kia.tindak_lanjut_lila'),
        ];
    }
}
