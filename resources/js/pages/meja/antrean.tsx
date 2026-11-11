import { Head, Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { KartuAnak, labelKartuAnak } from '@/components/dasar/kartu-anak';
import { LencanaMeja } from '@/components/dasar/lencana-meja';
import { SheetBawah } from '@/components/dasar/sheet-bawah';
import { kelasTombol } from '@/components/dasar/tombol';
import { useAntreanRealtime } from '@/hooks/use-antrean-realtime';
import { useSekarang } from '@/hooks/use-sekarang';
import { lamaSejak } from '@/lib/waktu';
import { buka, lanjutkan } from '@/routes/kunjungan';
import type { KartuAntrean } from '@/types';

export type AntreanMeja = {
    nomor: number;
    tahap: string;
    tersedia: boolean;
    antrean: KartuAntrean[];
    ditunda: KartuAntrean[];
};

type Props = { antreanMeja: AntreanMeja };

/**
 * S08 Antrean meja dan S13 Daftar Ditunda (PRD 3.2–3.3, FR-18,
 * FR-47 sampai FR-49; DESIGN 5.4, 5.8, Gambar 9). Diperbarui otomatis
 * saat meja lain menyimpan (FR-09, NFR-02).
 */
export default function Antrean({ antreanMeja }: Props) {
    const { nomor, tahap, tersedia, antrean, ditunda } = antreanMeja;
    const { errors } = usePage().props;
    const sekarang = useSekarang();
    const [sheetTerbuka, setSheetTerbuka] = useState(false);
    const [pengumuman, setPengumuman] = useState('');
    const jumlahSebelumnya = useRef(antrean.length);

    useAntreanRealtime(['antreanMeja'], nomor);

    // Bab 10.4: umumkan anak baru di antrean lewat wilayah aria-live.
    useEffect(() => {
        const bertambah = antrean.length - jumlahSebelumnya.current;
        jumlahSebelumnya.current = antrean.length;

        if (bertambah > 0) {
            setPengumuman(`${bertambah} anak baru di antrean`);
        }
    }, [antrean.length]);

    const tombolDitunda =
        ditunda.length > 0 ? (
            <button
                type="button"
                onClick={() => setSheetTerbuka(true)}
                className="inline-flex min-h-target-min cursor-pointer items-center rounded-pill bg-status-waspada-latar px-4 text-kecil font-bold text-status-waspada-teks"
            >
                {ditunda.length} ditunda · Lihat
            </button>
        ) : null;

    return (
        <>
            <Head title={`Antrean Meja ${nomor}`} />
            <div className="flex flex-col gap-4 desktop:max-w-2xl">
                <header className="flex items-center gap-4">
                    <LencanaMeja nomor={nomor} denganLabel />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-judul-1 text-ink-900">
                            Antrean Meja {nomor}
                        </h1>
                        <p className="text-teks text-ink-700">{tahap}</p>
                    </div>
                </header>

                {errors.kunjungan && (
                    <Banner varian="bahaya">{errors.kunjungan}</Banner>
                )}
                {!tersedia && (
                    <Banner varian="info" judul="Belum tersedia">
                        Layanan Meja {nomor} dikerjakan pada fase berikutnya.
                        Antrean tetap ditampilkan.
                    </Banner>
                )}

                {antrean.length > 0 && tombolDitunda && (
                    <div>{tombolDitunda}</div>
                )}

                {antrean.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-7 text-center">
                        <span
                            aria-hidden="true"
                            className="flex size-14 items-center justify-center rounded-pill bg-ink-100 text-ink-900"
                        >
                            <Check className="size-7" />
                        </span>
                        <h2 className="text-judul-2 text-ink-900">
                            Antrean kosong
                        </h2>
                        <p className="max-w-xs text-teks text-ink-700">
                            Anak dari meja sebelumnya akan muncul di sini
                            otomatis. Tidak perlu memuat ulang.
                        </p>
                        {tombolDitunda}
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {antrean.map((anak) => {
                            const bisaDibuka = tersedia && !anak.terkunci;

                            return (
                                <li key={anak.id}>
                                    {bisaDibuka ? (
                                        <Link
                                            href={buka(anak.id)}
                                            as="button"
                                            aria-label={labelKartuAnak(anak)}
                                            className="block w-full cursor-pointer rounded-md"
                                        >
                                            <KartuAnak
                                                anak={anak}
                                                sekarang={sekarang}
                                            />
                                        </Link>
                                    ) : (
                                        <div
                                            role="button"
                                            aria-disabled="true"
                                            aria-label={labelKartuAnak(anak)}
                                        >
                                            <KartuAnak
                                                anak={anak}
                                                sekarang={sekarang}
                                                redup={anak.terkunci}
                                            />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                <p aria-live="polite" className="sr-only">
                    {pengumuman}
                </p>
            </div>

            <SheetBawah
                terbuka={sheetTerbuka && ditunda.length > 0}
                onTutup={() => setSheetTerbuka(false)}
                judul={`Ditunda di Meja ${nomor}`}
            >
                <ul className="flex flex-col gap-3">
                    {ditunda.map((anak) => (
                        <li key={anak.id} className="flex flex-col gap-2">
                            <KartuAnak
                                anak={anak}
                                sekarang={sekarang}
                                keterangan={
                                    anak.ditundaPada && (
                                        <span className="text-kecil font-bold text-status-waspada-teks">
                                            Ditunda{' '}
                                            {lamaSejak(
                                                anak.ditundaPada,
                                                sekarang,
                                            )}
                                        </span>
                                    )
                                }
                            />
                            <Link
                                href={lanjutkan(anak.id)}
                                as="button"
                                preserveScroll
                                className={kelasTombol('sekunder', true)}
                            >
                                Lanjutkan {anak.nama.split(' ')[0]}
                            </Link>
                        </li>
                    ))}
                </ul>
            </SheetBawah>
        </>
    );
}
