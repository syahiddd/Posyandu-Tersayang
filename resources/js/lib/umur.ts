/**
 * Teks umur anak dari umur dalam bulan penuh (PRD 5.6). Bulan penuh
 * dihitung di server; di sini hanya formatnya (mockup DESIGN Gambar 4).
 */
export function formatUmurBulan(bulan: number): string {
    return `${bulan} bulan`;
}

/** Contoh: 39 → "3 th 3 bln", 9 → "9 bln". */
export function formatUmurTahunBulan(bulan: number): string {
    const tahun = Math.floor(bulan / 12);
    const sisa = bulan % 12;

    return tahun === 0 ? `${sisa} bln` : `${tahun} th ${sisa} bln`;
}
