import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { JenisKelamin } from '@/types';
import { LencanaMeja } from './lencana-meja';

/**
 * Header anak (DESIGN bab 7): latar 700 sesuai jenis kelamin (FR-67) dengan
 * teks putih, tombol kembali bertulisan, nama, keterangan, lencana meja.
 * Sebelum jenis kelamin dipilih (formulir Tambah Anak) header netral.
 */
export function HeaderAnak({
    nama,
    keterangan,
    jenisKelamin,
    meja,
    kembali,
    kembaliLewatPost = true,
    selebarPanel = false,
}: {
    nama: string;
    keterangan?: string;
    jenisKelamin: JenisKelamin | null;
    /** Tanpa meja (misalnya Detail Anak) lencana tidak ditampilkan. */
    meja?: number;
    kembali: NonNullable<InertiaLinkProps['href']>;
    /** Kembali dari layar anak melepas kunci (POST); dari formulir cukup GET. */
    kembaliLewatPost?: boolean;
    /** Layar anak di samping kolom antrean: header selebar area detail (bab 9). */
    selebarPanel?: boolean;
}) {
    const berwarna = jenisKelamin !== null;

    return (
        <header
            className={clsx(
                'transition-colors',
                jenisKelamin === 'L' && 'bg-boy-700 text-white',
                jenisKelamin === 'P' && 'bg-girl-700 text-white',
                !berwarna && 'border-b border-ink-200 bg-white text-ink-900',
            )}
        >
            <div
                className={clsx(
                    'mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pt-2 pb-4 tablet:px-5',
                    selebarPanel && 'panel:mx-0 panel:max-w-none panel:px-6',
                )}
            >
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href={kembali}
                        {...(kembaliLewatPost
                            ? { method: 'post' as const, as: 'button' }
                            : {})}
                        className={clsx(
                            '-ml-2 inline-flex min-h-target-min cursor-pointer items-center gap-1 rounded-md px-2 text-teks font-bold',
                            berwarna && 'focus-visible:outline-white',
                        )}
                    >
                        <span aria-hidden="true">‹</span> Kembali
                    </Link>
                    {meja !== undefined && (
                        <LencanaMeja nomor={meja} ukuran="kecil" />
                    )}
                </div>
                <div>
                    <h1 className="text-judul-1">{nama}</h1>
                    {keterangan && <p className="text-teks">{keterangan}</p>}
                </div>
            </div>
        </header>
    );
}
