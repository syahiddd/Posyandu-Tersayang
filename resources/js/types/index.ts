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

/** Ringkasan anak untuk pencarian dan kartu pembanding Meja 1 (FR-15). */
export type RingkasanAnak = {
    id: number;
    nama: string;
    jenisKelamin: JenisKelamin;
    umurBulan: number;
    tanggalLahir: string;
    namaIbu: string;
    nikSamar: string | null;
    kunjunganTerakhir: string | null;
    sudahDiAntrean: boolean;
};

/** Pilihan meja untuk isian "meja yang biasa dipegang" (FR-60). */
export type PilihanMeja = {
    nomor: number;
    tahap: string;
};

/** Data akun kader di Pengaturan Akun (FR-02, FR-60). */
export type AkunKader = {
    id: number;
    nama: string;
    username: string;
    noHp: string | null;
    mejaBiasa: number | null;
};

/** Penyaring aktif di Data Anak (FR-50); dipakai juga untuk CSV (FR-54). */
export type PenyaringDataAnak = {
    cari: string;
    jk: JenisKelamin | null;
    umur: string | null;
    dusun: string | null;
};
