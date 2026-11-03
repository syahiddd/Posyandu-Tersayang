import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Kerangka bersama isian (DESIGN bab 7 dan 10.4): label di atas isian,
 * petunjuk dan pesan error di bawahnya, terhubung lewat aria-describedby.
 */
export type PropsBidang = {
    id: string;
    label: string;
    wajib?: boolean;
    /** Teks kecil di kanan label, misalnya "Dianjurkan" atau tautan Tampilkan. */
    kananLabel?: ReactNode;
    petunjuk?: ReactNode;
    galat?: string;
    peringatan?: string;
    children: ReactNode;
    className?: string;
};

export function idPetunjuk(id: string) {
    return `${id}-petunjuk`;
}

export function idPesan(id: string) {
    return `${id}-pesan`;
}

/** Nilai aria-describedby untuk isian sesuai petunjuk dan pesan yang tampil. */
export function deskripsiIsian(
    id: string,
    {
        petunjuk,
        galat,
        peringatan,
    }: Pick<PropsBidang, 'petunjuk' | 'galat' | 'peringatan'>,
): string | undefined {
    const daftar = [
        petunjuk ? idPetunjuk(id) : null,
        galat || peringatan ? idPesan(id) : null,
    ].filter(Boolean);

    return daftar.length > 0 ? daftar.join(' ') : undefined;
}

export function Bidang({
    id,
    label,
    wajib = false,
    kananLabel,
    petunjuk,
    galat,
    peringatan,
    children,
    className,
}: PropsBidang) {
    return (
        <div className={clsx('flex flex-col gap-1', className)}>
            <div className="flex items-center justify-between gap-2">
                <label
                    htmlFor={id}
                    className="text-kecil font-bold text-ink-900"
                >
                    {label}
                    {wajib && (
                        <>
                            {' '}
                            <span
                                aria-hidden="true"
                                className="text-status-bahaya-teks"
                            >
                                *
                            </span>
                            <span className="sr-only">(wajib)</span>
                        </>
                    )}
                </label>
                {kananLabel}
            </div>
            {children}
            {petunjuk && (
                <p id={idPetunjuk(id)} className="text-keterangan text-ink-600">
                    {petunjuk}
                </p>
            )}
            {(galat || peringatan) && (
                <p
                    id={idPesan(id)}
                    className={clsx(
                        'text-keterangan font-bold',
                        galat
                            ? 'text-status-bahaya-teks'
                            : 'text-status-waspada-teks',
                    )}
                >
                    {galat ?? peringatan}
                </p>
            )}
        </div>
    );
}

/** Kelas bingkai isian: tinggi 52 px, tepi ink-400, huruf minimal 16 px. */
export function kelasBingkai({
    galat,
    peringatan,
    bacaSaja,
}: {
    galat?: string;
    peringatan?: string;
    bacaSaja?: boolean;
}) {
    return clsx(
        'w-full rounded-sm border bg-white text-ink-900 placeholder:text-ink-500 focus:border-ink-900',
        'disabled:cursor-not-allowed disabled:border-ink-300 disabled:bg-ink-100 disabled:text-ink-500',
        bacaSaja && 'border-dashed border-ink-400 bg-ink-100',
        galat
            ? 'border-2 border-status-bahaya-teks'
            : peringatan
              ? 'border-2 border-status-waspada-teks'
              : !bacaSaja && 'border-ink-400',
    );
}
