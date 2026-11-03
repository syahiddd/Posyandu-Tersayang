import { formatDesimal } from './desimal';

/**
 * Selisih nilai ukur hari ini dengan kunjungan sebelumnya (FR-25):
 * naik, tetap, atau turun, dibulatkan satu angka di belakang koma.
 */
export type Perubahan = { arah: 'naik' | 'tetap' | 'turun'; selisih: number };

export function perubahan(
    sekarang: string | null,
    lalu: string | null,
): Perubahan | null {
    if (sekarang === null || lalu === null) {
        return null;
    }

    const selisih = Math.round((Number(sekarang) - Number(lalu)) * 10) / 10;

    if (selisih === 0) {
        return { arah: 'tetap', selisih: 0 };
    }

    return { arah: selisih > 0 ? 'naik' : 'turun', selisih: Math.abs(selisih) };
}

/** Teks tampilan, misalnya "▲ +0,2 kg dari 8 Okt" (DESIGN Gambar 5). */
export function teksPerubahan(
    hasil: Perubahan,
    satuan: string,
    tanggal: string,
): string {
    if (hasil.arah === 'tetap') {
        return `Tetap sejak ${tanggal}`;
    }

    const tanda = hasil.arah === 'naik' ? '▲ +' : '▼ -';

    return `${tanda}${formatDesimal(hasil.selisih)} ${satuan} dari ${tanggal}`;
}

/** Status penimbangan, misalnya "+200 g ≥ KBM 200 g" (FR-26). */
export function teksKbm(kenaikanGram: number, kbmGram: number): string {
    const tanda = kenaikanGram > 0 ? '+' : '';
    const banding = kenaikanGram >= kbmGram ? '≥' : '<';

    return `${tanda}${kenaikanGram} g ${banding} KBM ${kbmGram} g`;
}
