<?php

namespace App\Pelayanan;

/**
 * Jadwal imunisasi bayi dan baduta bersama (Buku KIA 2024 halaman 123 sampai
 * 125; PRD Tabel 29, FR-30). Dipakai Meja 4 untuk menawarkan dosis kepada
 * kader dan Data Anak untuk menandai anak yang belum lengkap (FR-70).
 *
 * Tiap rangkaian vaksin hanya menawarkan dosis berikutnya yang belum tercatat,
 * selama umur anak masih dalam batas umur yang diperbolehkan tabel Pelayanan
 * Imunisasi. Logika ini disimpan di satu tempat agar layar-layar tidak
 * menyimpang satu sama lain.
 *
 * @phpstan-type Vaksin array{nama: string, umur_bulan: int, kelompok: string, umur_maks: int, khusus_endemis?: bool}
 * @phpstan-type Dosis array{kode: string, nama: string, umurBulan: int, kelompok: string, terlambat: bool, khususEndemis: bool}
 */
final class JadwalImunisasi
{
    /**
     * Dosis yang jatuh tempo dan belum tercatat untuk umur (bulan penuh)
     * tertentu, termasuk dosis yang terlambat (kejar). Urut sesuai jadwal.
     *
     * @param  list<string>  $sudahTercatat  Kode dosis yang sudah tercatat di layanan.
     * @return list<Dosis>
     */
    public static function jatuhTempo(int $umurBulan, array $sudahTercatat): array
    {
        /** @var array<string, Vaksin> $vaksin */
        $vaksin = config('imunisasi.vaksin');

        $sudah = array_flip($sudahTercatat);

        $daftar = [];
        $kelompokSelesai = [];

        foreach ($vaksin as $kode => $satu) {
            if (isset($sudah[$kode]) || isset($kelompokSelesai[$satu['kelompok']])) {
                continue;
            }

            // Dosis pertama yang belum tercatat menentukan rangkaian ini.
            $kelompokSelesai[$satu['kelompok']] = true;

            if ($umurBulan < $satu['umur_bulan'] || $umurBulan > $satu['umur_maks']) {
                continue;
            }

            $daftar[] = [
                'kode' => $kode,
                'nama' => $satu['nama'],
                'umurBulan' => $satu['umur_bulan'],
                'kelompok' => $satu['kelompok'],
                'terlambat' => $umurBulan > $satu['umur_bulan'],
                'khususEndemis' => $satu['khusus_endemis'] ?? false,
            ];
        }

        return $daftar;
    }
}
