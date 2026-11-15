import { Head, Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    ArrowLeftRight,
    BookOpen,
    Building2,
    ChevronRight,
    KeyRound,
    LogOut,
    Settings,
    ShieldCheck,
    Syringe,
    User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    dataPosyandu,
    gantiSandi,
    logout,
    panduanKia,
    pengaturanAkun,
    pilihMeja,
    rekapImunisasi,
} from '@/routes';

type ItemMenu = {
    label: string;
    keterangan: string;
    href: NonNullable<InertiaLinkProps['href']>;
    ikon: LucideIcon;
    /** Tombol POST (keluar) memakai `as="button"`. */
    tombol?: boolean;
    /** Warna bahaya untuk aksi yang keluar dari sesi. */
    bahaya?: boolean;
};

function BarisMenu({
    label,
    keterangan,
    href,
    ikon: Ikon,
    tombol = false,
    bahaya = false,
}: ItemMenu) {
    return (
        <li>
            <Link
                href={href}
                {...(tombol ? { as: 'button' as const } : {})}
                className={clsx(
                    'group flex min-h-target-min w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors',
                    bahaya
                        ? 'hover:bg-status-bahaya-latar/70 active:bg-status-bahaya-latar'
                        : 'hover:bg-brand-50 active:bg-brand-100',
                )}
            >
                <span
                    aria-hidden="true"
                    className={clsx(
                        'flex size-9 shrink-0 items-center justify-center rounded-md text-white shadow-1',
                        bahaya
                            ? 'bg-gradient-to-br from-status-bahaya-teks to-brand-900'
                            : 'bg-gradient-to-br from-brand-600 to-brand-900',
                    )}
                >
                    <Ikon className="size-4" strokeWidth={2.2} />
                </span>

                <span className="flex min-w-0 flex-1 flex-col">
                    <span
                        className={clsx(
                            'text-teks font-bold',
                            bahaya ? 'text-status-bahaya-teks' : 'text-ink-900',
                        )}
                    >
                        {label}
                    </span>
                    <span className="text-keterangan leading-tight text-ink-500">
                        {keterangan}
                    </span>
                </span>

                <ChevronRight
                    aria-hidden="true"
                    className={clsx(
                        'size-5 shrink-0 transition-transform group-hover:translate-x-0.5',
                        bahaya ? 'text-status-bahaya-teks/70' : 'text-ink-400',
                    )}
                />
            </Link>
        </li>
    );
}

function Seksi({
    judul,
    ikon: Ikon,
    children,
}: {
    judul: string;
    ikon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
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
            </div>
            <ul className="divide-y divide-brand-100 px-2 py-1.5">
                {children}
            </ul>
        </section>
    );
}

/**
 * S20 Lainnya (DESIGN Tabel 11): Rekap Imunisasi, Data Posyandu, Pengaturan
 * Akun (Ketua Kader), Ganti Meja, Ganti kata sandi, Keluar (FR-05).
 */
export default function Lainnya() {
    const { auth, bolehKelolaAkun, mejaAktif } = usePage().props;

    return (
        <>
            <Head title="Lainnya" />
            <div className="flex flex-col gap-4 desktop:max-w-2xl">
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
                        <p className="text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                            Menu &amp; pengaturan
                        </p>
                        <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                            Lainnya
                        </h1>
                        {auth.user && (
                            <p className="mt-1 flex items-center gap-1.5 text-kecil text-brand-100">
                                <User
                                    aria-hidden="true"
                                    className="size-3.5 shrink-0"
                                />
                                Masuk sebagai {auth.user.name}
                            </p>
                        )}

                        {mejaAktif && (
                            <span className="mt-3 inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/20 bg-white/10 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                                <ShieldCheck
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                Sesi Meja {mejaAktif.nomor} aktif
                            </span>
                        )}
                    </div>
                </header>

                <Seksi judul="Menu" ikon={Building2}>
                    <BarisMenu
                        label="Rekap Imunisasi"
                        keterangan="Cakupan imunisasi seluruh anak"
                        href={rekapImunisasi()}
                        ikon={Syringe}
                    />
                    <BarisMenu
                        label="Data Posyandu"
                        keterangan="Profil, kader, dan wilayah kerja"
                        href={dataPosyandu()}
                        ikon={Building2}
                    />
                    <BarisMenu
                        label="Panduan KIA"
                        keterangan="Materi edukasi dari Buku KIA"
                        href={panduanKia()}
                        ikon={BookOpen}
                    />
                    {bolehKelolaAkun && (
                        <BarisMenu
                            label="Pengaturan Akun"
                            keterangan="Kelola akun kader posyandu"
                            href={pengaturanAkun()}
                            ikon={Settings}
                        />
                    )}
                </Seksi>

                <Seksi judul="Sesi" ikon={ShieldCheck}>
                    <BarisMenu
                        label="Ganti meja"
                        keterangan="Pindah ke meja pelayanan lain"
                        href={pilihMeja()}
                        ikon={ArrowLeftRight}
                    />
                    <BarisMenu
                        label="Ganti kata sandi"
                        keterangan="Perbarui kata sandi akun Anda"
                        href={gantiSandi()}
                        ikon={KeyRound}
                    />
                    <BarisMenu
                        label="Keluar"
                        keterangan="Akhiri sesi di perangkat ini"
                        href={logout()}
                        ikon={LogOut}
                        tombol
                        bahaya
                    />
                </Seksi>
            </div>
        </>
    );
}
