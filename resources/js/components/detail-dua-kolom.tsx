import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Detail dua kolom layar anak (DESIGN bab 9: "detail dua kolom", tombol
 * utama di kolom kanan selebar kolom). Berdasarkan lebar area detail, bukan
 * lebar layar: dua kolom saat wadah `@container` terdekat >= 640 px
 * (keputusan pemilik produk; kolom lebih sempit dari ±300 px terlalu padat
 * untuk isian 52 px).
 *
 * Di bawah itu kedua kolom memakai `display: contents`, sehingga isinya
 * menjadi satu kolom seperti di ponsel dan kaki tombol tetap menempel di
 * bawah layar. Urutan DOM kiri lalu kanan = urutan fokus (bab 10.2).
 */
export function DetailDuaKolom({
    kiri,
    kanan,
    className,
}: {
    kiri: ReactNode;
    kanan: ReactNode;
    /** Jarak antarisian, misalnya gap-4 atau gap-5. */
    className?: string;
}) {
    const kolom = 'contents @min-[640px]:flex @min-[640px]:flex-col';

    return (
        <div
            className={clsx(
                'flex flex-1 flex-col @min-[640px]:grid @min-[640px]:grid-cols-2 @min-[640px]:content-start @min-[640px]:items-start @min-[640px]:gap-x-6',
                className,
            )}
        >
            <div className={clsx(kolom, className)}>{kiri}</div>
            <div className={clsx(kolom, className)}>{kanan}</div>
        </div>
    );
}
