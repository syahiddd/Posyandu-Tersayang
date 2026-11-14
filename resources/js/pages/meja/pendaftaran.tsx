import { Head, router, usePage } from '@inertiajs/react';
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
                <header className="flex items-center gap-4">
                    <LencanaMeja nomor={1} denganLabel />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-judul-2 text-ink-900 desktop:text-judul-1">
                            Lanjutkan progres anak
                        </h1>
                        <p className="text-teks text-ink-700">
                            Cari nama, NIK anak, atau nama/NIK ibu
                        </p>
                    </div>
                </header>

                {errors.kunjungan && (
                    <Banner varian="bahaya">{errors.kunjungan}</Banner>
                )}

                <IsianTeks
                    ref={refCari}
                    jenis="cari"
                    label="Cari anak"
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

                {cukupUntukMencari && (
                    <section aria-labelledby="judul-hasil">
                        <h2
                            id="judul-hasil"
                            className="mb-2 text-label-seksi text-ink-600 uppercase"
                            aria-live="polite"
                        >
                            {hasil.length} hasil
                        </h2>
                        {hasil.length === 0 ? (
                            <p className="text-teks text-ink-700">
                                Tidak ditemukan. Periksa ejaan, atau tambahkan
                                sebagai anak baru.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-3">
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
                                            className="block w-full cursor-pointer rounded-md disabled:cursor-not-allowed"
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
                        >
                            + Tambah anak baru
                        </TombolTautan>
                    )}
                </KakiTombol>
            </div>
        </>
    );
}
