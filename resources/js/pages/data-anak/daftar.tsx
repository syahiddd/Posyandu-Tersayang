import { Head, InfiniteScroll, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ChipPenyaring } from '@/components/dasar/chip-penyaring';
import { IsianTeks } from '@/components/dasar/isian-teks';
import {
    KartuHasilAnak,
    labelHasilAnak,
} from '@/components/dasar/kartu-hasil-anak';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { usePintasanCari } from '@/hooks/use-pintasan-cari';
import { dataAnak, meja } from '@/routes';
import { detail, terhapus } from '@/routes/data-anak';
import type { JenisKelamin, PenyaringDataAnak, RingkasanAnak } from '@/types';

type Props = {
    penyaring: PenyaringDataAnak;
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
 * S14 Data Anak (FR-50, DESIGN 6.5): isian cari; chip penyaring jenis
 * kelamin, kelompok umur, dusun; jumlah hasil; daftar kartu anak dengan NIK
 * tersamar (NFR-05).
 */
export default function DaftarDataAnak({
    penyaring,
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
                <header>
                    <h1 className="text-judul-1 text-ink-900">Data Anak</h1>
                </header>

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
                    <ChipPenyaring
                        label="Jenis kelamin"
                        nilai={penyaring.jk}
                        onUbah={(jk) =>
                            saring({ jk: jk as JenisKelamin | null })
                        }
                        opsi={[
                            { nilai: null, label: 'Semua' },
                            { nilai: 'L', label: 'Laki-laki' },
                            { nilai: 'P', label: 'Perempuan' },
                        ]}
                    />
                    <ChipPenyaring
                        label="Kelompok umur"
                        nilai={penyaring.umur}
                        onUbah={(umur) => saring({ umur })}
                        opsi={[
                            { nilai: null, label: 'Semua' },
                            ...daftarKelompokUmur,
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
                </div>

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
                                        teksMemuat="Memuat…"
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
                                        <Link
                                            href={detail(satu.id)}
                                            aria-label={labelHasilAnak(satu)}
                                            className="block rounded-md"
                                        >
                                            <KartuHasilAnak
                                                anak={satu}
                                                redupDiAntrean={false}
                                            />
                                        </Link>
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
