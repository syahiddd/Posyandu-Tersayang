import { Link } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Tombol (DESIGN bab 7, Tabel 31): tinggi 52 px, teks berupa kata kerja,
 * satu tombol utama per layar. Warna merek (plum) untuk aksi, bukan biru
 * atau merah muda identitas anak.
 */
export type VarianTombol = 'utama' | 'sekunder' | 'tersier' | 'bahaya';

const kelasVarian: Record<VarianTombol, string> = {
    utama: 'bg-brand-700 text-white active:bg-brand-800 disabled:bg-ink-200 disabled:text-ink-500',
    sekunder:
        'border-2 border-brand-700 bg-white text-brand-700 active:bg-brand-50 disabled:border-ink-300 disabled:text-ink-500',
    tersier:
        'bg-transparent px-2 text-brand-700 underline underline-offset-4 active:text-brand-800 disabled:text-ink-500',
    bahaya: 'border-2 border-status-bahaya-teks bg-white text-status-bahaya-teks active:bg-status-bahaya-latar disabled:border-ink-300 disabled:text-ink-500',
};

export function kelasTombol(
    varian: VarianTombol = 'utama',
    lebarPenuh = false,
): string {
    return clsx(
        'inline-flex min-h-target-min min-w-target-min cursor-pointer items-center justify-center gap-2 rounded-md text-teks font-bold transition-colors select-none disabled:cursor-not-allowed',
        varian === 'tersier' ? 'h-auto' : 'h-control-h px-5',
        kelasVarian[varian],
        lebarPenuh && 'w-full',
    );
}

function Pemuat() {
    return (
        <span
            aria-hidden="true"
            className="size-5 shrink-0 animate-spin rounded-pill border-2 border-current border-t-transparent"
        />
    );
}

type PropsTombol = ComponentProps<'button'> & {
    varian?: VarianTombol;
    lebarPenuh?: boolean;
    /** Saat memuat, teks berganti dan tombol tidak bisa ditekan ulang. */
    memuat?: boolean;
    teksMemuat?: string;
};

export function Tombol({
    varian = 'utama',
    lebarPenuh = false,
    memuat = false,
    teksMemuat = 'Menyimpan…',
    type = 'button',
    disabled,
    className,
    children,
    ...props
}: PropsTombol) {
    return (
        <button
            type={type}
            disabled={disabled || memuat}
            aria-busy={memuat || undefined}
            className={clsx(
                kelasTombol(varian, lebarPenuh),
                // Saat memuat, warna tetap seperti tombol aktif (DESIGN Gambar 7).
                memuat &&
                    varian === 'utama' &&
                    'disabled:bg-brand-700 disabled:text-white',
                className,
            )}
            {...props}
        >
            {memuat ? (
                <>
                    <Pemuat />
                    {teksMemuat}
                </>
            ) : (
                children
            )}
        </button>
    );
}

type PropsTombolTautan = ComponentProps<typeof Link> & {
    varian?: VarianTombol;
    lebarPenuh?: boolean;
    children: ReactNode;
};

/** Tautan navigasi yang tampil sebagai tombol, misalnya "Buka antrean Meja 2". */
export function TombolTautan({
    varian = 'utama',
    lebarPenuh = false,
    className,
    children,
    ...props
}: PropsTombolTautan) {
    return (
        <Link
            className={clsx(
                kelasTombol(varian, lebarPenuh),
                'no-underline',
                varian === 'tersier' && 'underline',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
