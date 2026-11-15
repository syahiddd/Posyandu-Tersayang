import { Head, router, usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    ClipboardList,
    KeyRound,
    Pencil,
    Phone,
    Plus,
    ShieldCheck,
    UserCheck,
    UserRound,
    UserX,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipStatus } from '@/components/dasar/chip-status';
import { Dialog } from '@/components/dasar/dialog';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { aturUlangSandi, status, tambah, ubah } from '@/routes/akun';
import type { AkunKader, PilihanMeja } from '@/types';

type Props = {
    akun: (AkunKader & {
        aktif: boolean;
        peran: string;
        diriSendiri: boolean;
    })[];
    daftarMeja: PilihanMeja[];
    sandiSementara: {
        judul: string;
        nama: string;
        username: string;
        sandi: string;
    } | null;
};

/**
 * S21 Pengaturan Akun (FR-02, DESIGN 5.10 dan 6.5): daftar akun dengan
 * status aktif; Atur ulang kata sandi dan Nonaktifkan pada setiap akun.
 * Kata sandi sementara tampil sekali untuk diberikan langsung kepada kader.
 *
 * Susunan mengikuti layar lain: kepala bergradien plum, ringkasan jumlah
 * akun, kartu per akun dengan lencana peran, lalu aksi berikon. Aksi yang
 * mengubah akun orang lain dipisah garis agar tidak tertekan tanpa sengaja.
 */
export default function DaftarAkun({
    akun,
    daftarMeja,
    sandiSementara,
}: Props) {
    const { errors } = usePage().props;
    const galat = errors.aktif ?? errors.sandi;
    // Atur ulang tidak bisa dibatalkan, jadi dikonfirmasi dulu (DESIGN Prinsip 1).
    const [aturUlang, setAturUlang] = useState<Props['akun'][number] | null>(
        null,
    );
    const [mengatur, setMengatur] = useState(false);
    const [sedangUbahStatus, setSedangUbahStatus] = useState<number | null>(
        null,
    );

    const labelMeja = (nomor: number | null) => {
        const meja = daftarMeja.find((satu) => satu.nomor === nomor);

        return meja ? `Meja ${meja.nomor} · ${meja.tahap}` : null;
    };

    const jumlahAktif = akun.filter((satu) => satu.aktif).length;

    return (
        <>
            <Head title="Pengaturan Akun" />
            <div className="flex flex-1 flex-col gap-4 desktop:max-w-3xl">
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
                            <ShieldCheck
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            Khusus Ketua Kader
                        </p>
                        <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                            Pengaturan Akun
                        </h1>
                        <p className="mt-1 text-kecil text-brand-100">
                            Buat akun kader, atur ulang kata sandi, dan
                            nonaktifkan akun yang tidak dipakai.
                        </p>
                    </div>

                    <div className="relative mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/20 bg-white/15 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                            <Users aria-hidden="true" className="size-3.5" />
                            {akun.length} akun
                        </span>
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-brand-100 backdrop-blur-sm">
                            <UserCheck
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            {jumlahAktif} aktif
                        </span>
                    </div>
                </header>

                {galat && <Banner varian="bahaya">{galat}</Banner>}

                {sandiSementara && (
                    <Banner varian="sukses" judul={sandiSementara.judul}>
                        <p className="text-ink-700">
                            Berikan langsung kepada {sandiSementara.nama}. Kata
                            sandi ini hanya tampil sekali.
                        </p>
                        <dl className="mt-2.5 grid grid-cols-1 gap-2 rounded-md border border-brand-200 bg-brand-50/70 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-keterangan text-ink-600">
                                    Nama pengguna
                                </dt>
                                <dd className="font-mono text-kecil font-bold text-ink-900">
                                    {sandiSementara.username}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-t border-brand-200 pt-2">
                                <dt className="text-keterangan text-ink-600">
                                    Kata sandi
                                </dt>
                                <dd className="font-mono text-judul-2 font-bold tracking-wide text-brand-900">
                                    {sandiSementara.sandi}
                                </dd>
                            </div>
                        </dl>
                    </Banner>
                )}

                <ul className="flex flex-col gap-3">
                    {akun.map((satu) => (
                        <li key={satu.id}>
                            <article
                                className={clsx(
                                    'overflow-hidden rounded-lg border bg-white shadow-1',
                                    satu.aktif
                                        ? 'border-brand-100'
                                        : 'border-ink-200',
                                )}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span
                                            aria-hidden="true"
                                            className={clsx(
                                                'flex size-9 shrink-0 items-center justify-center rounded-pill text-white shadow-1',
                                                satu.aktif
                                                    ? 'bg-gradient-to-br from-brand-600 to-brand-900'
                                                    : 'bg-ink-400',
                                            )}
                                        >
                                            <UserRound className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-kecil leading-tight font-bold text-ink-900">
                                                {satu.nama}
                                            </p>
                                            <p className="text-keterangan text-ink-600">
                                                {satu.username}
                                                {satu.diriSendiri && ' · Anda'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                        <span className="rounded-pill border border-brand-200 bg-white px-2 py-0.5 text-label-seksi tracking-[0.06em] text-brand-700 uppercase">
                                            {satu.peran}
                                        </span>
                                        <ChipStatus
                                            varian={
                                                satu.aktif ? 'normal' : 'info'
                                            }
                                        >
                                            {satu.aktif ? 'Aktif' : 'Nonaktif'}
                                        </ChipStatus>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 px-3.5 py-2.5">
                                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-keterangan text-ink-600">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone
                                                aria-hidden="true"
                                                className="size-3.5 shrink-0 text-brand-600"
                                            />
                                            {satu.noHp ??
                                                'Nomor HP belum diisi'}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <ClipboardList
                                                aria-hidden="true"
                                                className="size-3.5 shrink-0 text-brand-600"
                                            />
                                            {labelMeja(satu.mejaBiasa) ??
                                                'Meja belum ditentukan'}
                                        </span>
                                    </p>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <TombolTautan
                                            href={ubah(satu.id)}
                                            varian="sekunder"
                                            className="gap-1.5 px-3 text-kecil"
                                        >
                                            <Pencil
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            Ubah
                                        </TombolTautan>
                                        {!satu.diriSendiri && satu.aktif && (
                                            <Tombol
                                                varian="sekunder"
                                                className="gap-1.5 px-3 text-kecil"
                                                onClick={() =>
                                                    setAturUlang(satu)
                                                }
                                            >
                                                <KeyRound
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                                Atur ulang sandi
                                            </Tombol>
                                        )}
                                        {!satu.diriSendiri && (
                                            <Tombol
                                                varian={
                                                    satu.aktif
                                                        ? 'bahaya'
                                                        : 'sekunder'
                                                }
                                                className="gap-1.5 px-3 text-kecil"
                                                memuat={
                                                    sedangUbahStatus === satu.id
                                                }
                                                teksMemuat="Menyimpan…"
                                                onClick={() => {
                                                    setSedangUbahStatus(
                                                        satu.id,
                                                    );
                                                    router.put(
                                                        status.url(satu.id),
                                                        { aktif: !satu.aktif },
                                                        {
                                                            preserveScroll: true,
                                                            onFinish: () =>
                                                                setSedangUbahStatus(
                                                                    null,
                                                                ),
                                                        },
                                                    );
                                                }}
                                            >
                                                {satu.aktif ? (
                                                    <UserX
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                ) : (
                                                    <UserCheck
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                )}
                                                {satu.aktif
                                                    ? 'Nonaktifkan'
                                                    : 'Aktifkan lagi'}
                                            </Tombol>
                                        )}
                                    </div>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>

                <KakiTombol>
                    <TombolTautan href={tambah()} lebarPenuh>
                        <Plus aria-hidden="true" className="size-5" />
                        Tambah kader
                    </TombolTautan>
                </KakiTombol>

                <Dialog
                    terbuka={aturUlang !== null}
                    onTutup={() => setAturUlang(null)}
                    judul={`Atur ulang kata sandi ${aturUlang?.nama ?? ''}?`}
                    labelBahaya="Atur ulang kata sandi"
                    memuat={mengatur}
                    teksMemuat="Mengatur ulang…"
                    onKonfirmasi={() => {
                        if (aturUlang === null) {
                            return;
                        }

                        router.post(
                            aturUlangSandi.url(aturUlang.id),
                            {},
                            {
                                preserveScroll: false,
                                onStart: () => setMengatur(true),
                                onFinish: () => {
                                    setMengatur(false);
                                    setAturUlang(null);
                                },
                            },
                        );
                    }}
                >
                    <p>
                        Kata sandi lama langsung tidak berlaku dan tidak dapat
                        dikembalikan. Kata sandi sementara tampil sekali untuk
                        Anda berikan kepada {aturUlang?.nama}.
                    </p>
                </Dialog>
            </div>
        </>
    );
}
