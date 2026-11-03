/**
 * Angka desimal isian ukur (FR-20, PRD 7.2): koma maupun titik diterima,
 * disimpan dalam satu format, maksimal satu angka di belakang koma.
 */
const POLA_DESIMAL = /^\d+(?:[.,]\d)?$/;

/** Mengubah "8,5" atau "8.5" menjadi 8.5; null bila format tidak sah. */
export function parseDesimal(masukan: string): number | null {
    const teks = masukan.trim();

    if (!POLA_DESIMAL.test(teks)) {
        return null;
    }

    return Number(teks.replace(',', '.'));
}

/** Menampilkan angka dengan satu desimal dan koma, misalnya 8.5 → "8,5". */
export function formatDesimal(angka: number): string {
    return angka.toFixed(1).replace('.', ',');
}

/**
 * Menyaring ketikan agar hanya berisi angka dan satu pemisah desimal
 * (koma atau titik). Dipakai saat kader mengetik, sebelum divalidasi.
 */
export function saringKetikanDesimal(masukan: string): string {
    let sudahAdaPemisah = false;
    let hasil = '';

    for (const karakter of masukan) {
        if (karakter >= '0' && karakter <= '9') {
            hasil += karakter;
        } else if ((karakter === ',' || karakter === '.') && !sudahAdaPemisah) {
            sudahAdaPemisah = true;
            hasil += karakter;
        }
    }

    return hasil;
}
