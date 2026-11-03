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

export type JenisKelamin = 'L' | 'P';

/** Kartu anak di antrean (DESIGN bab 7). */
export type KartuAntrean = {
    id: number;
    nomorAntrean: number;
    nama: string;
    jenisKelamin: JenisKelamin;
    umurBulan: number;
    namaIbu: string;
    status: 'menunggu' | 'sedang_dilayani' | 'ditunda' | 'selesai';
    terkunci: boolean;
    dibukaOleh: string | null;
    dibukaPada: string | null;
    ditundaPada: string | null;
    perluUkurUlang: boolean;
};

/** Identitas anak di header layar meja (DESIGN bab 7). */
export type HeaderKunjungan = {
    id: number;
    meja: number;
    nomorAntrean: number;
    nama: string;
    jenisKelamin: JenisKelamin;
    umurBulan: number;
    nikSamar: string | null;
    perluUkurUlang: boolean;
    alasanKembali: string | null;
};

/** Notifikasi dari server lewat flash Inertia. */
export type FlashToast = {
    pesan: string;
    jenis?: 'sukses' | 'error';
    batal?: boolean;
};
