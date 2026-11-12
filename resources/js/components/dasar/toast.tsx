import {
    createContext,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from 'react';
import type { ReactNode } from 'react';
import { buatAntreanToast } from '@/lib/antrean-toast';
import type { AntreanToast, DataToast } from '@/lib/antrean-toast';

/**
 * Notifikasi / toast (DESIGN bab 7): sukses dengan Batal, error dengan
 * Coba lagi; muncul 5 detik dan dapat ditutup. Muncul di atas kaki layar
 * (jarak bawah lewat variabel CSS --offset-toast dari tata letak) sehingga
 * tidak menutupi tombol utama. role="status" (bab 10.4).
 */

/**
 * Jarak bawah notifikasi dari halaman yang sedang tampil. Wilayah toast
 * dipasang di luar halaman (app.tsx), sehingga variabel CSS dari halaman
 * tidak turun ke sini; nilainya dibaca dari elemen terdalam yang
 * menetapkannya (halaman lebih dalam daripada tata letak).
 */
function offsetToast(): string {
    const sumber = document.querySelectorAll<HTMLElement>(
        '[class*="--offset-toast"]',
    );
    const terdalam = sumber[sumber.length - 1];
    const nilai = terdalam
        ? getComputedStyle(terdalam).getPropertyValue('--offset-toast').trim()
        : '';

    return nilai === '' ? '16px' : nilai;
}
const KonteksToast = createContext<AntreanToast | null>(null);

export function PenyediaToast({ children }: { children: ReactNode }) {
    const [antrean] = useState(() => buatAntreanToast());

    return (
        <KonteksToast value={antrean}>
            {children}
            <WilayahToast antrean={antrean} />
        </KonteksToast>
    );
}

export function useToast() {
    const konteks = useContext(KonteksToast);

    if (!konteks) {
        throw new Error('useToast harus dipakai di dalam <PenyediaToast>.');
    }

    const antrean = konteks;

    return useMemo(
        () => ({
            sukses: (pesan: string, onBatal?: () => void) =>
                antrean.tampilkan({ jenis: 'sukses', pesan, aksi: onBatal }),
            error: (pesan: string, onCobaLagi?: () => void) =>
                antrean.tampilkan({ jenis: 'error', pesan, aksi: onCobaLagi }),
            tutup: antrean.tutup,
        }),
        [antrean],
    );
}

function WilayahToast({ antrean }: { antrean: AntreanToast }) {
    const daftar = useSyncExternalStore(
        antrean.langganan,
        antrean.daftar,
        antrean.daftar,
    );
    const [offset, setOffset] = useState('16px');

    // Dibaca ulang setiap notifikasi berubah: halaman bisa sudah berganti.
    useLayoutEffect(() => {
        if (daftar.length > 0) {
            setOffset(offsetToast());
        }
    }, [daftar]);

    return (
        <div
            role="status"
            aria-live="polite"
            style={{ paddingBottom: offset }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4"
        >
            {daftar.map((toast) => (
                <ItemToast key={toast.id} toast={toast} antrean={antrean} />
            ))}
        </div>
    );
}

function ItemToast({
    toast,
    antrean,
}: {
    toast: DataToast;
    antrean: AntreanToast;
}) {
    const labelAksi = toast.jenis === 'sukses' ? 'Batal' : 'Coba lagi';

    return (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-md bg-ink-900 py-1 pr-1 pl-4 text-white shadow-2">
            <p className="min-w-0 flex-1 py-2 text-teks">{toast.pesan}</p>
            {toast.aksi && (
                <button
                    type="button"
                    onClick={() => antrean.jalankanAksi(toast.id)}
                    className="inline-flex min-h-target-min min-w-target-min cursor-pointer items-center justify-center rounded-sm px-3 text-teks font-bold underline underline-offset-4 focus-visible:outline-white"
                >
                    {labelAksi}
                </button>
            )}
            <button
                type="button"
                onClick={() => antrean.tutup(toast.id)}
                className="inline-flex min-h-target-min min-w-target-min cursor-pointer items-center justify-center rounded-sm px-3 text-kecil focus-visible:outline-white"
            >
                Tutup
            </button>
        </div>
    );
}
