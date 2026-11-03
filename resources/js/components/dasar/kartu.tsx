import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Kartu (DESIGN 3.6): permukaan putih di atas latar kertas, garis tepi
 * ink-200 1 px, bayangan shadow-1, radius 10 px, padding 12/16 px.
 */
type PropsKartu = Omit<ComponentProps<'section'>, 'title'> & {
    judul?: ReactNode;
    /** Label seksi huruf kapital, misalnya "ANTREAN PER MEJA". */
    labelSeksi?: string;
};

export function Kartu({
    judul,
    labelSeksi,
    className,
    children,
    ...props
}: PropsKartu) {
    return (
        <section
            className={clsx(
                'rounded-md border border-ink-200 bg-white px-4 py-3 shadow-1',
                className,
            )}
            {...props}
        >
            {labelSeksi && (
                <h2 className="mb-2 text-label-seksi text-ink-600 uppercase">
                    {labelSeksi}
                </h2>
            )}
            {judul && (
                <h2 className="mb-2 text-judul-2 text-ink-900">{judul}</h2>
            )}
            {children}
        </section>
    );
}
