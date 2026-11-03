import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Kaki tombol (DESIGN Prinsip 1 dan bab 9): tombol utama menempel di bawah
 * dalam jangkauan jempol, sehingga kader tidak perlu menggulir untuk
 * menyimpan. Di ponsel berada tepat di atas navigasi bawah.
 */
export function KakiTombol({
    children,
    denganNavigasi = true,
    className,
}: {
    children: ReactNode;
    /** False untuk layar tanpa navigasi bawah, misalnya Pilih Meja. */
    denganNavigasi?: boolean;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                'sticky z-30 -mx-4 mt-auto border-t border-ink-200 bg-white px-4 py-3',
                'tablet:mx-0 tablet:border-0 tablet:bg-paper tablet:px-0 desktop:static desktop:bg-transparent',
                denganNavigasi ? 'bottom-19 tablet:bottom-0' : 'bottom-0',
                className,
            )}
        >
            <div className="flex gap-2">{children}</div>
        </div>
    );
}
