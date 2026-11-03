import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

const SELEKTOR_FOKUS =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Sheet bawah (DESIGN bab 7): radius 16 px, ditutup dengan tombol Tutup
 * atau Esc; fokus terkunci di dalamnya lalu kembali ke tombol pembuka
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
    const ref = useRef<HTMLDivElement>(null);
    const refTutup = useRef(onTutup);

    useEffect(() => {
        refTutup.current = onTutup;
    });

    useEffect(() => {
        if (!terbuka) {
            return;
        }

        const pembuka = document.activeElement as HTMLElement | null;
        ref.current?.focus();

        const tanganiTombol = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                refTutup.current();

                return;
            }

            if (event.key !== 'Tab' || !ref.current) {
                return;
            }

            const fokus = [
                ...ref.current.querySelectorAll<HTMLElement>(SELEKTOR_FOKUS),
            ];

            if (fokus.length === 0) {
                return;
            }

            const pertama = fokus[0];
            const terakhir = fokus[fokus.length - 1];

            if (event.shiftKey && document.activeElement === pertama) {
                event.preventDefault();
                terakhir.focus();
            } else if (!event.shiftKey && document.activeElement === terakhir) {
                event.preventDefault();
                pertama.focus();
            }
        };

        document.addEventListener('keydown', tanganiTombol);

        return () => {
            document.removeEventListener('keydown', tanganiTombol);
            pembuka?.focus();
        };
    }, [terbuka]);

    if (!terbuka) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center tablet:items-center">
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-ink-900/40"
                onClick={onTutup}
            />
            <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-labelledby={idJudul}
                tabIndex={-1}
                className="relative max-h-[80dvh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-white px-4 pt-2 pb-5 shadow-2 focus-visible:outline-none tablet:rounded-lg"
            >
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
        </div>
    );
}
