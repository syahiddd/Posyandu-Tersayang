import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Tombol } from './tombol';

/**
 * Dialog konfirmasi (DESIGN bab 7): hanya untuk tindakan permanen; tombol
 * Bahaya di kanan, Batal di kiri. Memakai <dialog> bawaan dengan
 * showModal() sehingga fokus terkunci, Esc menutup, dan fokus kembali ke
 * tombol pembuka (DESIGN 10.3, 10.4).
 */
export function Dialog({
    terbuka,
    onTutup,
    judul,
    children,
    labelBahaya,
    bolehKonfirmasi = true,
    memuat = false,
    teksMemuat = 'Menghapus…',
    onKonfirmasi,
}: {
    terbuka: boolean;
    onTutup: () => void;
    judul: string;
    children: ReactNode;
    labelBahaya: string;
    /** Misalnya baru true setelah nama anak diketik (FR-53). */
    bolehKonfirmasi?: boolean;
    memuat?: boolean;
    teksMemuat?: string;
    onKonfirmasi: () => void;
}) {
    const idJudul = useId();
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        if (terbuka && !dialog.open) {
            dialog.showModal();
        } else if (!terbuka && dialog.open) {
            dialog.close();
        }
    }, [terbuka]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={idJudul}
            onCancel={(event) => {
                event.preventDefault();
                onTutup();
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-0 text-ink-900 shadow-2 backdrop:bg-ink-900/40"
        >
            {terbuka && (
                <form
                    method="dialog"
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (bolehKonfirmasi && !memuat) {
                            onKonfirmasi();
                        }
                    }}
                    className="flex flex-col gap-4 px-5 pt-5 pb-5"
                >
                    <h2 id={idJudul} className="text-judul-2">
                        {judul}
                    </h2>
                    <div className="flex flex-col gap-3 text-teks">
                        {children}
                    </div>
                    <div className="flex gap-2">
                        <Tombol
                            varian="sekunder"
                            className="shrink-0"
                            onClick={onTutup}
                        >
                            Batal
                        </Tombol>
                        <Tombol
                            type="submit"
                            varian="bahaya"
                            lebarPenuh
                            disabled={!bolehKonfirmasi}
                            memuat={memuat}
                            teksMemuat={teksMemuat}
                        >
                            {labelBahaya}
                        </Tombol>
                    </div>
                </form>
            )}
        </dialog>
    );
}
