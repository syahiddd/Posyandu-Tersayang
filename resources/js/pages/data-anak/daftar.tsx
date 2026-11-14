import { Head, InfiniteScroll, router } from '@inertiajs/react';
import { LineChart, Scale, User, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { Kartu } from '@/components/dasar/kartu';
import { KartuHasilAnak } from '@/components/dasar/kartu-hasil-anak';
import { TileAngka } from '@/components/dasar/tile-angka';
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
 * (FR-70), dan aksi cepat ke grafik/KMS (FR-71).
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
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-judul-2 text-ink-900 desktop:text-judul-1">
                        Data Anak
                    </h1>
                    {adaAnak && (
                        <TombolUnduhCsv
                            url={unduh.url({ query: parameter(penyaring) })}
                            kosong={jumlah === 0}
                        />
                    )}
                </header>

                {adaAnak && (
                    <section aria-labelledby="judul-statistik">
                        <h2
                            id="judul-statistik"
                            className="mb-2 text-label-seksi text-ink-600 uppercase"
                        >
                            Ringkasan semua anak
                        </h2>
                        <div className="grid grid-cols-2 gap-3 max-[359px]:gap-2 desktop:grid-cols-4">
                            <TileAngka
                                angka={statistik.total}
                                label="Total anak"
                                ikon={Users}
                                className="min-h-[60px]"
                            />
                            <TileAngka
                                angka={statistik.lakiLaki}
                                label="Laki-laki"
                                ikon={User}
                                className="min-h-[60px]"
                            />
                            <TileAngka
                                angka={statistik.perempuan}
                                label="Perempuan"
                                ikon={User}
                                className="min-h-[60px]"
                            />
                            <TileAngka
                                angka={statistik.belumDitimbangBulanIni}
                                label="Belum ditimbang bulan ini"
                                ikon={Scale}
                                className="min-h-[60px]"
                            />
                        </div>
                        <p className="mt-2 text-keterangan text-ink-600">
                            Untuk seluruh anak posyandu; tidak mengikuti
                            pencarian dan penyaring di bawah.
                        </p>
                    </section>
                )}

                <Kartu labelSeksi="Cari & saring">
                    <div className="flex flex-col gap-3">
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

                        <div className="flex flex-col gap-3">
                            {/* Jenis Kelamin - menggunakan select dropdown */}
                            <select
                                className="h-control-h w-full rounded-pill border border-ink-300 bg-white px-4 text-teks text-ink-900 placeholder:text-ink-500 focus:border-brand-700 focus:outline-none"
                                value={penyaring.jk ?? ''}
                                onChange={(e) =>
                                    saring({
                                        jk: e.target
                                            .value as JenisKelamin | null,
                                    })
                                }
                            >
                                <option value="">Semua</option>
                                <option
                                    value="L"
                                    className="font-bold text-ink-900"
                                >
                                    Laki-laki
                                </option>
                                <option
                                    value="P"
                                    className="font-bold text-ink-900"
                                >
                                    Perempuan
                                </option>
                            </select>

                            {/* Kelompok Umur - menggunakan select dropdown */}
                            <select
                                className="h-control-h w-full rounded-pill border border-ink-300 bg-white px-4 text-teks text-ink-900 placeholder:text-ink-500 focus:border-brand-700 focus:outline-none"
                                value={penyaring.umur ?? ''}
                                onChange={(e) =>
                                    saring({ umur: e.target.value })
                                }
                            >
                                <option value="">Semua</option>
                                {daftarKelompokUmur.map((satu) => (
                                    <option key={satu.nilai} value={satu.nilai}>
                                        {satu.label}
                                    </option>
                                ))}
                            </select>

                            {/* Dusun - menggunakan select dropdown (hanya muncul > 1 dusun) */}
                            {daftarDusun.length > 1 && (
                                <select
                                    className="h-control-h w-full rounded-pill border border-ink-300 bg-white px-4 text-teks text-ink-900 placeholder:text-ink-500 focus:border-brand-700 focus:outline-none"
                                    value={penyaring.dusun ?? ''}
                                    onChange={(e) =>
                                        saring({ dusun: e.target.value })
                                    }
                                >
                                    <option value="">Semua</option>
                                    {daftarDusun.map((dusun) => (
                                        <option key={dusun} value={dusun}>
                                            {dusun}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </Kartu>

                <section aria-labelledby="judul-hasil">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2
                            id="judul-hasil"
                            className="text-label-seksi text-ink-600 uppercase"
                            aria-live="polite"
                        >
                            {jumlah} anak
                        </h2>
                        {adaPenyaring && (
                            <Tombol
                                varian="tersier"
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
                    ) : jumlah === 0 ? (
                        <p className="text-teks text-ink-700">
                            Tidak ditemukan. Ubah pencarian atau penyaring.
                        </p>
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
