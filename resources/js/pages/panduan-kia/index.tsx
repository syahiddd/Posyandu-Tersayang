import { Head, router } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    AlertTriangle,
    Baby,
    BookOpen,
    CalendarDays,
    Check,
    ChevronDown,
    ClipboardList,
    Clock,
    Droplets,
    HeartPulse,
    Info,
    Milk,
    Moon,
    Ruler,
    ShieldCheck,
    Sparkles,
    Stethoscope,
    Thermometer,
    Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { Seksi } from '@/components/dasar/seksi';
import { propsPanel, Tab } from '@/components/dasar/tab';
import { formatUmurBulan, formatUmurLengkap } from '@/lib/umur';
import { panduanKia } from '@/routes';

type KelompokUmur = { dari: number; label: string };

type AnjuranUmur = {
    dari: number;
    sampai: number;
    label: string;
    halaman: string;
    anjuran: string[];
};

type PorsiMpasi = {
    dari: number;
    sampai: number;
    label: string;
    jumlah: string;
    frekuensi: string;
    energi: string;
    tekstur: string;
    cairan: string;
};

type Panduan = {
    umurBulan: number;
    asi: {
        judul: string;
        sumber: string;
        definisi: string;
        langkah: string[];
        alasan: string[];
        frekuensi: { waktu: string; lambung: string; frekuensi: string }[];
        penyimpanan: { tempat: string; suhu: string; lama: string }[];
        catatanPenyimpanan: string[];
    };
    mpasi: {
        judul: string;
        sumber: string;
        syarat: { judul: string; isi: string }[];
        variasi: { kelompok: string; contoh: string }[];
        porsi: PorsiMpasi[];
        catatan: string[];
    };
    porsiMpasi: PorsiMpasi | null;
    anjuranUmur: AnjuranUmur | null;
    anjuranSemua: AnjuranUmur[];
    tandaBahaya: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    } | null;
    tandaBahayaSemua: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    }[];
    pemantauanBulanan: { judul: string; sumber: string; daftar: string[] };
    perawatanSakit: {
        kode: string;
        judul: string;
        halaman: string;
        lakukan: string[];
        segera: string[];
    }[];
    cairan: {
        sumber: string;
        daftar: { umur: string; jumlah: string }[];
        catatan: string;
    };
    gigi: {
        sumber: string;
        daftar: { umur: string; cara: string }[];
        hindari: string[];
    };
    stimulasi: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    } | null;
    stimulasiSemua: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    }[];
    tidur: {
        sumber: string;
        daftar: { umur: string; durasi: string }[];
        gawai: string[];
    };
    tindakLanjut: {
        kode: string;
        judul: string;
        tingkat: string;
        tindakan: string[];
        sumber: string;
    }[];
    tindakLanjutLila: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        kategori: {
            kode: string;
            batas: string;
            label: string;
            tingkat: string;
            tindakan: string;
        }[];
    }[];
};

type Props = {
    umurBulan: number;
    panduan: Panduan;
    kelompokUmur: KelompokUmur[];
};

type IdTab = 'anjuran' | 'asi-mpasi' | 'bahaya' | 'tindak-lanjut' | 'perawatan';

const LABEL_TINGKAT: Record<string, string> = {
    rujuk: 'Rujuk ke puskesmas',
    tindak_lanjut: 'Tindak lanjut di Posyandu',
    pantau: 'Pantau bulan depan',
};

/**
 * Paragraf penjelasan: rata kanan-kiri (justify) agar tepi blok panjang rapi,
 * dengan pemenggalan kata otomatis supaya tidak muncul celah kata lebar di
 * layar ponsel.
 */
function Paragraf({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p
            className={clsx(
                'text-justify text-teks leading-relaxed [text-wrap:pretty] hyphens-auto text-ink-700',
                className,
            )}
        >
            {children}
        </p>
    );
}

/**
 * Daftar butir bernomor: nomor bulat kecil di kiri agar tiap butir terpisah
 * jelas dan mudah disebut saat dibacakan bersama ibu. Teks rata kanan-kiri
 * untuk penjelasan panjang.
 */
function Daftar({ item }: { item: string[] }) {
    return (
        <ol className="flex flex-col gap-2">
            {item.map((satu, indeks) => (
                <li
                    key={satu}
                    className="flex items-start gap-2.5 text-teks leading-relaxed [text-wrap:pretty] text-ink-700"
                >
                    <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-brand-100 text-label-seksi font-bold text-brand-800 tabular-nums"
                    >
                        {indeks + 1}
                    </span>
                    <span
                        className="min-w-0 flex-1"
                        style={{ textAlign: 'justify' }}
                    >
                        {satu}
                    </span>
                </li>
            ))}
        </ol>
    );
}

function Sumber({ children }: { children: string }) {
    return (
        <p className="flex items-center gap-1.5 border-t border-brand-100 pt-2 text-keterangan text-ink-500">
            <BookOpen aria-hidden="true" className="size-3.5 shrink-0" />
            {children}
        </p>
    );
}

/** Sub-judul kecil di dalam kartu seksi, dengan garis aksen plum di kiri. */
function SubJudul({
    children,
    ikon: Ikon,
}: {
    children: ReactNode;
    ikon?: LucideIcon;
}) {
    return (
        <p className="flex items-center gap-2 border-l-4 border-brand-600 pl-2 text-kecil font-bold text-brand-900">
            {Ikon && (
                <Ikon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-brand-600"
                />
            )}
            {children}
        </p>
    );
}

/** Petak label–nilai kecil untuk porsi MPASI, cairan, gigi, dan tidur. */
function Petak({
    label,
    nilai,
    ikon: Ikon,
}: {
    label: string;
    nilai: string;
    ikon: LucideIcon;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1 rounded-md border border-brand-100 bg-white px-2.5 py-2 shadow-1">
            <dt className="flex items-center gap-1 text-label-seksi tracking-[0.06em] text-ink-500 uppercase">
                <Ikon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-brand-600"
                />
                {label}
            </dt>
            <dd className="text-kecil leading-snug font-bold break-words text-ink-900">
                {nilai}
            </dd>
        </div>
    );
}

/**
 * Blok yang dapat dilipat untuk daftar panjang (semua kelompok umur). Ringkas
 * saat tertutup sehingga halaman tidak terasa padat. Judul memakai huruf
 * kecil tebal, keterangan halaman di bawahnya, dan panah plum di kanan.
 */
function Lipatan({
    judul,
    keterangan,
    children,
}: {
    judul: string;
    keterangan?: string;
    children: ReactNode;
}) {
    return (
        <details className="group overflow-hidden rounded-md border border-brand-100 bg-white shadow-1 open:border-brand-200">
            <summary className="flex min-h-target-min cursor-pointer list-none items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-brand-50/70">
                <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-700 group-open:bg-gradient-to-br group-open:from-brand-800 group-open:to-brand-600 group-open:text-white"
                >
                    <BookOpen className="size-3.5" strokeWidth={2.4} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-kecil font-bold text-ink-900">
                        {judul}
                    </span>
                    {keterangan && (
                        <span className="text-keterangan text-ink-500">
                            {keterangan}
                        </span>
                    )}
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className="size-4 shrink-0 text-brand-700 transition-transform group-open:rotate-180"
                />
            </summary>
            <div className="border-t border-brand-100 bg-brand-50/30 px-3 py-3">
                {children}
            </div>
        </details>
    );
}

/**
 * Panduan KIA (Buku KIA 2024): materi edukasi yang dibaca kader bersama ibu.
 * Penyaring umur mengubah anjuran, tanda bahaya, porsi MPASI, dan stimulasi
 * yang ditampilkan. Seluruh isi berasal dari Buku KIA; tidak ada anjuran di
 * luar buku.
 */
export default function PanduanKiaPage({
    umurBulan,
    panduan,
    kelompokUmur,
}: Props) {
    const [tab, setTab] = useState<IdTab>('anjuran');

    // Chip yang tersorot mengikuti kelompok umur, bukan bulan persisnya,
    // sehingga ?umur=10 tetap menyorot "Bayi 9–11 bulan".
    const kelompokTerpilih = String(panduan.anjuranUmur?.dari ?? umurBulan);

    // Kelompok stimulasi di buku lebih rinci daripada kelompok anjuran
    // (mis. 12–23 bulan mencakup 12–18 dan 18–24 bulan), jadi tampilkan
    // semua kelompok stimulasi yang beririsan dengan umur terpilih.
    const dariKelompok = panduan.anjuranUmur?.dari ?? umurBulan;
    const sampaiKelompok = panduan.anjuranUmur?.sampai ?? umurBulan;
    const stimulasiTampil = panduan.stimulasiSemua.filter(
        (satu) => satu.dari <= sampaiKelompok && satu.sampai >= dariKelompok,
    );

    function ubahUmur(nilai: string) {
        router.get(
            panduanKia.url(),
            { umur: nilai },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Panduan KIA" />
            <div className="flex flex-col gap-4 desktop:max-w-3xl">
                <header className="relative isolate overflow-hidden rounded-lg bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 pt-4 pb-4 text-white shadow-2 tablet:px-5">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-14 -right-10 size-40 rounded-pill bg-brand-300/20 blur-3xl"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-16 -left-12 size-36 rounded-pill bg-brand-600/30 blur-3xl"
                    />

                    <div className="relative">
                        <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                            <BookOpen aria-hidden="true" className="size-3.5" />
                            Buku KIA 2024
                        </p>
                        <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                            Panduan KIA
                        </h1>
                        <p className="mt-1 text-kecil text-brand-100">
                            Materi edukasi untuk dibacakan bersama ibu. Pilih
                            umur anak agar anjuran sesuai.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {panduan.anjuranUmur && (
                                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/20 bg-white/15 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="size-3.5"
                                    />
                                    {panduan.anjuranUmur.label}
                                </span>
                            )}
                            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-brand-100 backdrop-blur-sm">
                                <Baby aria-hidden="true" className="size-3.5" />
                                Umur {formatUmurLengkap(umurBulan)}
                            </span>
                        </div>
                    </div>
                </header>

                <Seksi judul="Pilih umur anak" ikon={CalendarDays}>
                    <div className="flex flex-col gap-2.5 py-2.5">
                        <div
                            role="group"
                            aria-label="Kelompok umur"
                            className="grid grid-cols-2 gap-2 tablet:grid-cols-3"
                        >
                            {kelompokUmur.map((satu) => {
                                const terpilih =
                                    String(satu.dari) === kelompokTerpilih;
                                // Label dari Buku KIA berbentuk
                                // "Bayi baru lahir (0–28 hari)"; rentang umur
                                // dipisah ke lencana agar baris judul tetap
                                // pendek dan tidak berlipat tiga baris.
                                const cocok = satu.label.match(
                                    /^(.*?)\s*\(([^)]+)\)\s*$/,
                                );
                                const nama = cocok ? cocok[1] : satu.label;
                                const rentang = cocok ? cocok[2] : null;

                                return (
                                    <button
                                        key={satu.dari}
                                        type="button"
                                        aria-pressed={terpilih}
                                        title={satu.label}
                                        onClick={() =>
                                            ubahUmur(String(satu.dari))
                                        }
                                        className={clsx(
                                            'flex min-h-target-min cursor-pointer flex-col justify-center gap-1 rounded-md border-2 px-2.5 py-2 text-left transition-all',
                                            terpilih
                                                ? 'border-brand-800 bg-gradient-to-br from-brand-800 to-brand-600 text-white shadow-2'
                                                : 'border-brand-100 bg-white text-ink-900 shadow-1 hover:border-brand-300 hover:shadow-2',
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center gap-1.5">
                                            <span
                                                aria-hidden="true"
                                                className={clsx(
                                                    'flex size-5 shrink-0 items-center justify-center rounded-pill',
                                                    terpilih
                                                        ? 'bg-white/25 text-white'
                                                        : 'bg-brand-50 text-brand-600',
                                                )}
                                            >
                                                {terpilih ? (
                                                    <Check
                                                        className="size-3"
                                                        strokeWidth={3}
                                                    />
                                                ) : (
                                                    <Baby className="size-3" />
                                                )}
                                            </span>
                                            <span className="min-w-0 text-kecil leading-tight font-bold">
                                                {nama}
                                            </span>
                                        </span>
                                        {rentang && (
                                            <span
                                                className={clsx(
                                                    'inline-flex w-fit rounded-pill px-1.5 py-0.5 text-label-seksi font-bold tracking-[0.04em] tabular-nums',
                                                    terpilih
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-brand-50 text-brand-700',
                                                )}
                                            >
                                                {rentang}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="flex items-start gap-1.5 text-keterangan text-ink-600">
                            <Info
                                aria-hidden="true"
                                className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                            />
                            {panduan.anjuranUmur === null
                                ? `Belum ada kelompok umur untuk ${formatUmurBulan(umurBulan)}.`
                                : `Menampilkan ${panduan.anjuranUmur.label} · umur ${formatUmurBulan(umurBulan)}.`}
                        </p>
                    </div>
                </Seksi>

                <Tab<IdTab>
                    label="Bagian panduan"
                    aktif={tab}
                    onUbah={setTab}
                    item={[
                        { id: 'anjuran', label: 'Anjuran' },
                        { id: 'asi-mpasi', label: 'ASI & MPASI' },
                        { id: 'bahaya', label: 'Bahaya' },
                        { id: 'tindak-lanjut', label: 'Tindak lanjut' },
                        { id: 'perawatan', label: 'Perawatan' },
                    ]}
                />

                {tab === 'anjuran' && (
                    <div
                        {...propsPanel('anjuran')}
                        className="flex flex-col gap-3"
                    >
                        {panduan.anjuranUmur === null ? (
                            <Banner varian="info">
                                Belum ada anjuran untuk umur ini.
                            </Banner>
                        ) : (
                            <Seksi
                                judul={panduan.anjuranUmur.label}
                                ikon={ClipboardList}
                            >
                                <div className="flex flex-col gap-2.5 py-2.5">
                                    <SubJudul ikon={Check}>
                                        Yang harus dilakukan
                                    </SubJudul>
                                    <Daftar
                                        item={panduan.anjuranUmur.anjuran}
                                    />
                                    <Sumber>
                                        {panduan.anjuranUmur.halaman}
                                    </Sumber>
                                </div>
                            </Seksi>
                        )}

                        {stimulasiTampil.map((satu) => (
                            <Seksi
                                key={satu.label}
                                judul={`Stimulasi · ${satu.label}`}
                                ikon={Sparkles}
                            >
                                <div className="flex flex-col gap-2.5 py-2.5">
                                    <Daftar item={satu.daftar} />
                                    <Sumber>{satu.halaman}</Sumber>
                                </div>
                            </Seksi>
                        ))}

                        <Seksi
                            judul="Anjuran semua kelompok umur"
                            ikon={ClipboardList}
                        >
                            <div className="flex flex-col gap-2 py-2.5">
                                {panduan.anjuranSemua.map((satu) => (
                                    <Lipatan
                                        key={satu.label}
                                        judul={satu.label}
                                        keterangan={satu.halaman}
                                    >
                                        <Daftar item={satu.anjuran} />
                                    </Lipatan>
                                ))}
                            </div>
                        </Seksi>
                    </div>
                )}

                {tab === 'asi-mpasi' && (
                    <div
                        {...propsPanel('asi-mpasi')}
                        className="flex flex-col gap-3"
                    >
                        <Seksi judul="ASI eksklusif" ikon={Milk}>
                            <div className="flex flex-col gap-3 py-2.5">
                                <Paragraf>{panduan.asi.definisi}</Paragraf>
                                <div className="flex flex-col gap-2">
                                    <SubJudul ikon={Check}>
                                        Yang harus dilakukan
                                    </SubJudul>
                                    <Daftar item={panduan.asi.langkah} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <SubJudul ikon={Info}>
                                        Mengapa harus dilakukan
                                    </SubJudul>
                                    <Daftar item={panduan.asi.alasan} />
                                </div>
                                <Sumber>{panduan.asi.sumber}</Sumber>
                            </div>
                        </Seksi>

                        <Seksi
                            judul="Ukuran lambung & frekuensi menyusu"
                            ikon={Baby}
                        >
                            <ul className="flex flex-col gap-2 py-2.5">
                                {panduan.asi.frekuensi.map((satu) => (
                                    <li
                                        key={satu.waktu}
                                        className="rounded-md border border-brand-100 bg-white px-3 py-2.5 shadow-1"
                                    >
                                        <p className="flex items-center gap-1.5 text-kecil font-bold text-brand-900">
                                            <Clock
                                                aria-hidden="true"
                                                className="size-3.5 shrink-0 text-brand-600"
                                            />
                                            {satu.waktu}
                                        </p>
                                        <dl className="mt-2 grid grid-cols-1 gap-2 tablet:grid-cols-2">
                                            <div className="rounded-sm bg-brand-50/70 px-2.5 py-1.5">
                                                <dt className="text-label-seksi tracking-[0.06em] text-ink-500 uppercase">
                                                    Ukuran lambung
                                                </dt>
                                                <dd className="text-kecil font-bold text-ink-900">
                                                    {satu.lambung}
                                                </dd>
                                            </div>
                                            <div className="rounded-sm bg-brand-50/70 px-2.5 py-1.5">
                                                <dt className="text-label-seksi tracking-[0.06em] text-ink-500 uppercase">
                                                    Frekuensi menyusu
                                                </dt>
                                                <dd className="text-kecil font-bold text-ink-900">
                                                    {satu.frekuensi}
                                                </dd>
                                            </div>
                                        </dl>
                                    </li>
                                ))}
                            </ul>
                        </Seksi>

                        <Seksi judul="MPASI 6–24 bulan" ikon={Utensils}>
                            <div className="flex flex-col gap-3 py-2.5">
                                <Paragraf>{panduan.mpasi.judul}</Paragraf>

                                <div className="flex flex-col gap-2">
                                    <SubJudul ikon={Check}>
                                        Empat syarat MPASI
                                    </SubJudul>
                                    <dl className="flex flex-col gap-2">
                                        {panduan.mpasi.syarat.map((satu) => (
                                            <div
                                                key={satu.judul}
                                                className="rounded-md border border-brand-100 bg-white px-3 py-2 shadow-1"
                                            >
                                                <dt className="flex items-center gap-1.5 text-kecil font-bold text-brand-900">
                                                    <Check
                                                        aria-hidden="true"
                                                        className="size-3.5 shrink-0 text-brand-600"
                                                        strokeWidth={3}
                                                    />
                                                    {satu.judul}
                                                </dt>
                                                <dd className="mt-1 text-kecil leading-relaxed [text-wrap:pretty] text-ink-700 tablet:text-justify">
                                                    {satu.isi}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                {panduan.porsiMpasi !== null && (
                                    <div className="flex flex-col gap-2">
                                        <SubJudul ikon={Utensils}>
                                            Porsi untuk{' '}
                                            {panduan.porsiMpasi.label}
                                        </SubJudul>
                                        <dl className="grid grid-cols-1 gap-1.5 tablet:grid-cols-2">
                                            <Petak
                                                label="Jumlah"
                                                nilai={
                                                    panduan.porsiMpasi.jumlah
                                                }
                                                ikon={Utensils}
                                            />
                                            <Petak
                                                label="Frekuensi"
                                                nilai={
                                                    panduan.porsiMpasi.frekuensi
                                                }
                                                ikon={Clock}
                                            />
                                            <Petak
                                                label="Tekstur"
                                                nilai={
                                                    panduan.porsiMpasi.tekstur
                                                }
                                                ikon={Ruler}
                                            />
                                            <Petak
                                                label="Energi"
                                                nilai={
                                                    panduan.porsiMpasi.energi
                                                }
                                                ikon={Sparkles}
                                            />
                                            <Petak
                                                label="Cairan"
                                                nilai={
                                                    panduan.porsiMpasi.cairan
                                                }
                                                ikon={Droplets}
                                            />
                                        </dl>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <SubJudul ikon={Sparkles}>
                                        Variasi makanan
                                    </SubJudul>
                                    <dl className="flex flex-col gap-1.5">
                                        {panduan.mpasi.variasi.map((satu) => (
                                            <div
                                                key={satu.kelompok}
                                                className="flex flex-col gap-0.5 rounded-md border border-brand-100 bg-white px-2.5 py-1.5"
                                            >
                                                <dt className="text-label-seksi tracking-[0.06em] text-brand-700 uppercase">
                                                    {satu.kelompok}
                                                </dt>
                                                <dd className="text-kecil leading-snug text-ink-700">
                                                    {satu.contoh}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <SubJudul ikon={Info}>Catatan</SubJudul>
                                    <Daftar item={panduan.mpasi.catatan} />
                                </div>
                                <Sumber>{panduan.mpasi.sumber}</Sumber>
                            </div>
                        </Seksi>

                        <Seksi
                            judul="Cara menyimpan ASI perah"
                            ikon={Thermometer}
                        >
                            <div className="flex flex-col gap-3 py-2.5">
                                <ul className="flex flex-col gap-2">
                                    {panduan.asi.penyimpanan.map((satu) => (
                                        <li
                                            key={satu.tempat}
                                            className="flex flex-col gap-1.5 rounded-md border border-brand-100 bg-white px-3 py-2.5 shadow-1"
                                        >
                                            <p className="flex items-center gap-1.5 text-kecil font-bold text-ink-900">
                                                <Thermometer
                                                    aria-hidden="true"
                                                    className="size-3.5 shrink-0 text-brand-600"
                                                />
                                                {satu.tempat}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold text-brand-700 tabular-nums">
                                                    Suhu {satu.suhu}
                                                </span>
                                                <span className="rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold text-brand-700 tabular-nums">
                                                    Tahan {satu.lama}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Daftar item={panduan.asi.catatanPenyimpanan} />
                            </div>
                        </Seksi>
                    </div>
                )}

                {tab === 'bahaya' && (
                    <div
                        {...propsPanel('bahaya')}
                        className="flex flex-col gap-3"
                    >
                        {panduan.tandaBahaya !== null && (
                            <Seksi
                                judul={`Tanda bahaya · ${panduan.tandaBahaya.label}`}
                                ikon={AlertTriangle}
                            >
                                <div className="flex flex-col gap-2.5 py-2.5">
                                    <Banner
                                        varian="bahaya"
                                        judul="Segera periksa"
                                    >
                                        Bila ditemukan tanda bahaya, segera
                                        periksa ke bidan, dokter, atau fasilitas
                                        kesehatan.
                                    </Banner>
                                    <Daftar item={panduan.tandaBahaya.daftar} />
                                    <Sumber>
                                        {panduan.tandaBahaya.halaman}
                                    </Sumber>
                                </div>
                            </Seksi>
                        )}

                        <Seksi
                            judul={panduan.pemantauanBulanan.judul}
                            ikon={Stethoscope}
                        >
                            <div className="flex flex-col gap-2.5 py-2.5">
                                <Daftar
                                    item={panduan.pemantauanBulanan.daftar}
                                />
                                <Sumber>
                                    {panduan.pemantauanBulanan.sumber}
                                </Sumber>
                            </div>
                        </Seksi>

                        <Seksi
                            judul="Tanda bahaya semua kelompok umur"
                            ikon={AlertTriangle}
                        >
                            <div className="flex flex-col gap-2 py-2.5">
                                {panduan.tandaBahayaSemua.map((satu) => (
                                    <Lipatan
                                        key={satu.label}
                                        judul={satu.label}
                                        keterangan={satu.halaman}
                                    >
                                        <Daftar item={satu.daftar} />
                                    </Lipatan>
                                ))}
                            </div>
                        </Seksi>
                    </div>
                )}

                {tab === 'tindak-lanjut' && (
                    <div
                        {...propsPanel('tindak-lanjut')}
                        className="flex flex-col gap-3"
                    >
                        <Banner varian="info" judul="Bukan diagnosis">
                            Tindak lanjut di bawah adalah anjuran Buku KIA.
                            Hasil skrining tetap harus dikonfirmasi tenaga
                            kesehatan.
                        </Banner>

                        {panduan.tindakLanjut.map((satu) => (
                            <Seksi
                                key={satu.kode}
                                judul={satu.judul}
                                ikon={ShieldCheck}
                            >
                                <div className="flex flex-col gap-2.5 py-2.5">
                                    <span className="inline-flex w-fit items-center gap-1 rounded-pill border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-keterangan font-bold text-brand-700">
                                        <ShieldCheck
                                            aria-hidden="true"
                                            className="size-3"
                                        />
                                        {LABEL_TINGKAT[satu.tingkat] ??
                                            satu.tingkat}
                                    </span>
                                    <Daftar item={satu.tindakan} />
                                    <Sumber>{satu.sumber}</Sumber>
                                </div>
                            </Seksi>
                        ))}

                        <Seksi judul="Tindak lanjut LiLA" ikon={Ruler}>
                            <div className="flex flex-col gap-2 py-2.5">
                                {panduan.tindakLanjutLila.map((satu) => (
                                    <Lipatan
                                        key={satu.label}
                                        judul={satu.label}
                                        keterangan={satu.halaman}
                                    >
                                        <ul className="flex flex-col gap-2">
                                            {satu.kategori.map((kategori) => (
                                                <li
                                                    key={kategori.kode}
                                                    className="flex flex-col gap-1 rounded-md border border-brand-100 bg-white px-2.5 py-2 shadow-1"
                                                >
                                                    <p className="flex flex-wrap items-center gap-1.5">
                                                        <span className="text-kecil font-bold text-brand-900">
                                                            {kategori.label}
                                                        </span>
                                                        <span className="rounded-pill border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-keterangan font-bold text-brand-700 tabular-nums">
                                                            {kategori.batas}
                                                        </span>
                                                    </p>
                                                    <p className="text-kecil leading-relaxed [text-wrap:pretty] text-ink-700 tablet:text-justify">
                                                        {kategori.tindakan}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </Lipatan>
                                ))}
                            </div>
                        </Seksi>
                    </div>
                )}

                {tab === 'perawatan' && (
                    <div
                        {...propsPanel('perawatan')}
                        className="flex flex-col gap-3"
                    >
                        {panduan.perawatanSakit.map((satu) => (
                            <Seksi
                                key={satu.kode}
                                judul={satu.judul}
                                ikon={HeartPulse}
                            >
                                <div className="flex flex-col gap-3 py-2.5">
                                    <div className="flex flex-col gap-2">
                                        <SubJudul ikon={Check}>
                                            Lakukan di rumah
                                        </SubJudul>
                                        <Daftar item={satu.lakukan} />
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-md border border-l-5 border-status-bahaya-teks/30 bg-status-bahaya-latar/60 px-3 py-2.5">
                                        <SubJudul ikon={AlertTriangle}>
                                            Segera ke fasilitas kesehatan bila
                                        </SubJudul>
                                        <Daftar item={satu.segera} />
                                    </div>
                                    <Sumber>{satu.halaman}</Sumber>
                                </div>
                            </Seksi>
                        ))}

                        <Seksi judul="Kebutuhan cairan" ikon={Droplets}>
                            <div className="flex flex-col gap-2.5 py-2.5">
                                <dl className="grid grid-cols-1 gap-1.5 tablet:grid-cols-2">
                                    {panduan.cairan.daftar.map((satu) => (
                                        <Petak
                                            key={satu.umur}
                                            label={satu.umur}
                                            nilai={satu.jumlah}
                                            ikon={Droplets}
                                        />
                                    ))}
                                </dl>
                                <Paragraf>{panduan.cairan.catatan}</Paragraf>
                                <Sumber>{panduan.cairan.sumber}</Sumber>
                            </div>
                        </Seksi>

                        <Seksi judul="Perawatan gigi" ikon={Sparkles}>
                            <div className="flex flex-col gap-2.5 py-2.5">
                                <dl className="grid grid-cols-1 gap-1.5 tablet:grid-cols-2">
                                    {panduan.gigi.daftar.map((satu) => (
                                        <Petak
                                            key={satu.umur}
                                            label={satu.umur}
                                            nilai={satu.cara}
                                            ikon={Sparkles}
                                        />
                                    ))}
                                </dl>
                                <div className="flex flex-col gap-2">
                                    <SubJudul ikon={AlertTriangle}>
                                        Hindari
                                    </SubJudul>
                                    <Daftar item={panduan.gigi.hindari} />
                                </div>
                                <Sumber>{panduan.gigi.sumber}</Sumber>
                            </div>
                        </Seksi>

                        <Seksi judul="Tidur & gawai" ikon={Moon}>
                            <div className="flex flex-col gap-2.5 py-2.5">
                                <dl className="grid grid-cols-1 gap-1.5 tablet:grid-cols-2">
                                    {panduan.tidur.daftar.map((satu) => (
                                        <Petak
                                            key={satu.umur}
                                            label={satu.umur}
                                            nilai={satu.durasi}
                                            ikon={Moon}
                                        />
                                    ))}
                                </dl>
                                <Daftar item={panduan.tidur.gawai} />
                                <Sumber>{panduan.tidur.sumber}</Sumber>
                            </div>
                        </Seksi>
                    </div>
                )}
            </div>
        </>
    );
}
