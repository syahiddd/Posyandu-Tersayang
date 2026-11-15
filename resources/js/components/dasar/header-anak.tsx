import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { JenisKelamin } from '@/types';
import { LencanaMeja } from './lencana-meja';

/**
 * Header anak (DESIGN bab 7): latar 700 sesuai jenis kelamin (FR-67) dengan
 * teks putih, tombol kembali bertulisan, nama, keterangan, lencana meja.
 * Sebelum jenis kelamin dipilih (formulir Tambah Anak) header netral.
 *
 * Gradien dibuat dua arah (pink → plum untuk perempuan, biru → navy untuk
 * laki-laki) dengan pendar lembut di sudut agar tidak terlihat datar.
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
                'relative isolate overflow-hidden transition-colors',
                jenisKelamin === 'L' &&
                    'bg-gradient-to-br from-boy-700 via-boy-700 to-ink-900 text-white',
                jenisKelamin === 'P' &&
                    'bg-gradient-to-br from-girl-700 via-girl-700 to-brand-900 text-white',
                !berwarna && 'border-b border-ink-200 bg-white text-ink-900',
            )}
        >
            {berwarna && (
                <>
                    <span
                        aria-hidden="true"
                        className={clsx(
                            'pointer-events-none absolute -top-16 -right-10 size-44 rounded-pill blur-3xl',
                            jenisKelamin === 'L'
                                ? 'bg-boy-100/25'
                                : 'bg-girl-100/25',
                        )}
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-20 -left-14 size-40 rounded-pill bg-brand-600/25 blur-3xl"
                    />
                </>
            )}
            <div
                className={clsx(
                    'mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pt-2 pb-4 tablet:px-5',
                    berwarna && 'relative',
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
                        <LencanaMeja
                            nomor={meja}
                            ukuran="kecil"
                            varian={berwarna ? 'terang' : 'plum'}
                        />
                    )}
                </div>
                <div>
                    <h1 className="text-judul-1">{nama}</h1>
                    {keterangan && (
                        <p
                            className={clsx(
                                'text-teks',
                                berwarna &&
                                    (jenisKelamin === 'L'
                                        ? 'text-boy-100'
                                        : 'text-girl-100'),
                            )}
                        >
                            {keterangan}
                        </p>
                    )}
                </div>
            </div>
        </header>
    );
}
