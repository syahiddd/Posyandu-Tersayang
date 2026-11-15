import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Kartu seksi bergaya sama di seluruh aplikasi: kepala bergradien blush,
 * ikon di tile plum, lalu isi. Dipakai di Detail Anak, Lainnya, Rekap
 * Imunisasi, Data Posyandu, dan Panduan KIA agar bahasa visualnya seragam.
 */
export function Seksi({
    judul,
    ikon: Ikon,
    aksi,
    children,
    className,
    isiClassName,
}: {
    judul: string;
    ikon: LucideIcon;
    aksi?: ReactNode;
    children: ReactNode;
    className?: string;
    /** Ganti bantalan isi, misalnya "p-0" untuk tabel selebar kartu. */
    isiClassName?: string;
}) {
    return (
        <section
            className={clsx(
                'overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1',
                className,
            )}
        >
            <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                    <Ikon
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2.4}
                    />
                </span>
                <h2 className="min-w-0 flex-1 text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                    {judul}
                </h2>
                {aksi}
            </div>
            <div className={clsx('px-3.5 py-1', isiClassName)}>{children}</div>
        </section>
    );
}
