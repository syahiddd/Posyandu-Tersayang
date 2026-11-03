import { Head, Link, usePage } from '@inertiajs/react';
import { ChipStatus } from '@/components/dasar/chip-status';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Kartu } from '@/components/dasar/kartu';
import { LencanaMeja } from '@/components/dasar/lencana-meja';
import { TileAngka } from '@/components/dasar/tile-angka';
import { TombolTautan } from '@/components/dasar/tombol';
import { useAntreanRealtime } from '@/hooks/use-antrean-realtime';
import { dataAnak, dataPosyandu, meja, rekapImunisasi } from '@/routes';
import type { AntreanMeja } from '@/types';

type Props = {
    tanggal: string;
    ringkasan: { terdaftar: number; sudahDitimbang: number; selesai: number };
    antrean: AntreanMeja[];
};

/**
 * S03 Beranda (FR-06, FR-07, FR-08; DESIGN 6.1 Tabel 24). Semua angka
 * dihitung dari kunjungan hari ini di database.
 */
export default function Beranda({ tanggal, ringkasan, antrean }: Props) {
    const { mejaAktif, namaPosyandu, name } = usePage().props;
    // Angka diperbarui otomatis tanpa memuat ulang halaman (FR-09).
    useAntreanRealtime(['ringkasan', 'antrean']);
    const antreanSaya = antrean.find((item) => item.nomor === mejaAktif?.nomor);

    return (
        <>
            <Head title="Beranda" />
            <div className="flex flex-1 flex-col gap-5 desktop:max-w-4xl">
                <header>
                    <h1 className="text-judul-1 text-ink-900">
                        {namaPosyandu ?? name}
                    </h1>
                    <p className="text-teks text-ink-700">
                        {tanggal}
                        {mejaAktif && ` · Anda di Meja ${mejaAktif.nomor}`}
                    </p>
                </header>

                <section aria-labelledby="judul-ringkasan">
                    <h2 id="judul-ringkasan" className="sr-only">
                        Ringkasan hari ini
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        <TileAngka
                            angka={ringkasan.terdaftar}
                            label="Terdaftar hari ini"
                        />
                        <TileAngka
                            angka={ringkasan.sudahDitimbang}
                            label="Sudah ditimbang"
                        />
                        <TileAngka
                            angka={ringkasan.selesai}
                            label="Selesai dilayani"
                        />
                    </div>
                    {ringkasan.terdaftar === 0 && (
                        <p className="mt-3 text-teks text-ink-700">
                            Belum ada kunjungan hari ini.
                        </p>
                    )}
                </section>

                <div className="grid gap-5 desktop:grid-cols-[3fr_2fr] desktop:items-start">
                    <Kartu labelSeksi="Antrean per meja">
                        <ul className="divide-y divide-ink-200">
                            {antrean.map((item) => (
                                <li key={item.nomor}>
                                    <BarisAntrean item={item} />
                                </li>
                            ))}
                        </ul>
                    </Kartu>

                    <Kartu labelSeksi="Menu lain">
                        <ul className="divide-y divide-ink-200">
                            {[
                                { label: 'Data Anak', href: dataAnak().url },
                                {
                                    label: 'Rekapitulasi Imunisasi',
                                    href: rekapImunisasi().url,
                                },
                                {
                                    label: 'Data Posyandu',
                                    href: dataPosyandu().url,
                                },
                            ].map((menu) => (
                                <li key={menu.label}>
                                    <Link
                                        href={menu.href}
                                        className="flex min-h-target-min items-center py-2 text-teks font-bold text-ink-900 underline underline-offset-4"
                                    >
                                        {menu.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Kartu>
                </div>

                {mejaAktif && (
                    <KakiTombol className="desktop:max-w-md">
                        <TombolTautan href={meja(mejaAktif.nomor)} lebarPenuh>
                            Buka antrean Meja {mejaAktif.nomor} ·{' '}
                            {antreanSaya?.menunggu ?? 0} anak
                        </TombolTautan>
                    </KakiTombol>
                )}
            </div>
        </>
    );
}

/** Baris antrean satu meja; juga pintasan ke layar meja tersebut (FR-08). */
function BarisAntrean({ item }: { item: AntreanMeja }) {
    const keterangan = [
        `${item.menunggu} menunggu`,
        item.ditunda > 0 ? `${item.ditunda} ditunda` : null,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <Link
            href={meja(item.nomor)}
            aria-label={`Meja ${item.nomor} ${item.tahap}, ${keterangan}`}
            className="flex min-h-target-min items-center gap-3 py-2"
        >
            <LencanaMeja nomor={item.nomor} ukuran="kecil" />
            <span className="min-w-0 flex-1 text-teks font-bold text-ink-900">
                {item.tahap}
            </span>
            <span className="text-teks font-bold text-ink-900 tabular-nums">
                {item.menunggu}
            </span>
            <span className="flex w-28 justify-end">
                {item.ditunda > 0 && (
                    <ChipStatus varian="waspada">
                        {item.ditunda} ditunda
                    </ChipStatus>
                )}
            </span>
        </Link>
    );
}
