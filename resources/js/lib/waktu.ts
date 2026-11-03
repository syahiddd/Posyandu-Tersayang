/**
 * Lama sejak suatu waktu, misalnya lama penundaan (FR-49) atau lama anak
 * dibuka kader lain.
 */
export function lamaSejak(iso: string, sekarang: Date = new Date()): string {
    const menit = Math.max(
        0,
        Math.floor((sekarang.getTime() - new Date(iso).getTime()) / 60_000),
    );

    if (menit < 1) {
        return 'kurang dari 1 menit';
    }

    if (menit < 60) {
        return `${menit} menit`;
    }

    const jam = Math.floor(menit / 60);
    const sisa = menit % 60;

    return sisa === 0 ? `${jam} jam` : `${jam} jam ${sisa} menit`;
}

/** Inisial dua huruf untuk avatar kartu anak, misalnya "Nayla Putri" → "NP". */
export function inisial(nama: string): string {
    return nama
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((kata) => kata.charAt(0).toUpperCase())
        .join('');
}
