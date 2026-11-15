import { Head, useForm } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    Activity,
    Baby,
    CalendarDays,
    History,
    IdCard,
    LineChart,
    MapPin,
    NotebookText,
    Phone,
    Plus,
    Ruler,
    Scale,
    Stethoscope,
    Syringe,
    User,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipStatus } from '@/components/dasar/chip-status';
import { Dialog } from '@/components/dasar/dialog';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { propsPanel, Tab } from '@/components/dasar/tab';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { GrafikPertumbuhan } from '@/components/grafik-pertumbuhan';
import { formatDesimal } from '@/lib/desimal';
import type { DataGrafik, IndeksGrafik } from '@/lib/grafik';
import { formatUmurLengkap, pecahUmur } from '@/lib/umur';
import { dataAnak, riwayatBukuKia } from '@/routes';
import { hapus as hapusAnak, ubah } from '@/routes/data-anak';
import type {
    DetailAnak,
    RiwayatKunjungan,
    RiwayatLayanan,
    RiwayatPengukuran,
} from '@/types';

type Props = {
    anak: DetailAnak;
    pengukuran: RiwayatPengukuran[];
    kunjungan: RiwayatKunjungan[];
    layanan: RiwayatLayanan[];
    perubahanTerakhir: { oleh: string; pada: string } | null;
    bolehHapus: boolean;
    /** Tab yang dibuka lebih dulu, dari aksi cepat daftar Data Anak (FR-50). */
    tabAwal: IdTab;
    /** Null bila anak belum punya pengukuran. */
    grafik: {
        tabAwal: IndeksGrafik;
        pakaiPanjang: boolean;
        daftar: Record<IndeksGrafik, DataGrafik>;
    } | null;
};

type IdTab = 'ringkasan' | 'grafik' | 'riwayat';

const KOSONG = '—';

function nilaiUkur(nilai: string | null, satuan: string): string {
    return nilai === null
        ? KOSONG
        : `${formatDesimal(Number(nilai))} ${satuan}`;
}

/** Satu baris label–nilai; dua kolom di tablet agar tidak memanjang. */
function Baris({
    label,
    nilai,
    ikon: Ikon,
}: {
    label: string;
    nilai: ReactNode;
    ikon?: LucideIcon;
}) {
    return (
        <div className="flex flex-col gap-0.5 py-2.5">
            <dt className="flex items-center gap-1.5 text-keterangan text-ink-500">
                {Ikon && (
                    <Ikon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-brand-600"
                    />
                )}
                {label}
            </dt>
            <dd className="text-teks font-bold break-words text-ink-900">
                {nilai === null || nilai === '' ? KOSONG : nilai}
            </dd>
        </div>
    );
}

/** Kartu seksi dengan kepala bergradasi dan ikon di tile plum. */
function Seksi({
    judul,
    ikon: Ikon,
    aksi,
    children,
    className,
}: {
    judul: string;
    ikon: LucideIcon;
    aksi?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={clsx(
                'overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1',
                className,
            )}
        >
            <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                    <Ikon
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2.4}
                    />
                </span>
                <h2 className="min-w-0 flex-1 text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                    {judul}
                </h2>
                {aksi}
            </div>
            <div className="px-3.5 py-1">{children}</div>
        </section>
    );
}

/** Petak kecil nilai ukur di kartu riwayat pengukuran. */
function PetakUkur({
    label,
    nilai,
    ikon: Ikon,
}: {
    label: string;
    nilai: string;
    ikon: LucideIcon;
}) {
    return (
        <div className="rounded-sm border border-brand-100 bg-white/85 px-2.5 py-1.5">
            <dt className="flex items-center gap-1 text-keterangan text-ink-500">
                <Ikon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-brand-600"
                />
                {label}
            </dt>
            <dd className="text-kecil font-bold text-ink-900 tabular-nums">
                {nilai}
            </dd>
        </div>
    );
}

function TandaBukuKia() {
    return (
        <span className="inline-flex items-center gap-1 rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold whitespace-nowrap text-brand-700">
            <NotebookText aria-hidden="true" className="size-3" />
            Buku KIA
        </span>
    );
}

function chipStatusNt(status: RiwayatPengukuran['statusNt']) {
    if (status === 'N') {
        return { varian: 'normal' as const, label: 'Berat naik' };
    }

    if (status === 'T') {
        return { varian: 'waspada' as const, label: 'Berat tidak naik' };
    }

    if (status === 'tidak_ditimbang') {
        return { varian: 'info' as const, label: 'Tidak ditimbang' };
    }

    return null;
}

/**
 * S15 Detail Anak (FR-51, DESIGN 6.5): header anak berwarna sesuai jenis
 * kelamin (FR-67); tab Ringkasan (identitas, orang tua, alamat), Grafik, dan
 * Riwayat (kunjungan dan layanan). NIK tampil lengkap hanya di sini (NFR-05).
 */
export default function DetailDataAnak({
    anak,
    pengukuran,
    kunjungan,
    layanan,
    perubahanTerakhir,
    bolehHapus,
    tabAwal,
    grafik,
}: Props) {
    const [tab, setTab] = useState<IdTab>(tabAwal);
    const [tabGrafik, setTabGrafik] = useState<IndeksGrafik>(
        grafik?.tabAwal ?? 'kms',
    );
    const [dialogHapus, setDialogHapus] = useState(false);
    const hapus = useForm({ konfirmasi: '' });
    // FR-53 langkah kedua: tombol Hapus aktif setelah nama anak diketik.
    const namaCocok =
        hapus.data.konfirmasi.trim().toLocaleLowerCase('id') ===
        anak.nama.trim().toLocaleLowerCase('id');

    function tutupDialog() {
        setDialogHapus(false);
        hapus.reset();
        hapus.clearErrors();
    }
    const laki = anak.jenisKelamin === 'L';
    const alamat = [
        anak.alamat,
        anak.rt !== null && `RT ${anak.rt}`,
        anak.rw !== null && `RW ${anak.rw}`,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <>
            <Head title={anak.nama} />
            <div className="flex min-h-dvh flex-col bg-gradient-to-b from-brand-50/70 via-paper to-paper">
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`${laki ? 'Laki-laki' : 'Perempuan'} · ${formatUmurLengkap(anak.umurBulan)}`}
                    jenisKelamin={anak.jenisKelamin}
                    kembali={dataAnak()}
                    kembaliLewatPost={false}
                />

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 tablet:px-5">
                    <Tab<IdTab>
                        label="Bagian detail anak"
                        aktif={tab}
                        onUbah={setTab}
                        item={[
                            { id: 'ringkasan', label: 'Ringkasan' },
                            { id: 'grafik', label: 'Grafik' },
                            { id: 'riwayat', label: 'Riwayat' },
                        ]}
                    />

                    {tab === 'ringkasan' && (
                        <div
                            {...propsPanel('ringkasan')}
                            className="flex flex-col gap-4"
                        >
                            {/* Ringkasan cepat: umur, jenis kelamin, Buku KIA. */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="relative isolate overflow-hidden rounded-md border border-brand-100 bg-gradient-to-br from-white via-brand-50/70 to-brand-100 px-2.5 py-2 shadow-1">
                                    <Baby
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-2 -bottom-2 size-9 text-brand-200/70"
                                    />
                                    <p className="relative text-keterangan text-ink-500">
                                        Umur
                                    </p>
                                    <p className="relative mt-0.5 text-kecil leading-tight font-bold text-brand-900 tabular-nums">
                                        {pecahUmur(anak.umurBulan).tahun > 0
                                            ? `${pecahUmur(anak.umurBulan).tahun} th ${pecahUmur(anak.umurBulan).bulan} bln`
                                            : `${pecahUmur(anak.umurBulan).bulan} bulan`}
                                    </p>
                                    {pecahUmur(anak.umurBulan).tahun > 0 && (
                                        <p className="relative text-keterangan leading-tight text-ink-500 tabular-nums">
                                            {
                                                pecahUmur(anak.umurBulan)
                                                    .teksBulan
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className="relative isolate overflow-hidden rounded-md border border-brand-100 bg-gradient-to-br from-white via-brand-50/70 to-brand-100 px-2.5 py-2 shadow-1">
                                    <User
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-2 -bottom-2 size-9 text-brand-200/70"
                                    />
                                    <p className="relative text-keterangan text-ink-500">
                                        Jenis kelamin
                                    </p>
                                    <p className="relative mt-0.5 text-kecil leading-tight font-bold text-brand-900">
                                        {laki ? 'Laki-laki' : 'Perempuan'}
                                    </p>
                                </div>
                                <div className="relative isolate overflow-hidden rounded-md border border-brand-100 bg-gradient-to-br from-white via-brand-50/70 to-brand-100 px-2.5 py-2 shadow-1">
                                    <NotebookText
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-2 -bottom-2 size-9 text-brand-200/70"
                                    />
                                    <p className="relative text-keterangan text-ink-500">
                                        Buku KIA
                                    </p>
                                    <p className="relative mt-0.5 text-kecil leading-tight font-bold text-brand-900">
                                        {anak.punyaBukuKia === null
                                            ? 'Belum diisi'
                                            : anak.punyaBukuKia
                                              ? 'Punya'
                                              : 'Tidak punya'}
                                    </p>
                                </div>
                            </div>

                            <Seksi judul="Identitas anak" ikon={IdCard}>
                                <dl className="grid tablet:grid-cols-2 tablet:gap-x-6">
                                    <Baris
                                        label="Nama lengkap"
                                        nilai={anak.nama}
                                    />
                                    <Baris
                                        label="NIK"
                                        nilai={
                                            anak.nik && (
                                                <span className="tabular-nums">
                                                    {anak.nik}
                                                </span>
                                            )
                                        }
                                    />
                                    <Baris
                                        label="Tempat, tanggal lahir"
                                        nilai={[
                                            anak.tempatLahir,
                                            anak.tanggalLahir,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                        ikon={CalendarDays}
                                    />
                                    <Baris
                                        label="Umur saat ini"
                                        nilai={formatUmurLengkap(
                                            anak.umurBulan,
                                        )}
                                        ikon={Baby}
                                    />
                                    <Baris
                                        label="Jenis kelamin"
                                        nilai={laki ? 'Laki-laki' : 'Perempuan'}
                                        ikon={User}
                                    />
                                    <Baris
                                        label="Punya Buku KIA"
                                        nilai={
                                            anak.punyaBukuKia === null
                                                ? 'Belum diisi'
                                                : anak.punyaBukuKia
                                                  ? 'Ya'
                                                  : 'Tidak'
                                        }
                                        ikon={NotebookText}
                                    />
                                </dl>
                            </Seksi>

                            <Seksi judul="Orang tua" ikon={Users}>
                                <dl className="grid tablet:grid-cols-2 tablet:gap-x-6">
                                    <Baris
                                        label="Nama ibu"
                                        nilai={anak.namaIbu}
                                        ikon={User}
                                    />
                                    <Baris
                                        label="NIK ibu"
                                        nilai={anak.nikIbu}
                                        ikon={IdCard}
                                    />
                                    <Baris
                                        label="Nama ayah"
                                        nilai={anak.namaAyah}
                                        ikon={User}
                                    />
                                    <Baris
                                        label="NIK ayah"
                                        nilai={anak.nikAyah}
                                        ikon={IdCard}
                                    />
                                    <Baris
                                        label="Nomor HP"
                                        nilai={anak.noHp}
                                        ikon={Phone}
                                    />
                                </dl>
                            </Seksi>

                            <Seksi judul="Alamat" ikon={MapPin}>
                                <dl className="grid tablet:grid-cols-2 tablet:gap-x-6">
                                    <Baris label="Alamat" nilai={alamat} />
                                    <Baris label="Dusun" nilai={anak.dusun} />
                                </dl>
                            </Seksi>

                            {perubahanTerakhir && (
                                <p className="flex items-center gap-1.5 text-keterangan text-ink-500">
                                    <History
                                        aria-hidden="true"
                                        className="size-3.5"
                                    />
                                    Diubah terakhir oleh{' '}
                                    {perubahanTerakhir.oleh},{' '}
                                    {perubahanTerakhir.pada}
                                </p>
                            )}
                            {bolehHapus && (
                                <Tombol
                                    varian="bahaya"
                                    className="self-start"
                                    onClick={() => setDialogHapus(true)}
                                >
                                    Hapus data anak
                                </Tombol>
                            )}
                        </div>
                    )}

                    <Dialog
                        terbuka={dialogHapus}
                        onTutup={tutupDialog}
                        judul={`Hapus data ${anak.nama}?`}
                        labelBahaya="Hapus"
                        bolehKonfirmasi={namaCocok}
                        memuat={hapus.processing}
                        onKonfirmasi={() =>
                            hapus.delete(hapusAnak.url(anak.id), {
                                preserveScroll: true,
                            })
                        }
                    >
                        <p>
                            Data dan seluruh riwayatnya dapat dipulihkan Ketua
                            Kader dalam 30 hari. Setelah itu terhapus permanen.
                        </p>
                        <IsianTeks
                            id="isian-konfirmasi"
                            label={`Ketik nama anak untuk memastikan: ${anak.nama}`}
                            autoComplete="off"
                            value={hapus.data.konfirmasi}
                            onChange={(event) =>
                                hapus.setData('konfirmasi', event.target.value)
                            }
                            galat={hapus.errors.konfirmasi}
                        />
                    </Dialog>

                    {tab === 'grafik' && (
                        <div
                            {...propsPanel('grafik')}
                            className="flex flex-col gap-4"
                        >
                            {grafik === null ? (
                                <Banner
                                    varian="info"
                                    judul="Belum ada pengukuran"
                                >
                                    Grafik tampil setelah anak diukur di Meja 2
                                    atau riwayat dari Buku KIA dimasukkan.
                                </Banner>
                            ) : (
                                <section
                                    aria-label="Grafik pertumbuhan"
                                    className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1"
                                >
                                    <div className="relative isolate overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 pt-3.5 pb-3 text-white">
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -top-12 -right-10 size-32 rounded-pill bg-brand-300/20 blur-2xl"
                                        />
                                        <div className="relative flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.14em] text-brand-200 uppercase">
                                                    <LineChart
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                    Grafik pertumbuhan
                                                </p>
                                                <p className="mt-1 text-judul-2 text-white">
                                                    {anak.nama}
                                                </p>
                                                <p className="text-kecil text-brand-100">
                                                    {
                                                        grafik.daftar[tabGrafik]
                                                            .judul
                                                    }
                                                </p>
                                            </div>
                                            <span
                                                className={clsx(
                                                    'rounded-pill border border-white/25 bg-white/15 px-2.5 py-1 text-keterangan font-bold whitespace-nowrap text-white backdrop-blur-sm',
                                                )}
                                            >
                                                {laki
                                                    ? 'Laki-laki'
                                                    : 'Perempuan'}{' '}
                                                · {anak.umurBulan} bln
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 px-4 py-3">
                                        <Tab<IndeksGrafik>
                                            label="Jenis grafik"
                                            aktif={tabGrafik}
                                            onUbah={setTabGrafik}
                                            varian="pil"
                                            item={[
                                                { id: 'kms', label: 'KMS' },
                                                { id: 'bb_u', label: 'BB/U' },
                                                {
                                                    id: 'pb_tb_u',
                                                    label: grafik.pakaiPanjang
                                                        ? 'PB/U'
                                                        : 'TB/U',
                                                },
                                                {
                                                    id: 'bb_pb_tb',
                                                    label: grafik.pakaiPanjang
                                                        ? 'BB/PB'
                                                        : 'BB/TB',
                                                },
                                                { id: 'imt_u', label: 'IMT/U' },
                                                { id: 'lk_u', label: 'LK' },
                                            ]}
                                        />
                                        <div
                                            id={`panel-${tabGrafik}`}
                                            role="tabpanel"
                                            aria-labelledby={`tab-${tabGrafik}`}
                                        >
                                            <GrafikPertumbuhan
                                                data={grafik.daftar[tabGrafik]}
                                                indeks={tabGrafik}
                                                jenisKelamin={anak.jenisKelamin}
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            <Seksi
                                judul="Hasil ukur"
                                ikon={Scale}
                                aksi={
                                    pengukuran.length > 0 ? (
                                        <span className="rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold text-brand-700">
                                            {pengukuran.length} kali
                                        </span>
                                    ) : undefined
                                }
                            >
                                {pengukuran.length === 0 ? (
                                    <p className="py-3 text-teks text-ink-600">
                                        Belum ada pengukuran.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-2 py-2.5">
                                        {pengukuran.map((ukur) => {
                                            const status = chipStatusNt(
                                                ukur.statusNt,
                                            );

                                            return (
                                                <li
                                                    key={ukur.id}
                                                    className="rounded-md border border-brand-100 bg-gradient-to-br from-white via-brand-50/60 to-brand-100/80 p-3"
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                                                                <CalendarDays
                                                                    aria-hidden="true"
                                                                    className="size-4"
                                                                />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="text-kecil font-bold text-ink-900">
                                                                    {
                                                                        ukur.tanggal
                                                                    }
                                                                </p>
                                                                <p className="text-keterangan text-ink-600">
                                                                    Umur{' '}
                                                                    {formatUmurLengkap(
                                                                        ukur.umurBulan,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {status && (
                                                                <ChipStatus
                                                                    varian={
                                                                        status.varian
                                                                    }
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </ChipStatus>
                                                            )}
                                                            {ukur.dariBukuKia && (
                                                                <TandaBukuKia />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <dl className="mt-2.5 grid grid-cols-2 gap-2 tablet:grid-cols-4">
                                                        <PetakUkur
                                                            label="Berat"
                                                            nilai={nilaiUkur(
                                                                ukur.bb,
                                                                'kg',
                                                            )}
                                                            ikon={Scale}
                                                        />
                                                        <PetakUkur
                                                            label={
                                                                ukur.caraUkur ===
                                                                'telentang'
                                                                    ? 'Panjang'
                                                                    : 'Tinggi'
                                                            }
                                                            nilai={nilaiUkur(
                                                                ukur.pbTb,
                                                                'cm',
                                                            )}
                                                            ikon={Ruler}
                                                        />
                                                        <PetakUkur
                                                            label="LiLA"
                                                            nilai={nilaiUkur(
                                                                ukur.lila,
                                                                'cm',
                                                            )}
                                                            ikon={Activity}
                                                        />
                                                        <PetakUkur
                                                            label="Lingkar kepala"
                                                            nilai={nilaiUkur(
                                                                ukur.lk,
                                                                'cm',
                                                            )}
                                                            ikon={Baby}
                                                        />
                                                    </dl>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </Seksi>
                        </div>
                    )}

                    {tab === 'riwayat' && (
                        <div
                            {...propsPanel('riwayat')}
                            className="flex flex-col gap-4"
                        >
                            <TombolTautan
                                href={riwayatBukuKia(anak.id)}
                                varian="sekunder"
                                lebarPenuh
                            >
                                <Plus aria-hidden="true" className="size-4" />
                                Tambah dari Buku KIA
                            </TombolTautan>

                            <Seksi
                                judul="Layanan"
                                ikon={Syringe}
                                aksi={
                                    layanan.length > 0 ? (
                                        <span className="rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold text-brand-700">
                                            {layanan.length} catatan
                                        </span>
                                    ) : undefined
                                }
                            >
                                {layanan.length === 0 ? (
                                    <p className="py-3 text-teks text-ink-600">
                                        Belum ada imunisasi, vitamin A, atau
                                        obat cacing tercatat.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-brand-100 py-1">
                                        {layanan.map((satu) => (
                                            <li
                                                key={satu.id}
                                                className="flex items-start gap-2.5 py-2.5"
                                            >
                                                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-pill bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                                                    <Syringe
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-kecil text-ink-900">
                                                        <span className="font-bold">
                                                            {satu.jenis}
                                                        </span>{' '}
                                                        · {satu.detail}
                                                    </p>
                                                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-keterangan text-ink-600">
                                                        {satu.tanggal}
                                                        {satu.nomorBatch &&
                                                            ` · Batch ${satu.nomorBatch}`}
                                                        {satu.dariBukuKia && (
                                                            <TandaBukuKia />
                                                        )}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Seksi>

                            <Seksi
                                judul="Kunjungan"
                                ikon={Stethoscope}
                                aksi={
                                    kunjungan.length > 0 ? (
                                        <span className="rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold text-brand-700">
                                            {kunjungan.length} kunjungan
                                        </span>
                                    ) : undefined
                                }
                            >
                                {kunjungan.length === 0 ? (
                                    <p className="py-3 text-teks text-ink-600">
                                        Belum pernah datang ke posyandu.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-brand-100 py-1">
                                        {kunjungan.map((satu) => (
                                            <li
                                                key={satu.id}
                                                className="flex items-start gap-2.5 py-2.5"
                                            >
                                                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-pill bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                                                    <CalendarDays
                                                        aria-hidden="true"
                                                        className="size-3.5"
                                                    />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                                        <p className="text-kecil font-bold text-ink-900">
                                                            {satu.tanggal}
                                                        </p>
                                                        <span className="rounded-pill border border-brand-200 bg-white px-2 py-0.5 text-keterangan font-bold text-brand-700 tabular-nums">
                                                            Antrean #
                                                            {String(
                                                                satu.nomorAntrean,
                                                            ).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-keterangan text-ink-600">
                                                        {satu.keadaan}
                                                    </p>
                                                    {satu.catatanPelayanan && (
                                                        <p className="mt-1 rounded-sm border border-brand-100 bg-brand-50/70 px-2 py-1 text-keterangan text-ink-700">
                                                            <span className="font-bold text-brand-800">
                                                                Catatan:
                                                            </span>{' '}
                                                            {
                                                                satu.catatanPelayanan
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Seksi>
                        </div>
                    )}

                    <KakiTombol denganNavigasi={false}>
                        <TombolTautan href={ubah(anak.id)} lebarPenuh>
                            Ubah data
                        </TombolTautan>
                    </KakiTombol>
                </main>
            </div>
        </>
    );
}
