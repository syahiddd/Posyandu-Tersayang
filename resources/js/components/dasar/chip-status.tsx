import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Chip status (DESIGN bab 7, Tabel 6): selalu berisi teks kategori sehingga
 * warna bukan satu-satunya penanda; bukan tombol.
 */
export type VarianChip =
    | 'normal'
    | 'waspada'
    | 'bahaya'
    | 'bahaya-berat'
    | 'info';

const kelasVarian: Record<VarianChip, string> = {
    normal: 'bg-status-normal-latar text-status-normal-teks',
    waspada: 'bg-status-waspada-latar text-status-waspada-teks',
    bahaya: 'bg-status-bahaya-latar text-status-bahaya-teks',
    'bahaya-berat':
        'bg-status-bahaya-berat-latar text-status-bahaya-berat-teks',
    info: 'bg-status-info-latar text-status-info-teks',
};

export function ChipStatus({
    varian,
    children,
    className,
}: {
    varian: VarianChip;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-pill px-3 py-1 text-kecil font-bold whitespace-nowrap',
                kelasVarian[varian],
                className,
            )}
        >
            {children}
        </span>
    );
}
