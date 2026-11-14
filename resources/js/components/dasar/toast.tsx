import {
    createContext,
    useContext,
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
            /** Aksi error selalu berlabel "Coba lagi". */
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

    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-(--offset-toast)"
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
        // Selama disorot atau difokus, hitungan 5 detik ditahan agar tombol
        // Batal tidak hilang saat hendak ditekan (WCAG 2.2.1).
        <div
            onPointerEnter={() => antrean.tahan(toast.id)}
            onPointerLeave={() => antrean.lanjutkan(toast.id)}
            onFocus={() => antrean.tahan(toast.id)}
            onBlur={() => antrean.lanjutkan(toast.id)}
            className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-md bg-ink-900 py-1 pr-1 pl-4 text-white shadow-2"
        >
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
