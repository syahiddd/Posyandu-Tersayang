import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Banner (DESIGN bab 7): judul tebal satu baris dan penjelasan, garis kiri
 * 5 px. Bahaya dan peringatan memakai warna status (Tabel 6: error dan
 * peringatan isian); sukses dan info netral karena hijau khusus status gizi.
 */
export type VarianBanner =
    | 'bahaya'
    | 'peringatan'
    | 'sukses'
    | 'info'
    | 'offline';

const kelasVarian: Record<VarianBanner, string> = {
    bahaya: 'border-status-bahaya-teks bg-status-bahaya-latar text-status-bahaya-teks',
    peringatan:
        'border-status-waspada-teks bg-status-waspada-latar text-status-waspada-teks',
    sukses: 'border-ink-900 bg-white text-ink-900',
    info: 'border-ink-600 bg-status-info-latar text-status-info-teks',
    offline: 'border-ink-900 bg-ink-900 text-white',
};

type PropsBanner = {
    varian: VarianBanner;
    judul?: string;
    children?: ReactNode;
    /** Bila diisi, banner dapat ditutup dengan tombol Tutup. */
    onTutup?: () => void;
    className?: string;
};

export function Banner({
    varian,
    judul,
    children,
    onTutup,
    className,
}: PropsBanner) {
    return (
        <div
            role={varian === 'bahaya' ? 'alert' : 'status'}
            className={clsx(
                'flex items-start gap-3 rounded-md border-l-5 px-4 py-3',
                kelasVarian[varian],
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                {judul && <p className="text-teks font-bold">{judul}</p>}
                {children && <div className="text-teks">{children}</div>}
            </div>
            {onTutup && (
                <button
                    type="button"
                    onClick={onTutup}
                    className="-my-3 -mr-2 inline-flex min-h-target-min min-w-target-min shrink-0 cursor-pointer items-center justify-center px-2 text-kecil underline underline-offset-4"
                >
                    Tutup
                </button>
            )}
        </div>
    );
}
