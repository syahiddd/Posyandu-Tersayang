import { Head, InfiniteScroll, router } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    CalendarDays,
    LineChart,
    Scale,
    Search,
    SlidersHorizontal,
    User,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Bidang } from '@/components/dasar/bidang';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KartuHasilAnak } from '@/components/dasar/kartu-hasil-anak';
import { PilihanTarik } from '@/components/dasar/pilihan-tarik';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { TombolUnduhCsv } from '@/components/tombol-unduh-csv';
import { usePintasanCari } from '@/hooks/use-pintasan-cari';
import { dataAnak, meja } from '@/routes';
import { detail, terhapus, unduh } from '@/routes/data-anak';
import type {
    JenisKelamin,
    PenyaringDataAnak,
    RingkasanAnak,
    StatistikAnak,
} from '@/types';

type Props = {
    penyaring: PenyaringDataAnak;
    statistik: StatistikAnak;
    jumlah: number;
    adaAnak: boolean;
    anak: { data: RingkasanAnak[] };
    daftarDusun: string[];
    daftarKelompokUmur: { nilai: string; label: string }[];
    /** Hanya untuk Ketua Kader; null bagi kader lain (FR-53). */
    jumlahTerhapus: number | null;
};

const PROP_DAFTAR = ['penyaring', 'jumlah', 'anak'];

/** Parameter URL tanpa nilai kosong agar alamat tetap pendek. */
function parameter(penyaring: PenyaringDataAnak) {
    return Object.fromEntries(
        Object.entries(penyaring).filter(
            ([, nilai]) => nilai !== null && nilai !== '',
        ),
    );
}

/**
 * S14 Data Anak (FR-50, DESIGN 6.5): ringkasan seluruh anak di atas daftar
 * (FR-69), pencarian dan penyaring dalam satu kartu, lalu daftar kartu anak
 * dengan NIK tersamar (NFR-05), hasil ukur terakhir, status imunisasi
 * (FR-70), dan aksi cepat ke grafik/KMS (FR-71). Penyaring berupa pilihan
 * tarik-turun, bukan chip seperti di DESIGN 6.5, atas permintaan pemilik
 * produk.
 */
export default function DaftarDataAnak({
    penyaring,
    statistik,
    jumlah,
    adaAnak,
    anak,
    daftarDusun,
    daftarKelompokUmur,
    jumlahTerhapus,
}: Props) {
    const [kata, setKata] = useState(penyaring.cari);
    const refCari = useRef<HTMLInputElement>(null);
    usePintasanCari(refCari);

    function saring(ganti: Partial<PenyaringDataAnak>) {
        router.get(dataAnak.url(), parameter({ ...penyaring, ...ganti }), {
            only: PROP_DAFTAR,
            reset: ['anak'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    // Hasil diperbarui saat mengetik, sama seperti Meja 1.
    useEffect(() => {
        if (kata === penyaring.cari) {
            return;
        }

        const tunda = setTimeout(() => saring({ cari: kata }), 300);

        return () => clearTimeout(tunda);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kata]);

    const adaPenyaring =
        penyaring.cari !== '' ||
        penyaring.jk !== null ||
        penyaring.umur !== null ||
        penyaring.dusun !== null;

    return (
        <>
            <Head title="Data Anak" />
            <div className="flex flex-col gap-4 desktop:max-w-3xl">
                <header className="relative isolate overflow-hidden rounded-lg bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 pt-5 pb-5 text-white shadow-2 tablet:px-5">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-pill bg-brand-300/20 blur-3xl"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-20 -left-16 size-44 rounded-pill bg-brand-600/30 blur-3xl"
                    />

                    <div className="relative flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                                Posyandu Tersayang
                            </p>
                            <h1 className="mt-2 text-judul-1 text-white desktop:text-display">
                                Data Anak
                            </h1>
                            <p className="mt-1 text-kecil text-brand-100">
                                Cari, saring, dan buka riwayat tumbuh kembang
                                anak.
                            </p>
                        </div>
                        {adaAnak && (
                            <TombolUnduhCsv
                                url={unduh.url({
                                    query: parameter(penyaring),
                                })}
                                kosong={jumlah === 0}
                                tampilan="header"
                            />
                        )}
                    </div>

                    <div className="relative mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                            <Users aria-hidden="true" className="size-3.5" />
                            {statistik.total} anak terdaftar
                        </span>
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-brand-100 backdrop-blur-sm">
                            <CalendarDays
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            {jumlah} hasil tampil
                        </span>
                    </div>
                </header>

                {adaAnak && (
                    <section aria-labelledby="judul-statistik">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <h2
                                id="judul-statistik"
                                className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase"
                            >
                                Ringkasan semua anak
                            </h2>
                            <span className="text-keterangan font-bold text-ink-500">
                                Semua data
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
                            <StatistikAnakKartu
                                angka={statistik.total}
                                label="Total anak"
                                ikon={Users}
                            />
                            <StatistikAnakKartu
                                angka={statistik.lakiLaki}
                                label="Laki-laki"
                                ikon={User}
                            />
                            <StatistikAnakKartu
                                angka={statistik.perempuan}
                                label="Perempuan"
                                ikon={User}
                            />
                            <StatistikAnakKartu
                                angka={statistik.belumDitimbangBulanIni}
                                label="Belum ditimbang"
                                ikon={Scale}
                            />
                        </div>
                        <p className="mt-1.5 text-keterangan text-ink-500">
                            Data seluruh posyandu, tidak mengikuti penyaring.
                            “Belum ditimbang” = bulan berjalan.
                        </p>
                    </section>
                )}

                <section
                    aria-labelledby="judul-cari-saring"
                    className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1"
                >
                    <div className="flex items-center gap-3 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-4 py-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <SlidersHorizontal
                                aria-hidden="true"
                                className="size-5"
                            />
                        </span>
                        <div className="min-w-0">
                            <p
                                id="judul-cari-saring"
                                className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase"
                            >
                                Cari &amp; saring
                            </p>
                            <p className="text-keterangan text-ink-600">
                                Hasil diperbarui saat Anda mengetik.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 px-4 py-4">
                        <IsianTeks
                            ref={refCari}
                            jenis="cari"
                            label="Cari anak"
                            petunjuk="Nama anak, nama ibu, atau NIK (minimal 3 huruf atau 4 angka)"
                            value={kata}
                            onChange={(event) => setKata(event.target.value)}
                            onHapus={() => {
                                setKata('');
                                refCari.current?.focus();
                            }}
                            autoComplete="off"
                            enterKeyHint="search"
                        />

                        <div className="grid gap-3 tablet:grid-cols-3">
                            <PilihPenyaring
                                id="penyaring-jk"
                                label="Jenis kelamin"
                                nilai={penyaring.jk}
                                onUbah={(jk) =>
                                    saring({ jk: jk as JenisKelamin | null })
                                }
                                opsi={[
                                    { nilai: 'L', label: 'Laki-laki' },
                                    { nilai: 'P', label: 'Perempuan' },
                                ]}
                            />
                            <PilihPenyaring
                                id="penyaring-umur"
                                label="Kelompok umur"
                                nilai={penyaring.umur}
                                onUbah={(umur) => saring({ umur })}
                                opsi={daftarKelompokUmur}
                            />
                            {daftarDusun.length > 1 && (
                                <PilihPenyaring
                                    id="penyaring-dusun"
                                    label="Dusun"
                                    nilai={penyaring.dusun}
                                    onUbah={(dusun) => saring({ dusun })}
                                    opsi={daftarDusun.map((dusun) => ({
                                        nilai: dusun,
                                        label: dusun,
                                    }))}
                                />
                            )}
                        </div>

                        {adaPenyaring && (
                            <Tombol
                                varian="tersier"
                                className="self-start"
                                onClick={() => {
                                    setKata('');
                                    saring({
                                        cari: '',
                                        jk: null,
                                        umur: null,
                                        dusun: null,
                                    });
                                }}
                            >
                                Hapus semua penyaring
                            </Tombol>
                        )}
                    </div>
                </section>

                <section aria-labelledby="judul-hasil">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Search
                                aria-hidden="true"
                                className="size-4 text-brand-700"
                            />
                            <h2
                                id="judul-hasil"
                                className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase"
                                aria-live="polite"
                            >
                                {jumlah} anak
                            </h2>
                        </div>
                        {adaPenyaring && (
                            <span className="inline-flex items-center gap-1.5 rounded-pill border border-brand-100 bg-brand-50 px-2.5 py-1 text-keterangan font-bold text-brand-700">
                                Penyaring aktif
                            </span>
                        )}
                    </div>

                    {!adaAnak ? (
                        <div className="flex flex-col items-start gap-3">
                            <p className="text-teks text-ink-700">
                                Belum ada anak terdaftar.
                            </p>
                            <TombolTautan href={meja(1)} varian="sekunder">
                                Daftarkan di Meja 1
                            </TombolTautan>
                        </div>
                    ) : jumlah === 0 ? (
                        <div className="relative isolate overflow-hidden rounded-lg border border-brand-100 bg-gradient-to-br from-white via-brand-50/80 to-brand-100 px-5 py-7 text-center shadow-1">
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-300"
                            />
                            <span
                                aria-hidden="true"
                                className="mx-auto flex size-12 items-center justify-center rounded-pill bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-2"
                            >
                                <Search className="size-5" strokeWidth={2.5} />
                            </span>
                            <p className="mt-3 text-judul-2 text-brand-900">
                                Tidak ditemukan
                            </p>
                            <p className="mt-1 text-kecil text-ink-600">
                                Ubah kata kunci atau penyaring yang dipakai.
                            </p>
                        </div>
                    ) : (
                        <InfiniteScroll
                            data="anak"
                            manual
                            preserveUrl
                            next={({ loading, fetch, hasMore }) =>
                                hasMore && (
                                    <Tombol
                                        varian="sekunder"
                                        lebarPenuh
                                        className="mt-3"
                                        memuat={loading}
                                        teksMemuat="Memuat..."
                                        onClick={fetch}
                                    >
                                        Tampilkan lebih banyak
                                    </Tombol>
                                )
                            }
                        >
                            <ul className="flex flex-col gap-3">
                                {anak.data.map((satu) => (
                                    <li key={satu.id}>
                                        <KartuHasilAnak
                                            anak={satu}
                                            redupDiAntrean={false}
                                            varian="daftar"
                                            tautanDetail={detail.url(satu.id)}
                                            aksi={
                                                <TombolTautan
                                                    href={detail.url(satu.id, {
                                                        query: {
                                                            tab: 'grafik',
                                                        },
                                                    })}
                                                    varian="tersier"
                                                >
                                                    <LineChart
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                    Lihat grafik &amp; KMS
                                                </TombolTautan>
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        </InfiniteScroll>
                    )}
                </section>

                {jumlahTerhapus !== null && jumlahTerhapus > 0 && (
                    <TombolTautan
                        href={terhapus()}
                        varian="tersier"
                        className="self-start"
                    >
                        Data terhapus ({jumlahTerhapus})
                    </TombolTautan>
                )}
            </div>
        </>
    );
}

/**
 * Kartu statistik Data Anak: ringkas dan rapi. Satu keluarga warna plum dengan
 * gradien blush tipis, ikon kecil bergradien di kiri, lalu angka dan label
 * bertumpuk. Tinggi dijaga rendah agar daftar tidak terasa padat.
 */
function StatistikAnakKartu({
    angka,
    label,
    ikon: Ikon,
}: {
    angka: number;
    label: string;
    ikon: LucideIcon;
}) {
    return (
        <article
            className={clsx(
                'relative isolate flex min-h-[60px] items-center gap-2 overflow-hidden rounded-md border border-brand-100',
                'bg-gradient-to-br from-white to-brand-50 px-2.5 py-2 shadow-1 transition-colors',
                'hover:border-brand-300',
            )}
        >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                <Ikon
                    aria-hidden="true"
                    className="size-3.5"
                    strokeWidth={2.4}
                />
            </span>

            <span className="flex min-w-0 flex-col">
                <span className="text-angka leading-none tracking-tight text-brand-900 tabular-nums">
                    {angka.toLocaleString('id-ID')}
                </span>
                <span className="mt-0.5 text-keterangan leading-tight font-bold text-ink-600">
                    {label}
                </span>
            </span>
        </article>
    );
}

/**
 * Penyaring memakai `PilihanTarik` (bukan `<select>` bawaan) agar menu bisa
 * diwarnai, diberi keadaan sorot, dan tingginya dibatasi supaya tidak keluar
 * layar. Pilihan "Semua" berarti tanpa penyaring.
 */
function PilihPenyaring({
    id,
    label,
    opsi,
    nilai,
    onUbah,
}: {
    id: string;
    label: string;
    opsi: { nilai: string; label: string }[];
    nilai: string | null;
    onUbah: (nilai: string | null) => void;
}) {
    return (
        <Bidang id={id} label={label}>
            <PilihanTarik
                id={id}
                label={label}
                nilai={nilai}
                opsi={opsi}
                onUbah={onUbah}
            />
        </Bidang>
    );
}
