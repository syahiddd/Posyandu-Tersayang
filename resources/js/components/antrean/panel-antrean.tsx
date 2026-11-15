import { Link, usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
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

/**
 * Isi antrean satu meja (S08, S13; FR-18, FR-47 sampai FR-49; DESIGN 5.4,
 * 5.8, Gambar 9). Di ponsel menjadi layar antrean; di tablet lebar dan
 * desktop menjadi kolom di samping layar anak (bab 9, Gambar 10), dengan
 * anak yang sedang dibuka ditandai. Diperbarui otomatis saat meja lain
 * menyimpan (FR-09, NFR-02) tanpa menyentuh isian layar anak.
 */
export function PanelAntrean({
    antreanMeja,
    kunjunganAktif = null,
    onPilih,
}: {
    antreanMeja: AntreanMeja;
    /** Id kunjungan yang sedang dibuka; null di layar antrean. */
    kunjunganAktif?: number | null;
    /** Di samping layar anak: memindahkan kader ke anak lain (bab 9). */
    onPilih?: (anak: KartuAntrean) => void;
}) {
    const { nomor, tahap, tersedia, antrean, ditunda } = antreanMeja;
    const { errors } = usePage().props;
    const sekarang = useSekarang();
    const [sheetTerbuka, setSheetTerbuka] = useState(false);
    const [pengumuman, setPengumuman] = useState('');
    const jumlahSebelumnya = useRef(antrean.length);
    const diLayarAnak = kunjunganAktif !== null;
    const Judul = diLayarAnak ? 'h2' : 'h1';

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
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4">
                <header
                    className={clsx(
                        'relative isolate overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white shadow-2',
                        diLayarAnak ? 'rounded-md p-3' : 'rounded-lg p-4',
                    )}
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-12 -right-10 size-32 rounded-pill bg-brand-300/25 blur-2xl"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-14 -left-12 size-36 rounded-pill bg-brand-600/30 blur-2xl"
                    />

                    <div className="relative flex items-center gap-3">
                        <LencanaMeja
                            nomor={nomor}
                            denganLabel={!diLayarAnak}
                            ukuran={diLayarAnak ? 'kecil' : undefined}
                            varian="terang"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-label-seksi tracking-[0.16em] text-brand-200 uppercase">
                                Meja pelayanan
                            </p>
                            <Judul
                                className={clsx(
                                    'mt-1 text-white',
                                    diLayarAnak
                                        ? 'text-judul-2'
                                        : 'text-judul-2 desktop:text-judul-1',
                                )}
                            >
                                {diLayarAnak
                                    ? `Meja ${nomor} · ${antrean.length} anak`
                                    : `Antrean Meja ${nomor}`}
                            </Judul>
                            <p className="mt-0.5 text-kecil text-brand-100">
                                {tahap}
                            </p>
                        </div>
                    </div>

                    {!diLayarAnak && (
                        <div className="relative mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-white backdrop-blur-sm">
                                <span
                                    aria-hidden="true"
                                    className="size-1.5 rounded-pill bg-brand-200"
                                />
                                {antrean.length} menunggu
                            </span>
                            {ditunda.length > 0 && (
                                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/20 bg-status-waspada-latar px-2.5 text-keterangan font-bold text-status-waspada-teks">
                                    {ditunda.length} ditunda
                                </span>
                            )}
                            {tersedia && (
                                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 text-keterangan font-bold text-brand-100 backdrop-blur-sm">
                                    <Check
                                        aria-hidden="true"
                                        className="size-3.5"
                                        strokeWidth={3}
                                    />
                                    Siap melayani
                                </span>
                            )}
                        </div>
                    )}
                </header>

                {!diLayarAnak && errors.kunjungan && (
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
                    <>
                        <div className="flex flex-1 items-center justify-center py-1 panel:hidden">
                            <div className="relative isolate w-full overflow-hidden rounded-lg border border-brand-100 bg-gradient-to-br from-white via-brand-50/80 to-brand-100 px-5 py-8 text-center shadow-1">
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-300"
                                />
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-pill bg-brand-200/50 blur-3xl"
                                />

                                <div className="relative mx-auto flex max-w-[19rem] flex-col items-center">
                                    <span
                                        aria-hidden="true"
                                        className="relative flex size-16 items-center justify-center"
                                    >
                                        <span className="absolute inset-0 rounded-pill bg-brand-200/60 blur-md" />
                                        <span className="relative flex size-14 items-center justify-center rounded-pill bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-2">
                                            <Check
                                                className="size-6"
                                                strokeWidth={2.5}
                                            />
                                        </span>
                                    </span>

                                    <p className="mt-4 text-judul-2 text-brand-900">
                                        Antrean masih kosong
                                    </p>
                                    <p className="mt-1.5 text-kecil leading-relaxed text-ink-600">
                                        Anak dari meja sebelumnya akan muncul di
                                        sini otomatis. Tidak perlu memuat ulang
                                        halaman.
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-2 rounded-pill border border-brand-100 bg-white/80 px-3 py-1.5 text-keterangan font-bold text-brand-700">
                                        <span
                                            aria-hidden="true"
                                            className="size-2 animate-pulse rounded-pill bg-brand-600"
                                        />
                                        Menunggu anak berikutnya
                                    </span>
                                    {tombolDitunda && (
                                        <div className="mt-3">
                                            {tombolDitunda}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="hidden flex-1 flex-col items-center justify-center gap-2 px-2 py-6 text-center panel:flex">
                            <span
                                aria-hidden="true"
                                className="flex size-10 items-center justify-center rounded-pill border border-brand-100 bg-brand-50 text-brand-700"
                            >
                                <Check className="size-5" strokeWidth={2.5} />
                            </span>
                            <p className="text-kecil font-bold text-brand-900">
                                Antrean masih kosong
                            </p>
                            <p className="text-keterangan leading-relaxed text-ink-600">
                                Anak akan muncul otomatis di sini.
                            </p>
                            {tombolDitunda && <div>{tombolDitunda}</div>}
                        </div>
                    </>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {antrean.map((anak) => {
                            const aktif = anak.id === kunjunganAktif;
                            const bisaDibuka =
                                tersedia && !anak.terkunci && !aktif;

                            return (
                                <li key={anak.id}>
                                    {bisaDibuka && onPilih ? (
                                        <button
                                            type="button"
                                            onClick={() => onPilih(anak)}
                                            aria-label={labelKartuAnak(anak)}
                                            className="block w-full cursor-pointer rounded-md"
                                        >
                                            <KartuAnak
                                                anak={anak}
                                                sekarang={sekarang}
                                                ringkasDiKolom
                                            />
                                        </button>
                                    ) : bisaDibuka ? (
                                        <Link
                                            href={buka(anak.id)}
                                            as="button"
                                            aria-label={labelKartuAnak(anak)}
                                            className="block w-full cursor-pointer rounded-md"
                                        >
                                            <KartuAnak
                                                anak={anak}
                                                sekarang={sekarang}
                                                ringkasDiKolom
                                            />
                                        </Link>
                                    ) : (
                                        <div
                                            aria-current={
                                                aktif ? 'true' : undefined
                                            }
                                            aria-label={
                                                aktif
                                                    ? `${labelKartuAnak(anak)}, sedang Anda layani`
                                                    : labelKartuAnak(anak)
                                            }
                                            role={aktif ? undefined : 'button'}
                                            aria-disabled={
                                                aktif ? undefined : 'true'
                                            }
                                        >
                                            <KartuAnak
                                                anak={anak}
                                                sekarang={sekarang}
                                                redup={anak.terkunci}
                                                aktif={aktif}
                                                ringkasDiKolom
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
