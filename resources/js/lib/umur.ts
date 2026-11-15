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

/**
 * Umur lengkap untuk orang tua: selalu menyebut bulan, dan bila sudah
 * setahun lebih dipecah menjadi tahun + bulan. Contoh: 39 → "3 tahun
 * 3 bulan (39 bulan)", 9 → "9 bulan", 12 → "1 tahun 0 bulan (12 bulan)".
 */
export function formatUmurLengkap(bulan: number): string {
    const tahun = Math.floor(bulan / 12);
    const sisa = bulan % 12;

    if (tahun === 0) {
        return formatUmurBulan(sisa);
    }

    return `${tahun} tahun ${sisa} bulan (${formatUmurBulan(bulan)})`;
}

/**
 * Versi ringkas dua baris untuk lencana: "3 th 3 bln" dengan keterangan
 * "39 bulan" di bawahnya. Dipakai di kepala Detail Anak.
 */
export function pecahUmur(bulan: number): {
    tahun: number;
    bulan: number;
    teks: string;
    teksBulan: string;
} {
    const tahun = Math.floor(bulan / 12);
    const sisa = bulan % 12;

    return {
        tahun,
        bulan: sisa,
        teks: tahun === 0 ? `${sisa} bulan` : `${tahun} tahun ${sisa} bulan`,
        teksBulan: formatUmurBulan(bulan),
    };
}
