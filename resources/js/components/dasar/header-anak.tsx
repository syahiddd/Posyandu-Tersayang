import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { JenisKelamin } from '@/types';
import { LencanaMeja } from './lencana-meja';

/**
 * Header anak (DESIGN bab 7): latar 700 sesuai jenis kelamin (FR-67) dengan
 * teks putih, tombol kembali bertulisan, nama, keterangan, lencana meja.
 * Tombol kembali melepas anak ke antrean (method POST).
 */
export function HeaderAnak({
    nama,
    keterangan,
    jenisKelamin,
    meja,
    kembali,
}: {
    nama: string;
    keterangan: string;
    jenisKelamin: JenisKelamin;
    meja: number;
    kembali: NonNullable<InertiaLinkProps['href']>;
}) {
    return (
        <header
            className={clsx(
                'text-white',
                jenisKelamin === 'L' ? 'bg-boy-700' : 'bg-girl-700',
            )}
        >
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pt-2 pb-4 tablet:px-5">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href={kembali}
                        method="post"
                        as="button"
                        className="-ml-2 inline-flex min-h-target-min cursor-pointer items-center gap-1 rounded-md px-2 text-teks font-bold focus-visible:outline-white"
                    >
                        <span aria-hidden="true">‹</span> Kembali
                    </Link>
                    <LencanaMeja nomor={meja} ukuran="kecil" />
                </div>
                <div>
                    <h1 className="text-judul-1">{nama}</h1>
                    <p className="text-teks">{keterangan}</p>
                </div>
            </div>
        </header>
    );
}
