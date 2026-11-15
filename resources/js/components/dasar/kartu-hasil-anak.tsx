import { Link } from '@inertiajs/react';
import { clsx } from 'clsx';
import { CircleCheck, Clock, Scale, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChipStatus } from '@/components/dasar/chip-status';
import { formatDesimal } from '@/lib/desimal';
import {
    KELAS_TINGKAT_STUNTING,
    LABEL_TINGKAT_STUNTING,
    tingkatStunting,
} from '@/lib/stunting';
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

/** Badge status stunting: hijau aman, kuning rentan, merah stunting. */
function BadgeStunting({ anak }: { anak: RingkasanAnak }) {
    const stunting = anak.stunting;

    if (!stunting) {
        return null;
    }

    const tingkat = tingkatStunting(stunting.hasil);

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-keterangan font-bold',
                KELAS_TINGKAT_STUNTING[tingkat],
            )}
        >
            <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0" />
            {LABEL_TINGKAT_STUNTING[tingkat]}
        </span>
    );
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
     * "ringkas" (Meja 1, data terhapus) memakai kartu putih bertepi kiri
     * warna jenis kelamin; "daftar" (Data Anak) memakai gradien blush,
     * avatar bergradien, dan tipografi lebih tegas.
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
                    lengkap ? 'size-11 text-kecil' : 'size-10 text-kecil',
                    laki
                        ? 'bg-gradient-to-br from-boy-700 to-ink-900'
                        : 'bg-gradient-to-br from-girl-700 to-brand-900',
                )}
            >
                {inisial(anak.nama)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                    className={clsx(
                        'text-ink-900',
                        lengkap
                            ? 'text-judul-2'
                            : 'text-teks leading-tight font-bold',
                    )}
                >
                    {anak.nama}
                </span>

                <span
                    className={clsx(
                        'flex flex-wrap items-center gap-x-2 gap-y-1',
                        lengkap ? 'text-keterangan' : 'text-kecil',
                    )}
                >
                    <span
                        className={clsx(
                            'inline-flex items-center rounded-pill px-2 py-0.5 text-label-seksi font-bold tracking-[0.04em] uppercase',
                            laki
                                ? 'bg-boy-100 text-boy-700'
                                : 'bg-girl-100 text-girl-700',
                        )}
                    >
                        {laki ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    <span className="font-bold text-ink-700">
                        {formatUmurTahunBulan(anak.umurBulan)}
                    </span>
                </span>

                <span
                    className={clsx(
                        'text-kecil text-ink-700',
                        lengkap && 'text-keterangan text-ink-500',
                    )}
                >
                    <span className="font-bold text-ink-900">Ibu:</span>{' '}
                    {anak.namaIbu}
                </span>

                <span
                    className={clsx(
                        'text-keterangan',
                        lengkap ? 'text-ink-500' : 'text-ink-600',
                    )}
                >
                    Lahir {anak.tanggalLahir}
                    {anak.nikSamar && ` · NIK ${anak.nikSamar}`}
                </span>

                <span
                    className={clsx(
                        'mt-0.5 inline-flex items-center gap-1 text-keterangan font-bold',
                        anak.sudahDiAntrean ? 'text-brand-800' : 'text-ink-600',
                    )}
                >
                    {anak.sudahDiAntrean ? (
                        <>
                            <CircleCheck
                                aria-hidden="true"
                                className="size-3.5 shrink-0"
                            />
                            Sudah di antrean hari ini
                        </>
                    ) : (
                        <>
                            <Clock
                                aria-hidden="true"
                                className="size-3.5 shrink-0"
                            />
                            {anak.kunjunganTerakhir
                                ? `Terakhir datang ${anak.kunjunganTerakhir}`
                                : 'Belum pernah datang'}
                        </>
                    )}
                </span>
            </span>
        </>
    );

    return (
        <div
            className={clsx(
                'flex w-full flex-col text-left transition-all',
                lengkap
                    ? 'rounded-lg border border-l-6 border-brand-100 bg-gradient-to-br from-white via-brand-50/60 to-brand-100 px-4 py-3.5 shadow-1 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-2'
                    : 'rounded-md border border-l-6 border-ink-200 bg-white px-3.5 py-3 shadow-1',
                lengkap
                    ? laki
                        ? 'border-l-boy-700'
                        : 'border-l-girl-700'
                    : clsx(
                          laki ? 'border-l-boy-700' : 'border-l-girl-700',
                          dipilih &&
                              'border-brand-700 ring-2 ring-brand-700 ring-inset',
                      ),
                redupDiAntrean && anak.sudahDiAntrean && 'opacity-70',
            )}
        >
            {tautanDetail ? (
                <Link
                    href={tautanDetail}
                    aria-label={labelHasilAnak(anak)}
                    className="flex items-start gap-3 rounded-sm"
                >
                    {identitas}
                </Link>
            ) : (
                <div className="flex items-start gap-3">{identitas}</div>
            )}

            {(teksUkurAnak ||
                teksImunisasiAnak ||
                anak.stunting ||
                catatan) && (
                <div
                    className={clsx(
                        'mt-2.5 flex flex-col items-start gap-1.5 border-t pt-2.5',
                        lengkap ? 'border-brand-200/70' : 'border-ink-200',
                    )}
                >
                    {teksUkurAnak && (
                        <span
                            className={clsx(
                                lengkap
                                    ? 'inline-flex items-center gap-1.5 rounded-pill bg-white/80 px-2.5 py-1 text-keterangan font-bold text-brand-800'
                                    : 'inline-flex items-center gap-1.5 text-keterangan font-bold text-ink-700',
                            )}
                        >
                            <Scale
                                aria-hidden="true"
                                className="size-3.5 shrink-0 text-brand-600"
                            />
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
                    <BadgeStunting anak={anak} />
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
