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
                                'flex h-full min-h-target-min flex-col items-center justify-center gap-1 px-1 text-keterangan',
                                aktif
                                    ? 'font-bold text-ink-900'
                                    : 'text-ink-600',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={clsx(
                                    'flex h-8 w-12 items-center justify-center rounded-md',
                                    aktif && 'bg-ink-900 text-white',
                                )}
                            >
                                <Ikon className="size-5" />
                            </span>
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
                                'flex min-h-target-min flex-col items-center justify-center gap-1 px-1 py-2 text-center text-keterangan',
                                aktif
                                    ? 'font-bold text-ink-900'
                                    : 'text-ink-600',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={clsx(
                                    'flex h-8 w-12 items-center justify-center rounded-md',
                                    aktif && 'bg-ink-900 text-white',
                                )}
                            >
                                <Ikon className="size-5" />
                            </span>
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
                                    ? 'bg-ink-900 text-white'
                                    : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
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
