import { Link } from '@inertiajs/react';
import { clsx } from 'clsx';
import { Scale } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChipStatus } from '@/components/dasar/chip-status';
import { formatDesimal } from '@/lib/desimal';
import { formatUmurTahunBulan } from '@/lib/umur';
import { inisial } from '@/lib/waktu';
import type { RingkasanAnak } from '@/types';

/**
 * Kartu anak di hasil pencarian Meja 1 (FR-15, DESIGN Gambar 4): warna
 * sesuai jenis kelamin (FR-68), jenis kelamin dalam teks, NIK tersamar
 * (NFR-05), kunjungan terakhir. Anak yang sudah diantre hari ini redup.
 *
 * Di daftar Data Anak kartu ini dapat diperkaya hasil ukur terakhir dan
 * status imunisasi (FR-70) lewat props opsional, tanpa mengubah Meja 1.
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

/** Contoh: "Ukur terakhir 5 Nov · BB 8,5 kg · TB 72 cm". */
function teksUkur(anak: RingkasanAnak): string | null {
    const ukur = anak.ukurTerakhir;

    if (!ukur) {
        return null;
    }

    const ukuran = [
        ukur.bb && `BB ${formatDesimal(Number(ukur.bb))} kg`,
        ukur.pbTb &&
            `${anak.umurBulan < 24 ? 'PB' : 'TB'} ${formatDesimal(Number(ukur.pbTb))} cm`,
    ]
        .filter(Boolean)
        .join(' · ');

    return ukuran === ''
        ? `Ukur terakhir ${ukur.tanggal}`
        : `Ukur terakhir ${ukur.tanggal} · ${ukuran}`;
}

/** Teks chip status imunisasi (FR-30). */
function teksImunisasi(anak: RingkasanAnak): string | null {
    const imunisasi = anak.imunisasi;

    if (!imunisasi) {
        return null;
    }

    if (imunisasi.sesuai) {
        return 'Imunisasi sesuai umur';
    }

    return imunisasi.terlambat
        ? `Imunisasi kejar: ${imunisasi.berikutnya}`
        : `Imunisasi berikutnya: ${imunisasi.berikutnya}`;
}

export function KartuHasilAnak({
    anak,
    dipilih = false,
    redupDiAntrean = true,
    tautanDetail,
    catatan,
    aksi,
    varian = 'ringkas',
}: {
    anak: RingkasanAnak;
    dipilih?: boolean;
    /** Meja 1 meredupkan anak yang sudah diantre; Data Anak tidak. */
    redupDiAntrean?: boolean;
    /** Bila diisi, seluruh isi identitas menjadi tautan ke detail anak. */
    tautanDetail?: string;
    /** Keterangan tambahan di bawah isi kartu, misalnya waktu penghapusan. */
    catatan?: ReactNode;
    /** Tombol aksi cepat di kaki kartu, misalnya "Lihat grafik & KMS". */
    aksi?: ReactNode;
    /**
     * "ringkas" (Meja 1, data terhapus) tetap datar; "daftar" (Data Anak)
     * memakai gradien blush, avatar bergradien, dan tipografi lebih tegas.
     */
    varian?: 'ringkas' | 'daftar';
}) {
    const laki = anak.jenisKelamin === 'L';
    const teksUkurAnak = teksUkur(anak);
    const teksImunisasiAnak = teksImunisasi(anak);
    const lengkap = varian === 'daftar';

    const identitas = (
        <>
            <span
                aria-hidden="true"
                className={clsx(
                    'flex shrink-0 items-center justify-center rounded-pill font-bold text-white shadow-1',
                    lengkap ? 'size-11 text-kecil' : 'size-12 text-teks',
                    lengkap
                        ? laki
                            ? 'bg-gradient-to-br from-boy-700 to-ink-900'
                            : 'bg-gradient-to-br from-girl-700 to-brand-900'
                        : laki
                          ? 'bg-boy-700'
                          : 'bg-girl-700',
                )}
            >
                {inisial(anak.nama)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span
                    className={clsx(
                        'text-ink-900',
                        lengkap ? 'text-judul-2' : 'text-teks font-bold',
                    )}
                >
                    {anak.nama}
                </span>
                <span
                    className={clsx(
                        'flex flex-wrap items-center gap-x-1.5 gap-y-1',
                        lengkap ? 'text-keterangan' : 'text-kecil',
                    )}
                >
                    <span
                        className={clsx(
                            'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 font-bold',
                            lengkap
                                ? laki
                                    ? 'bg-boy-100 text-boy-700'
                                    : 'bg-girl-100 text-girl-700'
                                : 'text-ink-700',
                        )}
                    >
                        {laki ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    <span
                        className={clsx(
                            lengkap ? 'font-bold text-ink-700' : 'text-ink-700',
                        )}
                    >
                        {formatUmurTahunBulan(anak.umurBulan)}
                    </span>
                    <span
                        className={clsx(
                            lengkap ? 'text-ink-500' : 'text-ink-700',
                        )}
                    >
                        {lengkap ? 'Ibu: ' : '· Ibu: '}
                        {anak.namaIbu}
                    </span>
                </span>
                <span
                    className={clsx(
                        lengkap
                            ? 'text-keterangan text-ink-500'
                            : 'text-kecil text-ink-700',
                    )}
                >
                    Lahir {anak.tanggalLahir}
                    {anak.nikSamar && ` · NIK ${anak.nikSamar}`}
                </span>
                <span
                    className={clsx(
                        'text-kecil',
                        anak.sudahDiAntrean
                            ? 'font-bold text-ink-900'
                            : lengkap
                              ? 'text-ink-600'
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
        </>
    );

    return (
        <div
            className={clsx(
                'flex w-full flex-col rounded-lg text-left shadow-1 transition-all',
                lengkap
                    ? 'border border-l-6 border-brand-100 bg-gradient-to-br from-white via-brand-50/60 to-brand-100 px-4 py-3.5 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-2'
                    : 'rounded-md border-l-6 px-4 py-3',
                lengkap
                    ? laki
                        ? 'border-l-boy-700'
                        : 'border-l-girl-700'
                    : clsx(
                          dipilih
                              ? 'border-2 border-brand-700'
                              : 'border border-ink-200',
                          laki
                              ? 'border-l-boy-700 bg-boy-50'
                              : 'border-l-girl-700 bg-girl-50',
                      ),
                redupDiAntrean && anak.sudahDiAntrean && 'opacity-70',
                /* Kotak tetap minimal supaya tidak numpuk saat isian panjang. */
                !tautanDetail && !lengkap && 'min-h-[120px]',
            )}
        >
            {tautanDetail ? (
                <Link
                    href={tautanDetail}
                    aria-label={labelHasilAnak(anak)}
                    className="flex items-start gap-4 rounded-sm"
                >
                    {identitas}
                </Link>
            ) : (
                <div className="flex items-start gap-4">{identitas}</div>
            )}

            {(teksUkurAnak || teksImunisasiAnak || catatan) && (
                <div
                    className={clsx(
                        'mt-3 flex flex-col items-start gap-1.5 border-t pt-3',
                        lengkap ? 'border-brand-200/70' : 'border-ink-200/70',
                    )}
                >
                    {teksUkurAnak && (
                        <span
                            className={clsx(
                                lengkap
                                    ? 'inline-flex items-center gap-1.5 rounded-pill bg-white/80 px-2.5 py-1 text-keterangan font-bold text-brand-800'
                                    : 'text-kecil text-ink-700',
                            )}
                        >
                            {lengkap && (
                                <Scale
                                    aria-hidden="true"
                                    className="size-3.5 shrink-0"
                                />
                            )}
                            {teksUkurAnak}
                        </span>
                    )}
                    {teksImunisasiAnak && (
                        <ChipStatus
                            varian={anak.imunisasi?.sesuai ? 'info' : 'waspada'}
                        >
                            {teksImunisasiAnak}
                        </ChipStatus>
                    )}
                    {catatan && (
                        <span className="text-kecil text-ink-700">
                            {catatan}
                        </span>
                    )}
                </div>
            )}

            {aksi && (
                <div
                    className={clsx(
                        'mt-3 flex flex-wrap gap-3',
                        lengkap && 'border-t border-brand-200/70 pt-2.5',
                    )}
                >
                    {aksi}
                </div>
            )}
        </div>
    );
}
