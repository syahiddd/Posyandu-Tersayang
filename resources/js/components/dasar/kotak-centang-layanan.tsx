import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Kotak centang layanan (DESIGN bab 7, Tabel 31; Gambar 5): seluruh kartu
 * dapat diketuk, memuat nama layanan dan alasannya. Kotak centang asli
 * dipakai agar Spasi memilih (bab 10.3) dan pembaca layar membacanya.
 * Isian tambahan (nomor batch) tampil di dalam kartu saat tercentang.
 */
export function KotakCentangLayanan({
    nama,
    label,
    alasan,
    dicentang,
    onUbah,
    nonaktif = false,
    children,
}: {
    nama: string;
    label: string;
    alasan?: string;
    dicentang: boolean;
    onUbah: (dicentang: boolean) => void;
    nonaktif?: boolean;
    /** Isian di dalam kartu, hanya tampil saat tercentang. */
    children?: ReactNode;
}) {
    return (
        <div
            className={clsx(
                'rounded-md border-2 bg-white',
                // Cincin fokus 3 px tinta di bingkai kartu (bab 10.3).
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink-900',
                nonaktif
                    ? 'border-ink-200 bg-ink-100'
                    : dicentang
                      ? 'border-brand-700'
                      : 'border-ink-300',
            )}
        >
            <label
                className={clsx(
                    'flex min-h-control-h items-center gap-3 px-4 py-3',
                    nonaktif ? 'cursor-not-allowed' : 'cursor-pointer',
                )}
            >
                <input
                    type="checkbox"
                    name={nama}
                    checked={dicentang}
                    disabled={nonaktif}
                    onChange={(event) => onUbah(event.target.checked)}
                    className="sr-only"
                />
                <span
                    aria-hidden="true"
                    className={clsx(
                        'flex size-5 shrink-0 items-center justify-center rounded-sm border-2',
                        nonaktif
                            ? 'border-ink-300 bg-ink-100'
                            : dicentang
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : 'border-ink-900 bg-white',
                    )}
                >
                    {dicentang && (
                        <svg
                            viewBox="0 0 16 16"
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 8.5l3.2 3.2L13 5" />
                        </svg>
                    )}
                </span>
                <span className="flex min-w-0 flex-col">
                    <span
                        className={clsx(
                            'text-teks font-bold',
                            nonaktif ? 'text-ink-600' : 'text-ink-900',
                        )}
                    >
                        {label}
                    </span>
                    {alasan && (
                        <span className="text-kecil text-ink-700">
                            {alasan}
                        </span>
                    )}
                </span>
            </label>
            {dicentang && children && (
                <div className="border-t border-ink-200 px-4 pt-3 pb-4">
                    {children}
                </div>
            )}
        </div>
    );
}
