import { Link, usePage } from '@inertiajs/react';
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
            <div className="flex flex-col gap-4">
                <header className="flex items-center gap-4">
                    <LencanaMeja
                        nomor={nomor}
                        denganLabel={!diLayarAnak}
                        ukuran={diLayarAnak ? 'kecil' : undefined}
                    />
                    <div className="min-w-0 flex-1">
                        <Judul
                            className={
                                diLayarAnak
                                    ? 'text-judul-2 text-ink-900'
                                    : 'text-judul-2 text-ink-900 desktop:text-judul-1'
                            }
                        >
                            Antrean Meja {nomor}
                            {diLayarAnak && ` · ${antrean.length}`}
                        </Judul>
                        <p className="text-teks text-ink-700">{tahap}</p>
                    </div>
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
                    <div className="flex flex-col items-center gap-3 py-7 text-center">
                        <span
                            aria-hidden="true"
                            className="flex size-14 items-center justify-center rounded-pill bg-ink-100 text-ink-900"
                        >
                            <Check className="size-6" />
                        </span>
                        <p className="text-judul-2 text-ink-900">
                            Antrean kosong
                        </p>
                        <p className="max-w-xs text-teks text-ink-700">
                            Anak dari meja sebelumnya akan muncul di sini
                            otomatis. Tidak perlu memuat ulang.
                        </p>
                        {tombolDitunda}
                    </div>
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
