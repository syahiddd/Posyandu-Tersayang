import { Head } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    Building2,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    HeartPulse,
    IdCard,
    MapPin,
    Pencil,
    Phone,
    Scale,
    Sparkles,
    Stethoscope,
    Syringe,
    UserRound,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Banner } from '@/components/dasar/banner';
import { Seksi } from '@/components/dasar/seksi';
import { TombolTautan } from '@/components/dasar/tombol';
import { TombolUnduhCsv } from '@/components/tombol-unduh-csv';
import { dataPosyandu } from '@/routes';
import { ubah, unduh } from '@/routes/data-posyandu';

export type ProfilPosyandu = {
    nama: string | null;
    desa_kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    puskesmas_pembina: string | null;
    alamat: string | null;
    jadwal_kegiatan: string | null;
};

/** Rekap satu bulan (FR-61, FR-62); persen sudah berkoma dari server. */
type RekapBulanan = {
    bulan: string;
    label: string;
    sebelumnya: string;
    berikutnya: string | null;
    s: number;
    k: number;
    d: number;
    n: number;
    persenDS: string | null;
    persenND: string | null;
    imunisasi: number;
    vitaminABiru: number;
    vitaminAMerah: number;
    obatCacing: number;
};

type Props = {
    profil: ProfilPosyandu;
    rekap: RekapBulanan;
    bolehUbah: boolean;
    kader: {
        id: number;
        nama: string;
        peran: string;
        noHp: string | null;
        mejaBiasa: string | null;
    }[];
};

const BARIS_PROFIL: {
    kunci: keyof ProfilPosyandu;
    label: string;
    ikon: LucideIcon;
}[] = [
    { kunci: 'desa_kelurahan', label: 'Desa/kelurahan', ikon: MapPin },
    { kunci: 'kecamatan', label: 'Kecamatan', ikon: MapPin },
    { kunci: 'kabupaten_kota', label: 'Kabupaten/kota', ikon: MapPin },
    {
        kunci: 'puskesmas_pembina',
        label: 'Puskesmas pembina',
        ikon: Stethoscope,
    },
    { kunci: 'alamat', label: 'Alamat', ikon: Building2 },
    { kunci: 'jadwal_kegiatan', label: 'Jadwal kegiatan', ikon: CalendarDays },
];

/** Satu baris label–nilai: label kecil berikon, nilai tebal di bawahnya. */
function Baris({
    label,
    nilai,
    ikon: Ikon,
    className,
}: {
    label: string;
    nilai: string | number;
    ikon?: LucideIcon;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                'flex min-w-0 flex-col gap-1 rounded-md border border-brand-100 bg-gradient-to-br from-white to-brand-50/70 px-3 py-2.5',
                className,
            )}
        >
            <dt className="flex items-center gap-1.5 text-label-seksi tracking-[0.08em] text-ink-500 uppercase">
                {Ikon && (
                    <Ikon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-brand-600"
                    />
                )}
                {label}
            </dt>
            <dd className="text-kecil leading-snug font-bold break-words text-ink-900">
                {nilai}
            </dd>
        </div>
    );
}

/** Petak angka ringkas untuk SKDN dan layanan bulan ini. */
function PetakAngka({
    label,
    nilai,
    ikon: Ikon,
    menonjol = false,
}: {
    label: string;
    nilai: string | number;
    ikon: LucideIcon;
    menonjol?: boolean;
}) {
    return (
        <div
            className={clsx(
                'flex min-w-0 flex-col gap-1 rounded-md border px-2.5 py-2 shadow-1',
                menonjol
                    ? 'border-brand-300 bg-gradient-to-br from-brand-100 via-brand-50 to-white'
                    : 'border-brand-100 bg-white',
            )}
        >
            <span className="flex items-center gap-1.5 text-label-seksi tracking-[0.06em] text-ink-500 uppercase">
                <Ikon
                    aria-hidden="true"
                    className={clsx(
                        'size-3.5 shrink-0',
                        menonjol ? 'text-brand-800' : 'text-brand-600',
                    )}
                    strokeWidth={2.4}
                />
                <span className="line-clamp-2 leading-tight">{label}</span>
            </span>
            <span className="text-judul-1 leading-none tracking-tight text-brand-900 tabular-nums">
                {typeof nilai === 'number'
                    ? nilai.toLocaleString('id-ID')
                    : nilai}
            </span>
        </div>
    );
}

function persen(nilai: string | null): string {
    return nilai === null ? '—' : nilai + '%';
}

/**
 * S19 Data Posyandu (DESIGN 6.5): kartu profil (FR-59); rekap SKDN bulan
 * berjalan dengan persentase D/S dan N/D (FR-61); jumlah layanan per bulan
 * (FR-62); daftar kader dengan nomor HP dan meja yang biasa dipegang
 * (FR-60). Profil diubah oleh Ketua Kader. Unduh CSV berisi rekap setiap
 * bulan pada tahun yang ditampilkan (FR-63).
 */
export default function DataPosyandu({
    profil,
    rekap,
    bolehUbah,
    kader,
}: Props) {
    return (
        <>
            <Head title="Data Posyandu" />
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

                    <div className="relative flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                                <Building2
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                Profil &amp; rekap
                            </p>
                            <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                                Data Posyandu
                            </h1>
                            <p className="mt-1 text-kecil text-brand-100">
                                {profil.nama ?? 'Profil posyandu belum diisi'}
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <TombolUnduhCsv
                                url={unduh.url({
                                    query: { tahun: rekap.bulan.slice(0, 4) },
                                })}
                                tampilan="header"
                            />
                            <p className="text-keterangan text-brand-100">
                                Rekap tahun {rekap.bulan.slice(0, 4)}
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-3 flex flex-wrap items-center gap-2">
                        {profil.desa_kelurahan && (
                            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                                <MapPin
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                {profil.desa_kelurahan}
                                {profil.kecamatan && `, ${profil.kecamatan}`}
                            </span>
                        )}
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-brand-100 backdrop-blur-sm">
                            <Users aria-hidden="true" className="size-3.5" />
                            {kader.length} kader
                        </span>
                    </div>
                </header>

                <Seksi
                    judul="Profil posyandu"
                    ikon={IdCard}
                    aksi={
                        bolehUbah ? (
                            <TombolTautan
                                href={ubah()}
                                varian="tersier"
                                className="shrink-0 gap-1 text-keterangan"
                            >
                                <Pencil
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                Ubah
                            </TombolTautan>
                        ) : undefined
                    }
                >
                    <dl className="grid gap-2 py-2.5 tablet:grid-cols-2">
                        {BARIS_PROFIL.map(({ kunci, label, ikon }) => (
                            <Baris
                                key={kunci}
                                label={label}
                                nilai={profil[kunci] || '—'}
                                ikon={ikon}
                            />
                        ))}
                    </dl>
                </Seksi>

                <section
                    aria-labelledby="judul-rekap"
                    className="flex flex-col gap-3"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                                <CalendarDays
                                    aria-hidden="true"
                                    className="size-4"
                                    strokeWidth={2.4}
                                />
                            </span>
                            <div className="min-w-0">
                                <h2
                                    id="judul-rekap"
                                    className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase"
                                >
                                    Rekap bulanan
                                </h2>
                                <p className="text-kecil font-bold text-ink-900">
                                    {rekap.label}
                                </p>
                            </div>
                        </div>
                        <nav
                            aria-label="Pilih bulan rekap"
                            className="flex items-center gap-2"
                        >
                            <TombolTautan
                                href={dataPosyandu({
                                    query: { bulan: rekap.sebelumnya },
                                })}
                                varian="sekunder"
                                preserveScroll
                                className="gap-1 px-3 text-keterangan"
                            >
                                <ChevronLeft
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                Sebelumnya
                            </TombolTautan>
                            {rekap.berikutnya !== null && (
                                <TombolTautan
                                    href={dataPosyandu({
                                        query: { bulan: rekap.berikutnya },
                                    })}
                                    varian="sekunder"
                                    preserveScroll
                                    className="gap-1 px-3 text-keterangan"
                                >
                                    Berikutnya
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </TombolTautan>
                            )}
                        </nav>
                    </div>

                    <Seksi judul="SKDN" ikon={ClipboardList}>
                        <div className="grid grid-cols-2 gap-2 py-2.5 tablet:grid-cols-4">
                            <PetakAngka
                                label="S · Balita sasaran"
                                nilai={rekap.s}
                                ikon={Users}
                            />
                            <PetakAngka
                                label="K · Punya Buku KIA"
                                nilai={rekap.k}
                                ikon={IdCard}
                            />
                            <PetakAngka
                                label="D · Ditimbang"
                                nilai={rekap.d}
                                ikon={Scale}
                            />
                            <PetakAngka
                                label="N · Berat naik"
                                nilai={rekap.n}
                                ikon={Sparkles}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 border-t border-brand-100 py-2.5 tablet:grid-cols-2">
                            <div className="rounded-md border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-brand-100 px-3 py-2.5">
                                <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.08em] text-brand-800 uppercase">
                                    <Users
                                        aria-hidden="true"
                                        className="size-3.5 shrink-0"
                                    />
                                    D/S · Partisipasi
                                </p>
                                <p className="mt-1 text-angka leading-none text-brand-900 tabular-nums">
                                    {persen(rekap.persenDS)}
                                </p>
                                <p className="mt-1 text-keterangan text-ink-600">
                                    Anak ditimbang dibagi balita sasaran.
                                </p>
                            </div>
                            <div className="rounded-md border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-brand-100 px-3 py-2.5">
                                <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.08em] text-brand-800 uppercase">
                                    <Sparkles
                                        aria-hidden="true"
                                        className="size-3.5 shrink-0"
                                    />
                                    N/D · Berat naik
                                </p>
                                <p className="mt-1 text-angka leading-none text-brand-900 tabular-nums">
                                    {persen(rekap.persenND)}
                                </p>
                                <p className="mt-1 text-keterangan text-ink-600">
                                    Berat naik dibagi anak yang ditimbang.
                                </p>
                            </div>
                        </div>
                    </Seksi>

                    <Seksi judul="Layanan bulan ini" ikon={HeartPulse}>
                        <div className="grid grid-cols-2 gap-2 py-2.5 tablet:grid-cols-4">
                            <PetakAngka
                                label="Imunisasi (dosis)"
                                nilai={rekap.imunisasi}
                                ikon={Syringe}
                            />
                            <PetakAngka
                                label="Vitamin A kapsul biru"
                                nilai={rekap.vitaminABiru}
                                ikon={Sparkles}
                            />
                            <PetakAngka
                                label="Vitamin A kapsul merah"
                                nilai={rekap.vitaminAMerah}
                                ikon={Sparkles}
                            />
                            <PetakAngka
                                label="Obat cacing"
                                nilai={rekap.obatCacing}
                                ikon={Stethoscope}
                            />
                        </div>
                    </Seksi>

                    <Seksi judul="Status gizi & risiko stunting" ikon={Scale}>
                        <div className="py-2.5">
                            <Banner varian="info" judul="Belum tersedia">
                                Jumlah anak per status gizi dan risiko stunting
                                belum dihitung di versi ini. Status gizi tiap
                                anak tampil di Meja 5 dan di Detail Anak.
                            </Banner>
                        </div>
                    </Seksi>
                </section>

                <Seksi
                    judul={`Kader · ${kader.length} orang`}
                    ikon={Users}
                    isiClassName="py-1"
                >
                    <ul className="divide-y divide-brand-100">
                        {kader.map((satu) => (
                            <li
                                key={satu.id}
                                className="flex items-start gap-3 py-3"
                            >
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-pill bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                                    <UserRound
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-kecil leading-tight font-bold text-ink-900">
                                        {satu.nama}
                                    </p>
                                    <span className="mt-1 inline-flex rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-label-seksi tracking-[0.06em] text-brand-700 uppercase">
                                        {satu.peran}
                                    </span>
                                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-keterangan text-ink-600">
                                        {satu.noHp ? (
                                            <a
                                                href={`tel:${satu.noHp}`}
                                                className="inline-flex items-center gap-1 font-bold text-brand-700 underline underline-offset-2"
                                            >
                                                <Phone
                                                    aria-hidden="true"
                                                    className="size-3"
                                                />
                                                {satu.noHp}
                                            </a>
                                        ) : (
                                            <span>Nomor HP belum diisi</span>
                                        )}
                                        {satu.mejaBiasa && (
                                            <span className="inline-flex items-center gap-1">
                                                <ClipboardList
                                                    aria-hidden="true"
                                                    className="size-3"
                                                />
                                                Biasa di {satu.mejaBiasa}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Seksi>
            </div>
        </>
    );
}
