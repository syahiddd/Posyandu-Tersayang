export type * from './auth';

/** Meja yang dipegang kader hari ini (FR-03). */
export type MejaAktif = {
    nomor: number;
    tahap: string;
};

/** Jumlah antrean satu meja hari ini (FR-07). */
export type AntreanMeja = {
    nomor: number;
    tahap: string;
    menunggu: number;
    ditunda: number;
};
