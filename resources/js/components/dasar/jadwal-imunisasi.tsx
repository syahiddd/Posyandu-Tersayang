import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import { LABEL_JENIS_SEL, selJadwalPadaUmur } from '@/lib/jadwal-imunisasi';
import type {
    BarisJadwal,
    JenisSelJadwal,
    KolomJadwal,
} from '@/lib/jadwal-imunisasi';

/** Satu kolom umur pada tabel jadwal (bulan ke-0 = lahir). */
export type { BarisJadwal, KolomJadwal };

/**
 * Empat warna mengikuti legenda tabel Pelayanan Imunisasi Buku KIA hlm. 125:
 * putih = usia tepat, kuning = masih boleh dilengkapi, merah muda = imunisasi
 * kejar, dan abu-abu = usia tidak diperbolehkan. Warna selalu disertai teks.
 */
const KELAS_SEL: Record<JenisSelJadwal, string> = {
    tepat: 'border border-ink-200 bg-white text-ink-900',
    lengkapi: 'bg-status-waspada-latar text-status-waspada-teks',
    kejar: 'bg-girl-100 text-girl-700',
    terlarang: 'bg-ink-300 text-ink-600',
};

const LEGENDA: {
    jenis: JenisSelJadwal;
    label: string;
    keterangan: string;
}[] = [
    {
        jenis: 'tepat',
        label: 'Usia tepat pemberian',
        keterangan: 'Diberikan pada umur anjuran Buku KIA.',
    },
    {
        jenis: 'lengkapi',
        label: 'Masih boleh dilengkapi',
        keterangan: 'Masih dalam rentang usia bayi dan baduta.',
    },
    {
        jenis: 'kejar',
        label: 'Imunisasi kejar',
        keterangan: 'Jadwal bayi dan baduta yang belum lengkap.',
    },
    {
        jenis: 'terlarang',
        label: 'Tidak diperbolehkan',
        keterangan: 'Di luar rentang usia pemberian imunisasi.',
    },
];

/**
 * Tabel jadwal imunisasi bayi dan baduta (Buku KIA 2024, Tabel 29) sebagai
 * acuan baca cepat: baris = vaksin, kolom = umur, sel = nomor dosis berwarna.
 * Digulir horizontal di dalam kartunya dengan kolom vaksin tetap.
 */
export function JadwalImunisasi({
    kolom,
    baris,
}: {
    kolom: KolomJadwal[];
    baris: BarisJadwal[];
}) {
    const jumlahBulan = kolom.filter((satu) => satu.jenis === 'bulan').length;
    const jumlahKejar = kolom.length - jumlahBulan;
    const peta = baris.map((satu) =>
        kolom.map((umur) => selJadwalPadaUmur(satu.dosis, umur.umur)),
    );

    return (
        <div
            tabIndex={0}
            role="region"
            aria-label="Tabel jadwal imunisasi menurut umur"
            className="relative overflow-x-auto"
        >
            <table className="w-max min-w-full border-separate border-spacing-0 text-keterangan">
                <caption className="sr-only">
                    Jadwal imunisasi bayi dan baduta menurut umur, beserta
                    keterangan warna sel
                </caption>
                <thead>
                    <tr>
                        <th
                            scope="col"
                            rowSpan={2}
                            className="sticky left-0 z-30 min-w-28 border-r border-b border-brand-200 bg-brand-100 px-2.5 py-2 text-left align-bottom text-keterangan font-bold text-brand-900"
                        >
                            Imunisasi
                        </th>
                        {jumlahBulan > 0 && (
                            <th
                                scope="colgroup"
                                colSpan={jumlahBulan}
                                className="border-b border-brand-200 bg-brand-100 px-2 py-1.5 text-center text-label-seksi tracking-[0.08em] text-brand-700 uppercase"
                            >
                                Bulan
                            </th>
                        )}
                        {jumlahKejar > 0 && (
                            <th
                                scope="colgroup"
                                colSpan={jumlahKejar}
                                className="border-b border-l border-brand-200 bg-brand-100 px-2 py-1.5 text-center text-label-seksi tracking-[0.08em] text-brand-700 uppercase"
                            >
                                Kejar
                            </th>
                        )}
                    </tr>
                    <tr>
                        {kolom.map((satu, indeks) => (
                            <th
                                key={`${satu.label}-${indeks}`}
                                scope="col"
                                className={clsx(
                                    'min-w-9 border-b border-brand-200 bg-brand-50 px-1 py-1.5 text-center align-bottom text-keterangan font-bold text-brand-900 tabular-nums',
                                    satu.jenis !== 'bulan' &&
                                        indeks === jumlahBulan &&
                                        'border-l',
                                )}
                            >
                                {satu.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {baris.map((satu, indeksBaris) => {
                        const isi = peta[indeksBaris];

                        return (
                            <tr
                                key={satu.kelompok}
                                className="hover:bg-brand-50/40"
                            >
                                <th
                                    scope="row"
                                    className="sticky left-0 z-10 border-r border-b border-brand-100 bg-white px-2.5 py-1.5 text-left align-middle text-keterangan font-bold whitespace-nowrap text-ink-900"
                                >
                                    {satu.nama}
                                </th>
                                {kolom.map((kolomSatu, indeks) => {
                                    const sel = isi[indeks];

                                    return (
                                        <td
                                            key={`${kolomSatu.label}-${indeks}`}
                                            className={clsx(
                                                'border-b border-brand-100 p-0.5 text-center align-middle',
                                                kolomSatu.jenis !== 'bulan' &&
                                                    indeks === jumlahBulan &&
                                                    'border-l',
                                            )}
                                        >
                                            <span
                                                className={clsx(
                                                    'flex min-h-6 min-w-6 items-center justify-center rounded-sm text-label-seksi font-bold tabular-nums',
                                                    KELAS_SEL[sel.jenis],
                                                )}
                                                title={
                                                    LABEL_JENIS_SEL[sel.jenis]
                                                }
                                            >
                                                {sel.nomor}
                                                <span className="sr-only">
                                                    {LABEL_JENIS_SEL[sel.jenis]}
                                                </span>
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/** Keterangan warna tabel jadwal (Buku KIA halaman 124). */
export function KeteranganJadwal({ catatan }: { catatan?: string[] }) {
    return (
        <div className="rounded-lg border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-50 p-3.5">
            <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                <Info aria-hidden="true" className="size-3.5" />
                Keterangan
            </p>

            <ul className="mt-2.5 grid grid-cols-1 gap-1.5 tablet:grid-cols-2">
                {LEGENDA.map((satu) => (
                    <li key={satu.jenis} className="flex items-start gap-2">
                        <span
                            aria-hidden="true"
                            className={clsx(
                                'border-black/5 mt-0.5 size-4 shrink-0 rounded-sm border',
                                KELAS_SEL[satu.jenis],
                            )}
                        />
                        <span className="min-w-0 text-keterangan leading-snug text-ink-700">
                            <span className="font-bold text-ink-900">
                                {satu.label}
                            </span>{' '}
                            — {satu.keterangan}
                        </span>
                    </li>
                ))}
            </ul>

            {catatan && catatan.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1 border-t border-brand-100 pt-2.5">
                    {catatan.map((satu) => (
                        <li
                            key={satu}
                            className="text-justify text-keterangan leading-relaxed text-ink-600"
                        >
                            {satu}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
