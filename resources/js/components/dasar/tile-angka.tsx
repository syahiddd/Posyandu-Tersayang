import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

/**
 * Tile angka (DESIGN bab 7): angka 28 px tebal dan label dua baris maksimal,
 * untuk ringkasan Beranda (FR-06).
 */
export function TileAngka({
    angka,
    label,
    ikon: Ikon,
    className,
}: {
    angka: number;
    label: string;
    /** Selalu didampingi label (DESIGN 2.3: tanpa ikon tanpa label). */
    ikon?: LucideIcon;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                'flex flex-col gap-1 rounded-md border border-ink-200 bg-white px-4 py-3 shadow-1 max-[359px]:px-3',
                className,
            )}
        >
            {Ikon && (
                <Ikon aria-hidden="true" className="size-5 text-ink-700" />
            )}
            <span className="text-display text-ink-900 tabular-nums">
                {angka.toLocaleString('id-ID')}
            </span>
            <span className="line-clamp-2 text-kecil text-ink-600">
                {label}
            </span>
        </div>
    );
}
