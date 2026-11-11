import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChipPenyaring } from '@/components/dasar/chip-penyaring';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { TileAngka } from '@/components/dasar/tile-angka';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { meja, rekapImunisasi } from '@/routes';
import { detail } from '@/routes/data-anak';
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
 * S18 Rekapitulasi Imunisasi (FR-55, FR-56; DESIGN 6.5 dan bab 9):
 * penyaring periode, jenis vaksin, dusun; tile cakupan per vaksin; tabel
 * anak × vaksin yang digulir horizontal di dalam kartunya dengan kolom
 * nama tetap. Riwayat dari Buku KIA diberi label teks (FR-66).
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
            <Head title="Rekapitulasi Imunisasi" />
            <div className="flex min-w-0 flex-col gap-4">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-judul-1 text-ink-900">
                        Rekapitulasi Imunisasi
                    </h1>
                </header>

                <div className="flex flex-col gap-3 desktop:max-w-3xl">
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
                    <ChipPenyaring
                        label="Jenis vaksin"
                        nilai={penyaring.vaksin}
                        onUbah={(vaksin) => saring({ vaksin })}
                        opsi={[
                            { nilai: null, label: 'Semua' },
                            ...daftarVaksin,
                        ]}
                    />
                    {daftarDusun.length > 1 && (
                        <ChipPenyaring
                            label="Dusun"
                            nilai={penyaring.dusun}
                            onUbah={(dusun) => saring({ dusun })}
                            opsi={[
                                { nilai: null, label: 'Semua' },
                                ...daftarDusun.map((dusun) => ({
                                    nilai: dusun,
                                    label: dusun,
                                })),
                            ]}
                        />
                    )}
                    {adaPenyaring && (
                        <Tombol
                            varian="tersier"
                            className="self-start"
                            onClick={() =>
                                saring({ vaksin: null, dusun: null })
                            }
                        >
                            Hapus penyaring
                        </Tombol>
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
                ) : (
                    galatPeriode === null && (
                        <>
                            <section aria-labelledby="judul-cakupan">
                                <h2
                                    id="judul-cakupan"
                                    className="mb-2 text-label-seksi text-ink-600 uppercase"
                                >
                                    Cakupan · jumlah anak
                                </h2>
                                <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-5">
                                    <TileAngka
                                        angka={baris.length}
                                        label="Balita dalam rekap"
                                    />
                                    {cakupan.map((satu) => (
                                        <TileAngka
                                            key={satu.kode}
                                            angka={satu.jumlah}
                                            label={satu.nama}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section
                                aria-labelledby="judul-tabel"
                                className="min-w-0"
                            >
                                <h2
                                    id="judul-tabel"
                                    className="mb-2 text-label-seksi text-ink-600 uppercase"
                                    aria-live="polite"
                                >
                                    {baris.length} balita
                                </h2>
                                {baris.length === 0 ? (
                                    <p className="text-teks text-ink-700">
                                        Tidak ada balita untuk penyaring ini.
                                    </p>
                                ) : (
                                    <TabelRekap
                                        kolom={kolom}
                                        baris={baris}
                                        jumlahPerDosis={jumlahPerDosis}
                                    />
                                )}
                            </section>
                        </>
                    )
                )}
            </div>
        </>
    );
}

const SEL_KEPALA =
    'border-b border-ink-300 bg-white px-3 py-2 text-left align-bottom text-kecil font-bold text-ink-900 desktop:sticky desktop:top-0';
const SEL_NAMA = 'sticky left-0 border-r border-ink-200 bg-white';

/**
 * Tabel anak × vaksin (DESIGN bab 9): gulir horizontal di dalam kartu,
 * kolom nama tetap; di desktop baris kepala menempel saat digulir.
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
            aria-labelledby="judul-tabel"
            className="overflow-x-auto rounded-md border border-ink-200 bg-white shadow-1 desktop:max-h-[calc(100dvh-8rem)] desktop:overflow-y-auto"
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
                        <tr key={anak.id}>
                            <th
                                scope="row"
                                className={`${SEL_NAMA} z-10 border-b px-3 py-1 text-left align-top font-normal`}
                            >
                                <Link
                                    href={detail(anak.id)}
                                    className="flex min-h-target-min flex-col justify-center text-kecil font-bold text-ink-900 underline-offset-2 hover:underline"
                                >
                                    {anak.nama}
                                    <span className="text-keterangan font-normal text-ink-700">
                                        {anak.umurBulan} bln · {anak.dusun}
                                    </span>
                                </Link>
                            </th>
                            {anak.sel.map((sel, indeks) => (
                                <td
                                    key={kolom[indeks].kode}
                                    className="border-b border-ink-200 px-3 py-2 align-top text-kecil whitespace-nowrap text-ink-900 tabular-nums"
                                >
                                    {sel === null ? (
                                        <span className="text-ink-600">
                                            <span aria-hidden="true">–</span>
                                            <span className="sr-only">
                                                Belum dalam periode
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="flex flex-col">
                                            {sel.tanggal}
                                            {sel.dariBukuKia && (
                                                <span className="text-keterangan text-ink-700">
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
                    <tr>
                        <th
                            scope="row"
                            className={`${SEL_NAMA} z-10 px-3 py-2 text-left text-kecil font-bold text-ink-900`}
                        >
                            Jumlah anak
                        </th>
                        {jumlahPerDosis.map((jumlah, indeks) => (
                            <td
                                key={kolom[indeks].kode}
                                className="px-3 py-2 text-kecil font-bold text-ink-900 tabular-nums"
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
