import { clsx } from 'clsx';

/**
 * Tile angka (DESIGN bab 7): angka 28 px tebal dan label dua baris maksimal,
 * untuk ringkasan Beranda (FR-06).
 */
export function TileAngka({
    angka,
    label,
    className,
}: {
    angka: number;
    label: string;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                'flex flex-col gap-1 rounded-md border border-ink-200 bg-white px-4 py-3 shadow-1 max-[359px]:px-3',
                className,
            )}
        >
            <span className="text-display text-ink-900 tabular-nums">
                {angka.toLocaleString('id-ID')}
            </span>
            <span className="line-clamp-2 text-kecil text-ink-600">
                {label}
            </span>
        </div>
    );
}
