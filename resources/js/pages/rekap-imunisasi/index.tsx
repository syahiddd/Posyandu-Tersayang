import { Head, Link, router } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    Baby,
    CalendarDays,
    CalendarRange,
    Filter,
    MapPin,
    RotateCcw,
    Syringe,
    Table2,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Bidang } from '@/components/dasar/bidang';
import { IsianTeks } from '@/components/dasar/isian-teks';
import {
    JadwalImunisasi,
    KeteranganJadwal,
} from '@/components/dasar/jadwal-imunisasi';
import type {
    BarisJadwal,
    KolomJadwal,
} from '@/components/dasar/jadwal-imunisasi';
import { PilihanTarik } from '@/components/dasar/pilihan-tarik';
import { Seksi } from '@/components/dasar/seksi';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { TombolUnduhCsv } from '@/components/tombol-unduh-csv';
import { meja, rekapImunisasi } from '@/routes';
import { detail } from '@/routes/data-anak';
import { unduh } from '@/routes/rekap-imunisasi';
import type { JenisKelamin } from '@/types';

type Penyaring = {
    dari: string;
    sampai: string;
    vaksin: string | null;
    dusun: string | null;
};

type Sel = { tanggal: string; dariBukuKia: boolean } | null;

type Props = {
    penyaring: Penyaring;
    galatPeriode: string | null;
    hariIni: string;
    adaAnak: boolean;
    daftarDusun: string[];
    daftarVaksin: { nilai: string; label: string }[];
    kolom: { kode: string; nama: string }[];
    baris: {
        id: number;
        nama: string;
        jenisKelamin: JenisKelamin;
        umurBulan: number;
        dusun: string;
        sel: Sel[];
    }[];
    jumlahPerDosis: number[];
    cakupan: { kode: string; nama: string; jumlah: number }[];
    /** Jadwal acuan tabel Pelayanan Imunisasi: kolom umur dan baris vaksin. */
    jadwal: { kolom: KolomJadwal[]; baris: BarisJadwal[] };
};

/** Parameter URL tanpa nilai kosong agar alamat tetap pendek. */
function parameter(penyaring: Penyaring) {
    return Object.fromEntries(
        Object.entries(penyaring).filter(
            ([, nilai]) => nilai !== null && nilai !== '',
        ),
    );
}

/**
 * Petak cakupan per vaksin: nama vaksin di kiri (boleh dua baris), jumlah anak
 * di kanan dalam lencana kecil, lalu bilah tipis yang menunjukkan bagian dari
 * seluruh balita pada rekap. Angka memakai 14 px agar kisi rapat tetapi tetap
 * terbaca; warna tetap satu keluarga plum supaya tidak bersaing dengan chip
 * status.
 */
function CakupanKartu({
    angka,
    label,
    ikon: Ikon,
    total,
    menonjol = false,
}: {
    angka: number;
    label: string;
    ikon: LucideIcon;
    /** Jumlah balita dalam rekap; untuk bilah porsi. */
    total?: number;
    menonjol?: boolean;
}) {
    const porsi =
        total !== undefined && total > 0
            ? Math.min(100, Math.round((angka / total) * 100))
            : null;

    return (
        <div
            className={clsx(
                'flex min-w-0 flex-col gap-1.5 rounded-md border px-2.5 py-2 shadow-1',
                menonjol
                    ? 'border-brand-300 bg-gradient-to-br from-brand-100 via-brand-50 to-white'
                    : 'border-brand-100 bg-white',
            )}
        >
            <div className="flex min-w-0 items-start gap-1.5">
                <Ikon
                    aria-hidden="true"
                    strokeWidth={2.4}
                    className={clsx(
                        'mt-0.5 size-3.5 shrink-0',
                        menonjol ? 'text-brand-800' : 'text-brand-600',
                    )}
                />
                <span className="min-w-0 flex-1 text-keterangan leading-tight font-bold text-ink-700">
                    <span className="line-clamp-2">{label}</span>
                </span>
                <span
                    className={clsx(
                        'shrink-0 rounded-pill px-1.5 py-0.5 text-kecil leading-none font-bold tabular-nums',
                        menonjol
                            ? 'bg-brand-800 text-white'
                            : 'bg-brand-50 text-brand-900',
                    )}
                >
                    {angka.toLocaleString('id-ID')}
                </span>
            </div>

            {porsi !== null && (
                <span
                    aria-hidden="true"
                    className="block h-1 overflow-hidden rounded-pill bg-brand-100"
                >
                    <span
                        className={clsx(
                            'block h-full rounded-pill',
                            menonjol
                                ? 'bg-gradient-to-r from-brand-900 to-brand-700'
                                : 'bg-gradient-to-r from-brand-600 to-brand-300',
                        )}
                        style={{ width: `${porsi}%` }}
                    />
                </span>
            )}
        </div>
    );
}

/**
 * S18 Rekapitulasi Imunisasi (FR-55, FR-56; DESIGN 6.5 dan bab 9):
 * penyaring periode, jenis vaksin, dusun; petak cakupan per vaksin; tabel
 * anak × vaksin yang digulir horizontal di dalam kartunya dengan kolom
 * nama tetap. Riwayat dari Buku KIA diberi label teks (FR-66). Unduh CSV
 * mengikuti penyaring aktif (FR-58).
 */
export default function RekapImunisasi({
    penyaring,
    galatPeriode,
    hariIni,
    adaAnak,
    daftarDusun,
    daftarVaksin,
    kolom,
    baris,
    jumlahPerDosis,
    cakupan,
    jadwal,
}: Props) {
    const [dari, setDari] = useState(penyaring.dari);
    const [sampai, setSampai] = useState(penyaring.sampai);

    function saring(ganti: Partial<Penyaring>) {
        router.get(
            rekapImunisasi.url(),
            parameter({ ...penyaring, ...ganti }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const adaPenyaring = penyaring.vaksin !== null || penyaring.dusun !== null;

    return (
        <>
            <Head title="Rekap Imunisasi" />
            <div className="flex min-w-0 flex-col gap-4 desktop:max-w-3xl">
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
                                <Syringe
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                Cakupan imunisasi
                            </p>
                            <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                                Rekap Imunisasi
                            </h1>
                            <p className="mt-1 text-kecil text-brand-100">
                                Dosis yang tercatat pada periode terpilih.
                            </p>
                        </div>
                        {adaAnak && (
                            <TombolUnduhCsv
                                url={unduh.url({
                                    query: parameter(penyaring),
                                })}
                                kosong={
                                    galatPeriode !== null || baris.length === 0
                                }
                                tampilan="header"
                            />
                        )}
                    </div>

                    <div className="relative mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                            <CalendarDays
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            {penyaring.dari} – {penyaring.sampai}
                        </span>
                        {adaAnak && (
                            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-brand-100 backdrop-blur-sm">
                                <Baby aria-hidden="true" className="size-3.5" />
                                {baris.length} balita
                            </span>
                        )}
                    </div>
                </header>

                <Seksi judul="Penyaring" ikon={Filter}>
                    <div className="flex flex-col gap-3.5 py-2.5">
                        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                            <IsianTeks
                                jenis="tanggal"
                                label="Dari tanggal"
                                id="isian-dari"
                                value={dari}
                                max={hariIni}
                                onChange={(event) => {
                                    setDari(event.target.value);

                                    if (event.target.value !== '') {
                                        saring({ dari: event.target.value });
                                    }
                                }}
                            />
                            <IsianTeks
                                jenis="tanggal"
                                label="Sampai tanggal"
                                id="isian-sampai"
                                value={sampai}
                                max={hariIni}
                                galat={galatPeriode ?? undefined}
                                onChange={(event) => {
                                    setSampai(event.target.value);

                                    if (event.target.value !== '') {
                                        saring({ sampai: event.target.value });
                                    }
                                }}
                            />
                        </div>

                        {/* Dua pilihan ini panjang (sembilan vaksin dan
                            beberapa dusun), jadi memakai pilihan tarik-turun
                            seperti Data Anak agar tidak menumpuk menjadi
                            banyak baris chip di layar ponsel. */}
                        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                            <Bidang id="penyaring-vaksin" label="Jenis vaksin">
                                <PilihanTarik
                                    id="penyaring-vaksin"
                                    label="Jenis vaksin"
                                    nilai={penyaring.vaksin}
                                    labelKosong="Semua vaksin"
                                    onUbah={(vaksin) => saring({ vaksin })}
                                    opsi={daftarVaksin}
                                />
                            </Bidang>

                            {daftarDusun.length > 1 && (
                                <Bidang id="penyaring-dusun" label="Dusun">
                                    <PilihanTarik
                                        id="penyaring-dusun"
                                        label="Dusun"
                                        nilai={penyaring.dusun}
                                        labelKosong="Semua dusun"
                                        onUbah={(dusun) => saring({ dusun })}
                                        opsi={daftarDusun.map((dusun) => ({
                                            nilai: dusun,
                                            label: dusun,
                                        }))}
                                    />
                                </Bidang>
                            )}
                        </div>

                        {adaPenyaring && (
                            <Tombol
                                varian="tersier"
                                className="self-start"
                                onClick={() =>
                                    saring({ vaksin: null, dusun: null })
                                }
                            >
                                <RotateCcw
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                Hapus penyaring
                            </Tombol>
                        )}
                    </div>
                </Seksi>

                {!adaAnak ? (
                    <div className="flex flex-col items-start gap-3">
                        <p className="text-teks text-ink-700">
                            Belum ada anak terdaftar.
                        </p>
                        <TombolTautan href={meja(1)} varian="sekunder">
                            Daftarkan di Meja 1
                        </TombolTautan>
                    </div>
                ) : (
                    galatPeriode === null && (
                        <>
                            <section aria-labelledby="judul-cakupan">
                                <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <h2
                                        id="judul-cakupan"
                                        className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase"
                                    >
                                        Cakupan per vaksin
                                    </h2>
                                    <span className="text-keterangan font-bold text-ink-500">
                                        Jumlah anak per vaksin
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3 desktop:grid-cols-4">
                                    <CakupanKartu
                                        angka={baris.length}
                                        label="Balita dalam rekap"
                                        ikon={Users}
                                        menonjol
                                    />
                                    {cakupan.map((satu) => (
                                        <CakupanKartu
                                            key={satu.kode}
                                            angka={satu.jumlah}
                                            label={satu.nama}
                                            ikon={Syringe}
                                            total={baris.length}
                                        />
                                    ))}
                                </div>
                            </section>

                            <Seksi
                                judul="Jadwal imunisasi menurut umur"
                                ikon={CalendarRange}
                                isiClassName="py-0"
                                aksi={
                                    <span className="hidden shrink-0 rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold whitespace-nowrap text-brand-700 tablet:inline-flex">
                                        Buku KIA hlm. 125
                                    </span>
                                }
                            >
                                <div className="-mx-3.5 flex flex-col gap-3 border-b border-brand-100 py-3">
                                    <JadwalImunisasi
                                        kolom={jadwal.kolom}
                                        baris={jadwal.baris}
                                    />
                                </div>
                                <div className="-mx-3.5 px-3.5 py-3">
                                    <KeteranganJadwal
                                        catatan={[
                                            'Angka pada sel menunjukkan nomor dosis. Putih menandai usia tepat, kuning usia yang masih boleh dilengkapi, merah muda imunisasi kejar, dan abu-abu usia yang tidak diperbolehkan.',
                                            'Kolom umur mengikuti tabel Pelayanan Imunisasi Buku KIA 2024 hlm. 125: bulan 0 (lahir) sampai 12 bulan, 18 bulan, lalu kolom kejar 23–59 bulan. Imunisasi khusus daerah endemis hanya ditawarkan bila wilayah posyandu termasuk endemis.',
                                        ]}
                                    />
                                </div>
                            </Seksi>

                            <Seksi
                                judul="Tabel dosis"
                                ikon={Table2}
                                isiClassName="py-0"
                                aksi={
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <span className="rounded-pill border border-brand-200 bg-brand-50 px-2 py-0.5 text-keterangan font-bold whitespace-nowrap text-brand-700 tabular-nums">
                                            {baris.length} balita
                                        </span>
                                        <span className="hidden items-center gap-1 rounded-pill border border-brand-200 bg-white px-2 py-0.5 text-keterangan font-bold whitespace-nowrap text-brand-700 tablet:inline-flex">
                                            <MapPin
                                                aria-hidden="true"
                                                className="size-3"
                                            />
                                            {penyaring.dusun ?? 'Semua dusun'}
                                        </span>
                                    </div>
                                }
                            >
                                {baris.length === 0 ? (
                                    <p className="py-4 text-teks text-ink-600">
                                        Tidak ada balita untuk penyaring ini.
                                    </p>
                                ) : (
                                    <div className="-mx-3.5">
                                        <TabelRekap
                                            kolom={kolom}
                                            baris={baris}
                                            jumlahPerDosis={jumlahPerDosis}
                                        />
                                    </div>
                                )}
                            </Seksi>
                        </>
                    )
                )}
            </div>
        </>
    );
}

const SEL_KEPALA =
    'border-b-2 border-brand-200 bg-brand-50 px-2.5 py-2 text-left align-bottom text-keterangan font-bold text-brand-900 desktop:sticky desktop:top-0';
const SEL_NAMA = 'sticky left-0 border-r border-brand-100 bg-white';

/**
 * Tabel anak × vaksin (DESIGN bab 9): gulir horizontal di dalam kartu,
 * kolom nama tetap; di desktop baris kepala menempel saat digulir. Wadah
 * gulir `relative` agar teks sr-only (absolut) di sel tidak melebarkan
 * halaman (bab 9: tanpa gulir horizontal halaman).
 */
function TabelRekap({
    kolom,
    baris,
    jumlahPerDosis,
}: Pick<Props, 'kolom' | 'baris' | 'jumlahPerDosis'>) {
    return (
        <div
            tabIndex={0}
            role="region"
            aria-label="Tabel dosis imunisasi per anak"
            className="relative overflow-x-auto border-y border-brand-100 desktop:max-h-[calc(100dvh-8rem)] desktop:overflow-y-auto"
        >
            <table className="w-max min-w-full border-separate border-spacing-0">
                <caption className="sr-only">
                    Tanggal pemberian setiap dosis imunisasi per anak
                </caption>
                <thead>
                    <tr>
                        <th
                            scope="col"
                            className={`${SEL_KEPALA} ${SEL_NAMA} z-30`}
                        >
                            Nama anak
                        </th>
                        {kolom.map((satu) => (
                            <th
                                key={satu.kode}
                                scope="col"
                                title={satu.nama}
                                className={`${SEL_KEPALA} z-20 whitespace-nowrap`}
                            >
                                {satu.kode}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {baris.map((anak) => (
                        <tr key={anak.id} className="hover:bg-brand-50/60">
                            <th
                                scope="row"
                                className={`${SEL_NAMA} z-10 border-b border-brand-100 px-2.5 py-0 text-left align-middle font-normal`}
                            >
                                <Link
                                    href={detail(anak.id)}
                                    className="flex min-h-target-min flex-col justify-center py-1 text-kecil font-bold text-ink-900 underline-offset-2 hover:underline"
                                >
                                    {anak.nama}
                                    <span className="text-keterangan font-normal text-ink-600">
                                        {anak.umurBulan} bln · {anak.dusun}
                                    </span>
                                </Link>
                            </th>
                            {anak.sel.map((sel, indeks) => (
                                <td
                                    key={kolom[indeks].kode}
                                    className="border-b border-brand-100 px-2.5 py-1.5 align-middle text-keterangan whitespace-nowrap text-ink-900 tabular-nums"
                                >
                                    {sel === null ? (
                                        <span className="text-ink-400">
                                            <span aria-hidden="true">–</span>
                                            <span className="sr-only">
                                                Belum dalam periode
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="flex flex-col gap-0.5">
                                            <span className="font-bold">
                                                {sel.tanggal}
                                            </span>
                                            {sel.dariBukuKia && (
                                                <span className="inline-flex w-fit items-center rounded-pill bg-brand-50 px-1.5 text-label-seksi leading-4 text-brand-700">
                                                    Buku KIA
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-brand-50/70">
                        <th
                            scope="row"
                            className={`${SEL_NAMA} z-10 px-2.5 py-2 text-left text-kecil font-bold text-ink-900`}
                        >
                            Jumlah anak
                        </th>
                        {jumlahPerDosis.map((jumlah, indeks) => (
                            <td
                                key={kolom[indeks].kode}
                                className="px-2.5 py-2 text-kecil font-bold text-brand-900 tabular-nums"
                            >
                                {jumlah}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
