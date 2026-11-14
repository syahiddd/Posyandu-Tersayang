import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Baby,
    BookOpen,
    CalendarDays,
    ChevronRight,
    CircleCheck,
    ClipboardList,
    HeartPulse,
    MapPin,
    Scale,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ChipStatus } from '@/components/dasar/chip-status';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { TombolTautan } from '@/components/dasar/tombol';
import { useAntreanRealtime } from '@/hooks/use-antrean-realtime';
import { dataPosyandu, meja, panduanKia, pilihMeja } from '@/routes';
import type { AntreanMeja } from '@/types';

type Props = {
    tanggal: string;
    ringkasan: { terdaftar: number; sudahDitimbang: number; selesai: number };
    antrean: AntreanMeja[];
};

/** Beranda kader: sapaan, jalan pintas layanan, ringkasan dan antrean. */
export default function Beranda({ tanggal, ringkasan, antrean }: Props) {
    const { auth, mejaAktif, namaPosyandu, name } = usePage().props;
    useAntreanRealtime(['ringkasan', 'antrean']);

    const antreanSaya = antrean.find((item) => item.nomor === mejaAktif?.nomor);
    const namaPosyanduTersimpan = namaPosyandu ?? name;
    const posyandu =
        namaPosyanduTersimpan === 'Posyandu Melati'
            ? 'Posyandu Tersayang'
            : namaPosyanduTersimpan;
    const namaKader = auth.user?.name ?? '—';
    const labelKader = auth.user?.role === 'ketua' ? 'Ketua Kader' : 'Kader';
    const tujuanLayanan = mejaAktif
        ? meja(mejaAktif.nomor).url
        : pilihMeja().url;

    return (
        <>
            <Head title="Beranda" />
            <div className="flex flex-1 flex-col gap-5 desktop:max-w-4xl">
                <section
                    aria-labelledby="judul-beranda"
                    className="relative isolate overflow-hidden rounded-lg bg-brand-900 shadow-2"
                >
                    <img
                        src="/images/beranda-bayi.jpg"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 size-full object-cover object-center"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/70 to-brand-900/20"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-4 -bottom-8 text-white/10"
                    >
                        <Baby className="size-36" strokeWidth={1.2} />
                    </div>
                    <div className="relative flex min-h-[204px] flex-col justify-between gap-5 p-5 tablet:min-h-[220px] tablet:p-6">
                        <div>
                            <p className="text-label-seksi font-bold tracking-[0.16em] text-white/80 uppercase">
                                Selamat datang, {namaKader}
                            </p>
                            <h1
                                id="judul-beranda"
                                className="font-brand-script mt-2 max-w-[22ch] text-white"
                            >
                                {posyandu}
                            </h1>
                            <p className="mt-2 max-w-md text-kecil text-white/90">
                                Mendampingi ibu dan anak untuk tumbuh sehat
                                bersama.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-white/20 bg-white/15 px-3 text-keterangan font-bold text-white shadow-1 backdrop-blur-sm">
                                <CalendarDays
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                {tanggal}
                            </span>
                            {mejaAktif && (
                                <span className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-white/20 bg-white/15 px-3 text-keterangan font-bold text-white shadow-1 backdrop-blur-sm">
                                    <ClipboardList
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    Meja {mejaAktif.nomor} · {mejaAktif.tahap}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <dl
                    aria-label="Identitas kader dan posyandu"
                    className="grid grid-cols-1 divide-y divide-ink-100 rounded-lg border border-ink-200 bg-white px-3 py-1 shadow-1 tablet:grid-cols-3 tablet:divide-x tablet:divide-y-0 tablet:py-3"
                >
                    <BarisIdentitas
                        label={labelKader}
                        nilai={namaKader}
                        ikon={UserRound}
                    />
                    <BarisIdentitas
                        label="Meja Anda"
                        nilai={
                            mejaAktif
                                ? `Meja ${mejaAktif.nomor} · ${mejaAktif.tahap}`
                                : 'Belum dipilih'
                        }
                        ikon={ClipboardList}
                    />
                    <BarisIdentitas
                        label="Posyandu"
                        nilai={posyandu}
                        ikon={MapPin}
                    />
                </dl>

                <section aria-labelledby="judul-pintasan">
                    <div className="mb-3 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-label-seksi text-brand-700 uppercase">
                                Akses cepat
                            </p>
                            <h2
                                id="judul-pintasan"
                                className="mt-1 text-judul-2 text-ink-900"
                            >
                                Mulai dari sini
                            </h2>
                        </div>
                        <HeartPulse
                            aria-hidden="true"
                            className="mb-1 size-6 text-brand-600"
                        />
                    </div>
                    <div className="grid gap-3 tablet:grid-cols-3">
                        <PintasanBeranda
                            href={tujuanLayanan}
                            judul="Layanan Posyandu"
                            keterangan="Mulai pelayanan dan buka antrean"
                            ikon={HeartPulse}
                            warna="layanan"
                        />
                        <PintasanBeranda
                            href={dataPosyandu().url}
                            judul="Kegiatan Posyandu"
                            keterangan="Lihat profil dan rekap kegiatan"
                            ikon={CalendarDays}
                            warna="kegiatan"
                        />
                        <PintasanBeranda
                            href={panduanKia().url}
                            judul="Artikel Ibu dan Anak"
                            keterangan="Buka panduan kesehatan KIA"
                            ikon={BookOpen}
                            warna="panduan"
                        />
                    </div>
                </section>

                <section aria-labelledby="judul-ringkasan">
                    <div className="mb-3">
                        <p className="text-label-seksi text-brand-700 uppercase">
                            Aktivitas hari ini
                        </p>
                        <h2
                            id="judul-ringkasan"
                            className="mt-1 text-judul-2 text-ink-900"
                        >
                            Ringkasan pelayanan
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-[359px]:gap-2">
                        <KartuRingkasan
                            angka={ringkasan.terdaftar}
                            label="Terdaftar hari ini"
                            ikon={Baby}
                            warna="pink"
                        />
                        <KartuRingkasan
                            angka={ringkasan.sudahDitimbang}
                            label="Sudah ditimbang"
                            ikon={Scale}
                            warna="biru"
                        />
                        <KartuRingkasan
                            angka={ringkasan.selesai}
                            label="Selesai dilayani"
                            ikon={CircleCheck}
                            warna="hijau"
                        />
                    </div>
                    {ringkasan.terdaftar === 0 && (
                        <p className="mt-3 text-teks text-ink-700">
                            <strong>Belum ada kunjungan hari ini.</strong>
                        </p>
                    )}
                </section>

                <section
                    aria-labelledby="judul-antrean"
                    className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-1"
                >
                    <div className="flex items-center gap-3 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-girl-50 px-4 py-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700 shadow-1">
                            <ClipboardList
                                aria-hidden="true"
                                className="size-6"
                            />
                        </span>
                        <div className="min-w-0">
                            <p className="text-label-seksi text-brand-700 uppercase">
                                Progres hari ini
                            </p>
                            <h2
                                id="judul-antrean"
                                className="mt-1 text-judul-2 text-ink-900"
                            >
                                Antrean per meja
                            </h2>
                            <p className="mt-1 text-keterangan text-ink-600">
                                Anak yang menunggu di setiap tahap pelayanan.
                            </p>
                        </div>
                    </div>
                    <ul className="grid gap-2 p-3 tablet:grid-cols-2">
                        {antrean.map((item) => (
                            <li key={item.nomor}>
                                <BarisAntrean item={item} />
                            </li>
                        ))}
                    </ul>
                </section>

                {mejaAktif && (
                    <KakiTombol className="desktop:max-w-md">
                        <TombolTautan href={meja(mejaAktif.nomor)} lebarPenuh>
                            Buka antrean Meja {mejaAktif.nomor} ·{' '}
                            {antreanSaya?.menunggu ?? 0} anak
                        </TombolTautan>
                    </KakiTombol>
                )}
            </div>
        </>
    );
}

/** Baris identitas kader, meja, atau posyandu. */
function BarisIdentitas({
    label,
    nilai,
    ikon: Ikon,
}: {
    label: string;
    nilai: string;
    ikon: LucideIcon;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 py-2 tablet:px-3 tablet:py-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700">
                <Ikon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <dt className="text-keterangan font-bold text-ink-500">
                    {label}
                </dt>
                <dd className="truncate text-kecil font-bold text-ink-900">
                    {nilai}
                </dd>
            </div>
        </div>
    );
}

/** Kartu jalan pintas dengan warna lembut dan ikon watermark. */
function PintasanBeranda({
    href,
    judul,
    keterangan,
    ikon: Ikon,
    warna,
}: {
    href: string;
    judul: string;
    keterangan: string;
    ikon: LucideIcon;
    warna: 'layanan' | 'kegiatan' | 'panduan';
}) {
    const latar = {
        layanan: 'from-brand-700 to-brand-900',
        kegiatan: 'from-girl-700 to-brand-700',
        panduan: 'from-boy-700 to-ink-700',
    }[warna];

    return (
        <Link
            href={href}
            className={`group relative flex min-h-[92px] items-center gap-3 overflow-hidden rounded-lg bg-gradient-to-br ${latar} px-4 py-3 text-white shadow-1 transition-transform hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700`}
        >
            <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-pill border border-white/35 bg-white/15 shadow-1">
                <Ikon aria-hidden="true" className="size-6" />
            </span>
            <span className="relative z-10 min-w-0 flex-1">
                <span className="block text-teks leading-tight font-bold">
                    {judul}
                </span>
                <span className="mt-1 block text-keterangan text-white/85">
                    {keterangan}
                </span>
            </span>
            <ArrowUpRight
                aria-hidden="true"
                className="relative z-10 size-5 shrink-0 text-white/85 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
            <Ikon
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -bottom-7 size-28 text-white/10"
                strokeWidth={1.2}
            />
        </Link>
    );
}

/** Ringkasan layanan dengan ikon berwarna dan aksen lembut per kategori. */
function KartuRingkasan({
    angka,
    label,
    ikon: Ikon,
    warna,
}: {
    angka: number;
    label: string;
    ikon: LucideIcon;
    warna: 'pink' | 'biru' | 'hijau';
}) {
    const tema = {
        pink: {
            kartu: 'border-girl-100 bg-gradient-to-br from-white to-girl-50',
            ikon: 'bg-girl-100 text-girl-700 ring-girl-200',
            aksen: 'bg-girl-700',
        },
        biru: {
            kartu: 'border-boy-100 bg-gradient-to-br from-white to-boy-50',
            ikon: 'bg-boy-100 text-boy-700 ring-boy-100',
            aksen: 'bg-boy-700',
        },
        hijau: {
            kartu: 'border-status-normal-latar bg-gradient-to-br from-white to-status-normal-latar',
            ikon: 'bg-status-normal-latar text-status-normal-teks ring-status-normal-latar',
            aksen: 'bg-status-normal-teks',
        },
    }[warna];

    return (
        <article
            className={`relative isolate flex min-h-[138px] flex-col justify-between overflow-hidden rounded-lg border p-3 shadow-1 transition-shadow hover:shadow-2 ${tema.kartu}`}
        >
            <span
                aria-hidden="true"
                className={`absolute top-0 left-0 h-1 w-full ${tema.aksen}`}
            />
            <span
                aria-hidden="true"
                className={`absolute -right-7 -bottom-8 size-20 rounded-pill opacity-50 ${tema.ikon}`}
            />
            <div className="relative flex items-center justify-between gap-2">
                <span
                    className={`flex size-11 items-center justify-center rounded-md ring-1 ${tema.ikon}`}
                >
                    <Ikon
                        aria-hidden="true"
                        className="size-6"
                        strokeWidth={2.2}
                    />
                </span>
                <span className="rounded-pill bg-white/80 px-2 py-1 text-label-seksi text-ink-500 uppercase">
                    Hari ini
                </span>
            </div>
            <div className="relative mt-3">
                <p className="text-display text-ink-900 tabular-nums">
                    {angka.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-keterangan leading-tight font-bold text-ink-600">
                    {label}
                </p>
            </div>
        </article>
    );
}

/** Baris antrean satu meja; juga pintasan ke layar meja tersebut (FR-08). */
function BarisAntrean({ item }: { item: AntreanMeja }) {
    const keterangan = [
        `${item.menunggu} menunggu`,
        item.ditunda > 0 ? `${item.ditunda} ditunda` : null,
    ]
        .filter(Boolean)
        .join(', ');

    const tema = [
        {
            lencana: 'bg-brand-100 text-brand-800',
            garis: 'border-l-brand-600',
            jumlah: 'bg-brand-100 text-brand-900',
            latar: 'bg-brand-50/70',
        },
        {
            lencana: 'bg-boy-100 text-boy-700',
            garis: 'border-l-boy-700',
            jumlah: 'bg-boy-100 text-boy-700',
            latar: 'bg-boy-50',
        },
        {
            lencana: 'bg-girl-100 text-girl-700',
            garis: 'border-l-girl-700',
            jumlah: 'bg-girl-100 text-girl-700',
            latar: 'bg-girl-50',
        },
        {
            lencana: 'bg-status-normal-latar text-status-normal-teks',
            garis: 'border-l-status-normal-teks',
            jumlah: 'bg-status-normal-latar text-status-normal-teks',
            latar: 'bg-status-normal-latar/50',
        },
        {
            lencana: 'bg-ink-100 text-ink-700',
            garis: 'border-l-ink-500',
            jumlah: 'bg-ink-100 text-ink-700',
            latar: 'bg-ink-100/65',
        },
    ][item.nomor - 1] ?? {
        lencana: 'bg-brand-100 text-brand-800',
        garis: 'border-l-brand-600',
        jumlah: 'bg-brand-100 text-brand-900',
        latar: 'bg-brand-50/70',
    };

    return (
        <Link
            href={meja(item.nomor)}
            aria-label={`Meja ${item.nomor} ${item.tahap}, ${keterangan}`}
            className={`group flex min-h-[76px] items-center gap-3 rounded-lg border border-l-4 border-ink-200 px-3 py-2 shadow-1 transition-all hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-brand-700 ${tema.garis} ${tema.latar}`}
        >
            <span
                aria-hidden="true"
                className={`flex size-11 shrink-0 flex-col items-center justify-center rounded-md ${tema.lencana}`}
            >
                <span className="text-label-seksi leading-none font-bold tracking-wide">
                    MEJA
                </span>
                <span className="mt-0.5 text-judul-2 leading-none">
                    {item.nomor}
                </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-teks font-bold text-ink-900">
                    {item.tahap}
                </span>
                <span className="text-keterangan text-ink-600">
                    {item.menunggu} menunggu
                </span>
                {item.ditunda > 0 && (
                    <span className="mt-1">
                        <ChipStatus varian="waspada">
                            {item.ditunda} ditunda
                        </ChipStatus>
                    </span>
                )}
            </span>
            <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-pill text-judul-2 font-bold tabular-nums ${tema.jumlah}`}
                aria-hidden="true"
            >
                {item.menunggu}
            </span>
            <ChevronRight
                aria-hidden="true"
                className="size-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700"
            />
        </Link>
    );
}
