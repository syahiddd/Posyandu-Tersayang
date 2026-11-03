import { formatDesimal, parseDesimal } from './desimal';

/**
 * Aturan isian Meja 2 (FR-19 sampai FR-22, PRD 7.2). Server memeriksa
 * ulang batas yang sama; di sini untuk umpan balik saat isian ditinggalkan
 * (DESIGN 5.4 langkah 3).
 */
export type JenisUkur = 'bb' | 'pb_tb' | 'lila' | 'lk';

export const BATAS_UKUR: Record<
    JenisUkur,
    { min: number; maks: number; satuan: 'kg' | 'cm' }
> = {
    bb: { min: 1, maks: 35, satuan: 'kg' },
    pb_tb: { min: 40, maks: 130, satuan: 'cm' },
    lila: { min: 7, maks: 25, satuan: 'cm' },
    lk: { min: 28, maks: 60, satuan: 'cm' },
};

/** Umur mulai diukur berdiri (FR-21). */
export const BULAN_MULAI_BERDIRI = 24;

export function caraUkurBawaan(umurBulan: number): 'telentang' | 'berdiri' {
    return umurBulan < BULAN_MULAI_BERDIRI ? 'telentang' : 'berdiri';
}

/**
 * Saran bila koma tampak salah letak atau terlewat, misalnya "7,25" atau
 * "725" untuk panjang badan → 72,5 (DESIGN Gambar 4).
 */
export function saranNilai(teks: string, jenis: JenisUkur): number | null {
    const angka = teks.replace(/\D/g, '');

    if (angka.length < 2) {
        return null;
    }

    const calon = Number(angka) / 10;
    const { min, maks } = BATAS_UKUR[jenis];

    return calon >= min && calon <= maks && calon !== parseDesimal(teks)
        ? calon
        : null;
}

/** Pesan galat isian ukur, atau null bila sah. */
export function periksaUkur(
    jenis: JenisUkur,
    teks: string,
    label: string,
    wajib: boolean,
): string | null {
    if (teks.trim() === '') {
        return wajib ? `${label} wajib diisi.` : null;
    }

    const { min, maks, satuan } = BATAS_UKUR[jenis];
    const nilai = parseDesimal(teks);
    const saran = saranNilai(teks, jenis);
    const tambahan =
        saran !== null ? ` Mungkin maksudnya ${formatDesimal(saran)}?` : '';

    if (nilai === null) {
        return `Tulis angka dengan paling banyak satu angka di belakang koma, misalnya 8,5.${tambahan}`;
    }

    if (nilai < min || nilai > maks) {
        return `Isi antara ${formatDesimal(min)} dan ${formatDesimal(maks)} ${satuan}.${tambahan}`;
    }

    return null;
}

/**
 * Peringatan tanpa menolak (FR-22): BB berubah lebih dari 20% atau PB/TB
 * turun lebih dari 1 cm dibanding pengukuran sebelumnya.
 */
export function peringatanPerubahan(
    sekarang: { bb: string; pbTb: string },
    sebelumnya: { bb: string | null; pbTb: string | null; tanggal: string },
): string[] {
    const pesan: string[] = [];
    const bb = parseDesimal(sekarang.bb);
    const bbLalu = sebelumnya.bb === null ? null : Number(sebelumnya.bb);

    if (bb !== null && bbLalu !== null && bbLalu > 0) {
        const selisih = bb - bbLalu;
        const persen = Math.abs(selisih) / bbLalu;

        if (persen > 0.2) {
            pesan.push(
                `BB ${selisih > 0 ? 'naik' : 'turun'} ${formatDesimal(Math.abs(selisih))} kg (${Math.round(persen * 100)}%) sejak ${sebelumnya.tanggal}.`,
            );
        }
    }

    const pbTb = parseDesimal(sekarang.pbTb);
    const pbTbLalu = sebelumnya.pbTb === null ? null : Number(sebelumnya.pbTb);

    if (pbTb !== null && pbTbLalu !== null && pbTbLalu - pbTb > 1) {
        pesan.push(
            `Panjang/tinggi badan turun ${formatDesimal(pbTbLalu - pbTb)} cm sejak ${sebelumnya.tanggal}.`,
        );
    }

    return pesan;
}
