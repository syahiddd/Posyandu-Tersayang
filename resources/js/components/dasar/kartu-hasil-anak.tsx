import { clsx } from 'clsx';
import { formatUmurTahunBulan } from '@/lib/umur';
import { inisial } from '@/lib/waktu';
import type { RingkasanAnak } from '@/types';

/**
 * Kartu anak di hasil pencarian Meja 1 (FR-15, DESIGN Gambar 4): warna
 * sesuai jenis kelamin (FR-68), jenis kelamin dalam teks, NIK tersamar
 * (NFR-05), kunjungan terakhir. Anak yang sudah diantre hari ini redup.
 */
export function labelHasilAnak(anak: RingkasanAnak): string {
    return [
        anak.nama,
        anak.jenisKelamin === 'L' ? 'laki-laki' : 'perempuan',
        formatUmurTahunBulan(anak.umurBulan),
        `ibu ${anak.namaIbu}`,
        anak.sudahDiAntrean ? 'sudah di antrean hari ini' : null,
    ]
        .filter(Boolean)
        .join(', ');
}

export function KartuHasilAnak({
    anak,
    dipilih = false,
}: {
    anak: RingkasanAnak;
    dipilih?: boolean;
}) {
    const laki = anak.jenisKelamin === 'L';

    return (
        <div
            className={clsx(
                'flex w-full items-start gap-4 rounded-md border-l-6 px-4 py-3 text-left shadow-1',
                dipilih ? 'border-2 border-ink-900' : 'border border-ink-200',
                laki
                    ? 'border-l-boy-700 bg-boy-50'
                    : 'border-l-girl-700 bg-girl-50',
                anak.sudahDiAntrean && 'opacity-70',
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
                <span className="text-teks font-bold text-ink-900">
                    {anak.nama}
                </span>
                <span className="text-kecil text-ink-700">
                    {laki ? 'Laki-laki' : 'Perempuan'} ·{' '}
                    {formatUmurTahunBulan(anak.umurBulan)} · Ibu: {anak.namaIbu}
                </span>
                <span className="text-kecil text-ink-700">
                    Lahir {anak.tanggalLahir}
                    {anak.nikSamar && ` · NIK ${anak.nikSamar}`}
                </span>
                <span
                    className={clsx(
                        'text-kecil',
                        anak.sudahDiAntrean
                            ? 'font-bold text-ink-900'
                            : 'text-ink-700',
                    )}
                >
                    {anak.sudahDiAntrean
                        ? 'Sudah di antrean hari ini'
                        : anak.kunjunganTerakhir
                          ? `Terakhir datang ${anak.kunjunganTerakhir}`
                          : 'Belum pernah datang'}
                </span>
            </span>
        </div>
    );
}
