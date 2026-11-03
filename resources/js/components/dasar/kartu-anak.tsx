import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { formatUmurBulan } from '@/lib/umur';
import { inisial, lamaSejak } from '@/lib/waktu';
import type { KartuAntrean } from '@/types';
import { ChipStatus } from './chip-status';

/**
 * Kartu anak (DESIGN bab 7): garis kiri 6 px dan avatar berwarna sesuai
 * jenis kelamin (FR-68), jenis kelamin juga ditulis dalam teks, nomor
 * antrean di kanan. State: menunggu, dibuka kader lain, ditunda.
 */
export function labelKartuAnak(anak: KartuAntrean): string {
    return [
        anak.nama,
        anak.jenisKelamin === 'L' ? 'laki-laki' : 'perempuan',
        formatUmurBulan(anak.umurBulan),
        `antrean ${anak.nomorAntrean}`,
        anak.terkunci && anak.dibukaOleh
            ? `dibuka oleh ${anak.dibukaOleh}`
            : null,
        anak.perluUkurUlang ? 'perlu ukur ulang' : null,
    ]
        .filter(Boolean)
        .join(', ');
}

export function KartuAnak({
    anak,
    sekarang,
    redup = false,
    keterangan,
}: {
    anak: KartuAntrean;
    sekarang: Date;
    redup?: boolean;
    /** Baris tambahan, misalnya lama ditunda. */
    keterangan?: ReactNode;
}) {
    const laki = anak.jenisKelamin === 'L';

    return (
        <div
            className={clsx(
                'flex min-h-target-min w-full items-center gap-4 rounded-md border border-l-6 px-4 py-3 text-left shadow-1',
                laki
                    ? 'border-ink-200 border-l-boy-700 bg-boy-50'
                    : 'border-ink-200 border-l-girl-700 bg-girl-50',
                redup && 'opacity-70',
            )}
        >
            <span
                aria-hidden="true"
                className={clsx(
                    'flex size-12 shrink-0 items-center justify-center rounded-pill text-teks font-bold text-white',
                    laki ? 'bg-boy-700' : 'bg-girl-700',
                )}
            >
                {inisial(anak.nama)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-teks font-bold text-ink-900">
                    {anak.nama}
                </span>
                <span className="text-kecil text-ink-700">
                    {laki ? 'Laki-laki' : 'Perempuan'} ·{' '}
                    {formatUmurBulan(anak.umurBulan)} · Ibu: {anak.namaIbu}
                </span>
                {anak.terkunci && anak.dibukaOleh && anak.dibukaPada && (
                    <span className="text-kecil font-bold text-ink-700">
                        Dibuka oleh {anak.dibukaOleh} ·{' '}
                        {lamaSejak(anak.dibukaPada, sekarang)} lalu
                    </span>
                )}
                {anak.perluUkurUlang && (
                    <span>
                        <ChipStatus varian="waspada">
                            Perlu ukur ulang
                        </ChipStatus>
                    </span>
                )}
                {keterangan}
            </span>
            <span className="flex shrink-0 flex-col items-end">
                <span className="text-keterangan text-ink-600">Antrean</span>
                <span className="text-judul-2 text-ink-900 tabular-nums">
                    #{String(anak.nomorAntrean).padStart(2, '0')}
                </span>
            </span>
        </div>
    );
}
