/**
 * Antrean notifikasi (DESIGN bab 7 dan Prinsip 1): muncul 5 detik dan dapat
 * dibatalkan. Logika dipisah dari tampilan agar bisa diuji tanpa DOM.
 */
export const DURASI_TOAST_MS = 5000;

export type JenisToast = 'sukses' | 'error';

export type DataToast = {
    id: number;
    jenis: JenisToast;
    pesan: string;
    /** Sukses: tombol Batal. Error: tombol Coba lagi. */
    aksi?: () => void;
};

type Pendengar = (daftar: DataToast[]) => void;

export function buatAntreanToast(durasiMs = DURASI_TOAST_MS) {
    let daftar: DataToast[] = [];
    let idBerikutnya = 1;
    const pengatur = new Map<number, ReturnType<typeof setTimeout>>();
    const pendengar = new Set<Pendengar>();

    const kabari = () => pendengar.forEach((fungsi) => fungsi(daftar));

    function tutup(id: number) {
        clearTimeout(pengatur.get(id));
        pengatur.delete(id);
        daftar = daftar.filter((toast) => toast.id !== id);
        kabari();
    }

    function tampilkan(toast: Omit<DataToast, 'id'>): number {
        const id = idBerikutnya++;
        daftar = [...daftar, { ...toast, id }];
        pengatur.set(
            id,
            setTimeout(() => tutup(id), durasiMs),
        );
        kabari();

        return id;
    }

    /** Menjalankan Batal/Coba lagi lalu menutup notifikasi. */
    function jalankanAksi(id: number) {
        const toast = daftar.find((item) => item.id === id);
        tutup(id);
        toast?.aksi?.();
    }

    function langganan(fungsi: Pendengar) {
        pendengar.add(fungsi);

        return () => {
            pendengar.delete(fungsi);
        };
    }

    return {
        tampilkan,
        tutup,
        jalankanAksi,
        langganan,
        daftar: () => daftar,
    };
}

export type AntreanToast = ReturnType<typeof buatAntreanToast>;
