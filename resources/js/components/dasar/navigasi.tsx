import { Link } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Navigasi (DESIGN bab 7 dan bab 9): setiap tujuan memiliki teks.
 * - Ponsel < 600 px: navigasi bawah 4 tujuan dengan ikon dan teks.
 * - Tablet 600–1023 px: rel samping ikon dan teks.
 * - Desktop ≥ 1024 px: sidebar 232 px (Gambar 10), juga dengan ikon dan teks
 *   (Tabel komponen "Navigasi") dan transisi warna 150 ms (token motion).
 * Semua memakai nav aria-label "Menu utama" dan aria-current="page".
 * Tujuan aktif ditandai warna merek (plum), bukan biru atau merah muda
 * yang khusus identitas anak.
 */
export type ItemNavigasi = {
    label: string;
    href: string;
    ikon: LucideIcon;
    aktif: boolean;
};

export function NavigasiBawah({ item }: { item: ItemNavigasi[] }) {
    return (
        <nav
            aria-label="Menu utama"
            className="fixed inset-x-0 bottom-0 z-40 h-19 border-t border-ink-200 bg-white tablet:hidden"
        >
            <ul className="grid h-full grid-cols-4">
                {item.map(({ label, href, ikon: Ikon, aktif }) => (
                    <li key={label}>
                        <Link
                            href={href}
                            aria-current={aktif ? 'page' : undefined}
                            className={clsx(
                                'relative flex h-full min-h-target-min flex-col items-center justify-center gap-1 px-1 text-keterangan transition-colors',
                                aktif
                                    ? 'font-bold text-brand-700'
                                    : 'text-ink-600',
                            )}
                        >
                            {aktif && (
                                <span
                                    aria-hidden="true"
                                    className="absolute top-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-b-pill bg-brand-600"
                                />
                            )}
                            <Ikon aria-hidden="true" className="size-5" />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export function NavigasiRel({ item }: { item: ItemNavigasi[] }) {
    return (
        <nav
            aria-label="Menu utama"
            className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col border-r border-ink-200 bg-white py-4 tablet:flex desktop:hidden"
        >
            <ul className="flex flex-col gap-2">
                {item.map(({ label, href, ikon: Ikon, aktif }) => (
                    <li key={label}>
                        <Link
                            href={href}
                            aria-current={aktif ? 'page' : undefined}
                            className={clsx(
                                'relative flex min-h-target-min flex-col items-center justify-center gap-1 px-1 py-2 text-center text-keterangan transition-colors',
                                aktif
                                    ? 'font-bold text-brand-700'
                                    : 'text-ink-600',
                            )}
                        >
                            {aktif && (
                                <span
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-pill bg-brand-600"
                                />
                            )}
                            <Ikon aria-hidden="true" className="size-5" />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export function Sidebar({
    judul,
    item,
    kaki,
}: {
    judul: string;
    item: ItemNavigasi[];
    /** Tindakan di bagian bawah, misalnya Ganti meja dan Keluar. */
    kaki?: ReactNode;
}) {
    return (
        <nav
            aria-label="Menu utama"
            className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col border-r border-ink-200 bg-white px-4 py-6 desktop:flex"
        >
            <p className="px-3 pb-6 text-judul-2 text-ink-900">{judul}</p>
            <ul className="flex flex-col gap-1">
                {item.map(({ label, href, ikon: Ikon, aktif }) => (
                    <li key={label}>
                        <Link
                            href={href}
                            aria-current={aktif ? 'page' : undefined}
                            className={clsx(
                                'flex min-h-target-min items-center gap-3 rounded-md px-3 py-2 text-teks font-bold transition-colors',
                                aktif
                                    ? 'bg-brand-700 text-white'
                                    : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100',
                            )}
                        >
                            <Ikon
                                aria-hidden="true"
                                className="size-5 shrink-0"
                            />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
            {kaki && (
                <div className="mt-auto flex flex-col gap-1 border-t border-ink-200 pt-4">
                    {kaki}
                </div>
            )}
        </nav>
    );
}
