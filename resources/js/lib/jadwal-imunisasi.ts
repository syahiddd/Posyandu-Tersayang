/** Tiga warna kategori pemberian plus usia yang tidak diperbolehkan. */
export type JenisSelJadwal = 'tepat' | 'lengkapi' | 'kejar' | 'terlarang';

export type KolomJadwal = {
    label: string;
    umur: number;
    jenis: 'bulan' | 'kejar';
};

export type DosisJadwal = {
    nomor: number;
    umurBulan: number;
    umurTepatMin?: number;
    umurMaks: number;
    endemis: boolean;
};

export type BarisJadwal = {
    kelompok: string;
    nama: string;
    dosis: DosisJadwal[];
};

export type SelJadwal = { nomor: number | null; jenis: JenisSelJadwal };

function jenisDosis(dosis: DosisJadwal, umur: number): JenisSelJadwal | null {
    const umurTepatMin = dosis.umurTepatMin ?? dosis.umurBulan;

    if (umur >= umurTepatMin && umur <= dosis.umurBulan) {
        return 'tepat';
    }

    if (umur <= dosis.umurBulan || umur > dosis.umurMaks) {
        return null;
    }

    // Dosis yang dianjurkan sebelum 12 bulan dapat dilengkapi sampai 11;
    // dosis 12 bulan ke atas dapat dilengkapi hingga umur 23 bulan.
    const batasLengkapi = dosis.umurBulan < 12 ? 11 : 23;

    return umur <= batasLengkapi ? 'lengkapi' : 'kejar';
}

/** Pilih satu dosis paling relevan untuk sel per umur pada baris vaksin. */
export function selJadwalPadaUmur(
    dosis: DosisJadwal[],
    umur: number,
): SelJadwal {
    const prioritas: Record<JenisSelJadwal, number> = {
        tepat: 3,
        lengkapi: 2,
        kejar: 1,
        terlarang: 0,
    };
    const kandidat = dosis
        .map((satu) => ({
            nomor: satu.nomor,
            umurBulan: satu.umurBulan,
            jenis: jenisDosis(satu, umur),
        }))
        .filter(
            (satu): satu is typeof satu & { jenis: JenisSelJadwal } =>
                satu.jenis !== null,
        )
        .sort(
            (a, b) =>
                prioritas[b.jenis] - prioritas[a.jenis] ||
                b.umurBulan - a.umurBulan ||
                b.nomor - a.nomor,
        );
    const pilihan = kandidat[0];

    return pilihan
        ? { nomor: pilihan.nomor, jenis: pilihan.jenis }
        : { nomor: null, jenis: 'terlarang' };
}

/** Keterangan untuk tooltip dan pembaca layar. */
export const LABEL_JENIS_SEL: Record<JenisSelJadwal, string> = {
    tepat: 'Usia tepat pemberian imunisasi',
    lengkapi: 'Usia masih diperbolehkan untuk melengkapi imunisasi',
    kejar: 'Imunisasi kejar untuk bayi dan baduta yang belum lengkap',
    terlarang: 'Usia tidak diperbolehkan untuk pemberian imunisasi',
};
