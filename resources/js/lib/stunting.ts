/**
 * Penyajian status stunting (PRD 5.8, Tabel 28; FR-42): aman, rentan, atau
 * stunting. Warna hijau–kuning–merah dipakai konsisten di Meja 5 dan Data
 * Anak, dan selalu disertai teks agar warna bukan satu-satunya penanda.
 */

import type { VarianChip } from '@/components/dasar/chip-status';
import type { HasilStunting } from '@/types';

export type TingkatStunting = 'aman' | 'rentan' | 'stunting';

/**
 * Tiga tingkat untuk kader: normal = aman, berisiko/diprediksi berisiko =
 * rentan (kuning), stunting = merah.
 */
export function tingkatStunting(hasil: HasilStunting): TingkatStunting {
    if (hasil === 'stunting') {
        return 'stunting';
    }

    return hasil === 'normal' ? 'aman' : 'rentan';
}

/** Label pendek tingkat, misalnya "Aman dari stunting". */
export const LABEL_TINGKAT_STUNTING: Record<TingkatStunting, string> = {
    aman: 'Aman dari stunting',
    rentan: 'Rentan stunting',
    stunting: 'Stunting',
};

/** Penjelasan satu kalimat, mengikuti Tabel 28 PRD. */
export const KETERANGAN_TINGKAT_STUNTING: Record<TingkatStunting, string> = {
    aman: 'Pertumbuhan panjang/tinggi badan anak sesuai umurnya.',
    rentan: 'Ada tanda risiko; perlu penyuluhan gizi dan pemantauan tiap bulan.',
    stunting: 'Perlu rujukan ke puskesmas untuk konfirmasi tenaga kesehatan.',
};

/** Varian chip yang sepadan: hijau, kuning, merah. */
export const VARIAN_TINGKAT_STUNTING: Record<TingkatStunting, VarianChip> = {
    aman: 'normal',
    rentan: 'waspada',
    stunting: 'bahaya',
};

/** Kelas latar kartu ringkas: hijau / kuning / merah muda. */
export const KELAS_TINGKAT_STUNTING: Record<TingkatStunting, string> = {
    aman: 'border-status-normal-teks/30 bg-status-normal-latar text-status-normal-teks',
    rentan: 'border-status-waspada-teks/30 bg-status-waspada-latar text-status-waspada-teks',
    stunting:
        'border-status-bahaya-teks/30 bg-status-bahaya-latar text-status-bahaya-teks',
};
