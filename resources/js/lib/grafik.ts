/**
 * Perhitungan tampilan grafik pertumbuhan (PRD 5.1, 5.4, 5.7; DESIGN 3.4,
 * 7.1). Data garis dan titik dihitung server dari tabel WHO; di sini hanya
 * zona, skala, dan format teks.
 */

export type IndeksGrafik =
    | 'kms'
    | 'bb_u'
    | 'pb_tb_u'
    | 'bb_pb_tb'
    | 'imt_u'
    | 'lk_u';

export type TitikXY = { x: number; y: number };

export type GarisZ = { z: number; terlihat: boolean; titik: TitikXY[] };

export type TitikAnak = TitikXY & {
    id: number;
    tanggal: string;
    umurBulan: number;
    zScore: number | null;
    kategori: string;
    dariBukuKia: boolean;
    hariIni: boolean;
};

export type DataGrafik = {
    judul: string;
    indeks: string;
    sumbuX: string;
    sumbuY: string;
    dariX: number;
    sampaiX: number;
    minimumY: number;
    maksimumY: number;
    intervalX: number;
    intervalY: number;
    garis: GarisZ[];
    titik: TitikAnak[];
};

export type WarnaZona =
    | 'normal'
    | 'waspada'
    | 'kurang'
    | 'sangat-kurang'
    | 'tinggi';

/** Zona di antara dua garis z; null = tepi grafik. */
export type Zona = {
    bawah: number | null;
    atas: number | null;
    warna: WarnaZona;
    label: string;
};

/**
 * Zona per indeks sesuai kategori PRD Tabel 25. KMS memakai zona BB/U.
 */
export function zonaIndeks(indeks: IndeksGrafik): Zona[] {
    switch (indeks) {
        case 'kms':
        case 'bb_u':
            return [
                {
                    bawah: null,
                    atas: -3,
                    warna: 'sangat-kurang',
                    label: 'Sangat kurang',
                },
                { bawah: -3, atas: -2, warna: 'kurang', label: 'Kurang' },
                { bawah: -2, atas: 1, warna: 'normal', label: 'Normal' },
                {
                    bawah: 1,
                    atas: null,
                    warna: 'waspada',
                    label: 'Risiko lebih',
                },
            ];
        case 'pb_tb_u':
            return [
                {
                    bawah: null,
                    atas: -3,
                    warna: 'sangat-kurang',
                    label: 'Sangat pendek',
                },
                { bawah: -3, atas: -2, warna: 'kurang', label: 'Pendek' },
                { bawah: -2, atas: 3, warna: 'normal', label: 'Normal' },
                { bawah: 3, atas: null, warna: 'tinggi', label: 'Tinggi' },
            ];
        case 'lk_u':
            return [
                {
                    bawah: null,
                    atas: -2,
                    warna: 'kurang',
                    label: 'Mikrosefali',
                },
                { bawah: -2, atas: 2, warna: 'normal', label: 'Normal' },
                { bawah: 2, atas: null, warna: 'kurang', label: 'Makrosefali' },
            ];
        default:
            return [
                {
                    bawah: null,
                    atas: -3,
                    warna: 'sangat-kurang',
                    label: 'Gizi buruk',
                },
                { bawah: -3, atas: -2, warna: 'kurang', label: 'Gizi kurang' },
                { bawah: -2, atas: 1, warna: 'normal', label: 'Gizi baik' },
                {
                    bawah: 1,
                    atas: 2,
                    warna: 'waspada',
                    label: 'Berisiko gizi lebih',
                },
                { bawah: 2, atas: 3, warna: 'kurang', label: 'Gizi lebih' },
                {
                    bawah: 3,
                    atas: null,
                    warna: 'sangat-kurang',
                    label: 'Obesitas',
                },
            ];
    }
}

/** Kelas warna garis z sesuai DESIGN Tabel 7. */
export function warnaGaris(z: number): string {
    const jarak = Math.abs(z);

    if (jarak === 0) {
        return 'var(--color-garis-z0)';
    }

    if (jarak === 1) {
        return 'var(--color-garis-z1)';
    }

    return jarak === 2 ? 'var(--color-garis-z2)' : 'var(--color-garis-z3)';
}

export function tebalGaris(z: number): number {
    return z === 0 ? 2.4 : 1.6;
}

/** Contoh: −2,31 / +0,92 / 0,00 (minus tipografis, koma desimal). */
export function formatZ(z: number): string {
    const teks = Math.abs(z).toFixed(2).replace('.', ',');

    if (z < 0 && teks !== '0,00') {
        return `−${teks}`;
    }

    return z > 0 && teks !== '0,00' ? `+${teks}` : teks;
}

/** Contoh: 88 → "88,0"; null → "—". */
export function formatSatuDesimal(nilai: number | null): string {
    return nilai === null ? '—' : nilai.toFixed(1).replace('.', ',');
}

/** Label pil garis: 0, +2, −3. */
export function labelGaris(z: number): string {
    return z === 0 ? '0' : z > 0 ? `+${z}` : `−${Math.abs(z)}`;
}

/** Nilai garis z pada setiap x yang sama dengan garis acuan. */
export function nilaiGaris(
    garis: GarisZ[],
    z: number | null,
): Map<number, number> | null {
    if (z === null) {
        return null;
    }

    const satu = garis.find((item) => item.z === z);

    return satu ? new Map(satu.titik.map((titik) => [titik.x, titik.y])) : null;
}

/** Deret tick dari minimum sampai maksimum dengan jarak tertentu. */
export function tick(dari: number, sampai: number, jarak: number): number[] {
    const hasil: number[] = [];
    const awal = Math.ceil(dari / jarak) * jarak;

    for (let nilai = awal; nilai <= sampai + 1e-9; nilai += jarak) {
        hasil.push(Math.round(nilai * 100) / 100);
    }

    return hasil;
}

/**
 * Titik anak di dalam rentang sumbu grafik, urut x. Titik di luar
 * rentang (misalnya sebelum umur 24 bulan pada grafik 2–5 tahun) tetap
 * tersedia di tampilan tabel (PRD 4.7 kriteria penerimaan).
 */
export function titikDalamRentang(data: DataGrafik): TitikAnak[] {
    return data.titik
        .filter((titik) => titik.x >= data.dariX && titik.x <= data.sampaiX)
        .sort((a, b) => a.x - b.x || a.tanggal.localeCompare(b.tanggal));
}
