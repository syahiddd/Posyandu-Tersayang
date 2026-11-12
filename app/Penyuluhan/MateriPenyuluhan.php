<?php

namespace App\Penyuluhan;

use App\Enums\HasilDeteksiStunting;
use App\Enums\StatusNT;

/**
 * Rekomendasi materi penyuluhan sesuai kondisi anak (PRD 6.4 Tabel 32,
 * FR-44). Kader tetap dapat menghapus, memilih, atau menambah materi.
 */
final class MateriPenyuluhan
{
    /** Pengamatan kader memunculkan materi ini (PRD Tabel 32). */
    public const MATERI_PENGAMATAN = [
        'fisik' => 'perawatan_anak_sakit',
        'motorik' => 'stimulasi_motorik',
    ];

    /**
     * Kode materi yang direkomendasikan dari hasil kunjungan.
     *
     * @param  array<string, array{kode: string}|null>  $kategori  Kategori per indeks dari HasilAntropometri.
     * @param  list<string>  $pengamatanFisik
     * @param  list<string>  $pengamatanMotorik
     * @return list<string>
     */
    public static function rekomendasi(
        int $umurBulan,
        array $kategori,
        ?string $statusNt,
        HasilDeteksiStunting $stunting,
        bool $imunisasiTertunda,
        array $pengamatanFisik = [],
        array $pengamatanMotorik = [],
    ): array {
        $kode = fn (string $indeks) => $kategori[$indeks]['kode'] ?? null;

        $syarat = [
            'asi_eksklusif' => $umurBulan <= 6,
            'mpasi' => $umurBulan >= 6 && $umurBulan < 24,
            'pemenuhan_gizi' => $statusNt === StatusNT::TidakNaik->value
                || in_array($kode('bb_u'), ['kurang', 'sangat_kurang'], true),
            'cegah_stunting' => $stunting !== HasilDeteksiStunting::Normal
                || in_array($kode('pb_tb_u'), ['pendek', 'sangat_pendek'], true),
            'pola_makan_seimbang' => in_array($kode('bb_pb_tb'), ['gizi_lebih', 'obesitas'], true)
                || in_array($kode('imt_u'), ['gizi_lebih', 'obesitas'], true),
            'perawatan_anak_sakit' => $pengamatanFisik !== [],
            'stimulasi_motorik' => $pengamatanMotorik !== [],
            'imunisasi_lengkap' => $imunisasiTertunda,
        ];

        return array_keys(array_filter($syarat));
    }
}
