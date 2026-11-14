import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

/**
 * Sheet bawah (DESIGN bab 7): radius 16 px, ditutup dengan tombol Tutup,
 * Esc, atau ketukan di luar sheet. Memakai <dialog> bawaan dengan
 * showModal() seperti Dialog: halaman di belakang tidak dapat difokus,
 * fokus terkunci di dalam, dan kembali ke tombol pembuka saat ditutup
 * (DESIGN 10.3, 10.4).
 */
export function SheetBawah({
    terbuka,
    onTutup,
    judul,
    children,
}: {
    terbuka: boolean;
    onTutup: () => void;
    judul: string;
    children: ReactNode;
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
            // Ketukan di latar mengenai <dialog> itu sendiri, bukan isinya.
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onTutup();
                }
            }}
            className="mx-auto mt-auto mb-0 max-h-[80dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-lg bg-white p-0 text-ink-900 shadow-2 backdrop:bg-ink-900/40 tablet:my-auto tablet:rounded-lg"
        >
            {terbuka && (
                <div className="px-4 pt-2 pb-5">
                    <div className="flex items-center justify-between gap-3 pb-2">
                        <h2 id={idJudul} className="text-judul-2 text-ink-900">
                            {judul}
                        </h2>
                        <button
                            type="button"
                            onClick={onTutup}
                            className="inline-flex min-h-target-min min-w-target-min cursor-pointer items-center justify-center px-2 text-kecil text-ink-900 underline underline-offset-4"
                        >
                            Tutup
                        </button>
                    </div>
                    {children}
                </div>
            )}
        </dialog>
    );
}
