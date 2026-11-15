import { Head, router, usePage } from '@inertiajs/react';
import { Search, SearchX, UserPlus, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import {
    KartuHasilAnak,
    labelHasilAnak,
} from '@/components/dasar/kartu-hasil-anak';
import { LencanaMeja } from '@/components/dasar/lencana-meja';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { usePintasanCari } from '@/hooks/use-pintasan-cari';
import { meja } from '@/routes';
import { anakBaru, kirim } from '@/routes/meja1';
import type { RingkasanAnak } from '@/types';

type Props = {
    cari: string;
    cukupUntukMencari: boolean;
    hasil: RingkasanAnak[];
};

/**
 * Meja 1 Pendaftaran (S04/S06, DESIGN 5.3, Gambar 4): cari anak terdaftar
 * dengan nama anak, NIK anak, nama ibu, atau NIK ibu (FR-14, FR-15), lalu
 * Lanjutkan progres ke antrean Meja 2 (FR-16, FR-17), atau Tambah anak baru.
 *
 * Susunan: kepala ringkas berisi lencana meja dan penjelasan, kartu pencarian
 * yang menempel di atas hasil, lalu daftar hasil. Kartu pencarian diberi
 * bingkai sendiri supaya isian 52 px tidak tampak melayang di latar kertas.
 */
export default function Pendaftaran({ cari, cukupUntukMencari, hasil }: Props) {
    const { errors } = usePage().props;
    const [kata, setKata] = useState(cari);
    const [terpilih, setTerpilih] = useState<RingkasanAnak | null>(null);
    const [mengirim, setMengirim] = useState(false);
    const refCari = useRef<HTMLInputElement>(null);

    // Hasil muncul saat mengetik (DESIGN 5.3 langkah 1).
    useEffect(() => {
        if (kata === cari) {
            return;
        }

        const tunda = setTimeout(() => {
            router.get(meja.url(1), kata.trim() === '' ? {} : { cari: kata }, {
                only: ['cari', 'cukupUntukMencari', 'hasil'],
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(tunda);
    }, [kata, cari]);

    usePintasanCari(refCari);

    function cariKembali() {
        setTerpilih(null);
        setKata('');
        refCari.current?.focus();
    }

    function lanjutkanProgres() {
        if (!terpilih) {
            return;
        }

        setMengirim(true);
        router.post(
            kirim.url(terpilih.id),
            {},
            {
                onSuccess: () => {
                    setTerpilih(null);
                    setKata('');
                },
                onFinish: () => setMengirim(false),
            },
        );
    }

    const pilihan = terpilih
        ? (hasil.find((anak) => anak.id === terpilih.id) ?? terpilih)
        : null;

    return (
        <>
            <Head title="Meja 1 · Pendaftaran" />
            <div className="flex flex-1 flex-col gap-4 desktop:max-w-2xl">
                <header className="flex items-center gap-3">
                    <LencanaMeja nomor={1} denganLabel />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-judul-1 leading-tight text-ink-900 desktop:text-display">
                            Lanjutkan progres anak
                        </h1>
                        <p className="text-kecil leading-snug text-ink-700">
                            Cari nama, NIK anak, atau nama/NIK ibu
                        </p>
                    </div>
                </header>

                {errors.kunjungan && (
                    <Banner varian="bahaya">{errors.kunjungan}</Banner>
                )}

                <section
                    aria-label="Pencarian anak"
                    className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1"
                >
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <Search
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Cari anak
                        </h2>
                    </div>

                    <div className="px-3.5 py-3.5">
                        <IsianTeks
                            ref={refCari}
                            jenis="cari"
                            label="Nama atau NIK"
                            petunjuk="Minimal 3 huruf nama atau 4 angka NIK. Boleh digabung, misalnya nama anak dan nama ibu."
                            value={kata}
                            onChange={(event) => {
                                setKata(event.target.value);
                                setTerpilih(null);
                            }}
                            onHapus={cariKembali}
                            autoComplete="off"
                            enterKeyHint="search"
                        />
                    </div>
                </section>

                {cukupUntukMencari && (
                    <section aria-labelledby="judul-hasil">
                        <div className="mb-2 flex items-center gap-2">
                            <h2
                                id="judul-hasil"
                                className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase"
                                aria-live="polite"
                            >
                                Hasil pencarian
                            </h2>
                            <span className="inline-flex min-h-6 items-center gap-1 rounded-pill border border-brand-200 bg-brand-50 px-2 text-label-seksi tracking-[0.04em] text-brand-700 uppercase tabular-nums">
                                <Users aria-hidden="true" className="size-3" />
                                {hasil.length}
                            </span>
                        </div>

                        {hasil.length === 0 ? (
                            <div className="flex items-start gap-3 rounded-lg border border-dashed border-ink-300 bg-white px-3.5 py-3.5">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-ink-100 text-ink-600">
                                    <SearchX
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-kecil font-bold text-ink-900">
                                        Anak tidak ditemukan
                                    </p>
                                    <p className="mt-0.5 text-keterangan leading-relaxed text-ink-600">
                                        Periksa ejaan nama atau NIK, lalu coba
                                        lagi. Bila memang belum terdaftar,
                                        tambahkan sebagai anak baru.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-2.5">
                                {hasil.map((anak) => (
                                    <li key={anak.id}>
                                        <button
                                            type="button"
                                            disabled={anak.sudahDiAntrean}
                                            aria-pressed={
                                                pilihan?.id === anak.id
                                            }
                                            aria-label={labelHasilAnak(anak)}
                                            onClick={() => setTerpilih(anak)}
                                            className="block w-full cursor-pointer rounded-md text-left disabled:cursor-not-allowed"
                                        >
                                            <KartuHasilAnak
                                                anak={anak}
                                                dipilih={
                                                    pilihan?.id === anak.id
                                                }
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                <KakiTombol className="desktop:max-w-2xl">
                    {pilihan ? (
                        <>
                            <Tombol
                                varian="sekunder"
                                onClick={cariKembali}
                                className="shrink-0"
                            >
                                Cari kembali
                            </Tombol>
                            <Tombol
                                lebarPenuh
                                memuat={mengirim}
                                teksMemuat="Mengirim…"
                                onClick={lanjutkanProgres}
                            >
                                Lanjutkan progres
                            </Tombol>
                        </>
                    ) : (
                        <TombolTautan
                            href={anakBaru()}
                            varian="sekunder"
                            lebarPenuh
                            className="gap-1.5"
                        >
                            <UserPlus aria-hidden="true" className="size-5" />
                            Tambah anak baru
                        </TombolTautan>
                    )}
                </KakiTombol>
            </div>
        </>
    );
}
