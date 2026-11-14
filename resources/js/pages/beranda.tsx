import { Head, Link, usePage } from '@inertiajs/react';
import { Baby, CircleCheck, Scale, UserPlus } from 'lucide-react';
import { ChipStatus } from '@/components/dasar/chip-status';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Kartu } from '@/components/dasar/kartu';
import { LencanaMeja } from '@/components/dasar/lencana-meja';
import { TileAngka } from '@/components/dasar/tile-angka';
import { TombolTautan } from '@/components/dasar/tombol';
import { useAntreanRealtime } from '@/hooks/use-antrean-realtime';
import { meja } from '@/routes';
import type { AntreanMeja } from '@/types';

type Props = {
    tanggal: string;
    ringkasan: { terdaftar: number; sudahDitimbang: number; selesai: number };
    antrean: AntreanMeja[];
};

/**
 * S03 Beranda (FR-06, FR-07, FR-08; DESIGN 6.1 Tabel 24). Semua angka
 * dihitung dari kunjungan hari ini di database. Susunan visual mengikuti
 * acuan prototipe "Posya App": bilah layanan plum, panel identitas kader,
 * lalu ringkasan dan antrean lima meja.
 */
export default function Beranda({ tanggal, ringkasan, antrean }: Props) {
    const { auth, mejaAktif, namaPosyandu, name } = usePage().props;
    // Angka diperbarui otomatis tanpa memuat ulang halaman (FR-09).
    useAntreanRealtime(['ringkasan', 'antrean']);
    const antreanSaya = antrean.find((item) => item.nomor === mejaAktif?.nomor);
    const posyandu = namaPosyandu ?? name;

    return (
        <>
            <Head title="Beranda" />
            <div className="flex flex-1 flex-col gap-5 desktop:max-w-4xl">
                <section
                    aria-labelledby="judul-beranda"
                    className="overflow-hidden rounded-lg shadow-2"
                >
                    <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-700 to-brand-900 px-5 pt-6 pb-8 text-white">
                        <p className="text-label-seksi text-white/75 uppercase">
                            Selamat bertugas
                        </p>
                        <h1
                            id="judul-beranda"
                            className="mt-1 text-display text-white"
                        >
                            Layanan Posyandu
                        </h1>
                        <p className="mt-1 text-teks text-white/90">
                            {tanggal}
                        </p>
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute right-2 -bottom-1 flex items-end gap-1 text-white/15"
                        >
                            <Baby className="size-8" />
                            <Baby className="size-12" />
                            <Baby className="size-9" />
                        </div>
                    </div>
                    <dl className="flex flex-col gap-2 bg-brand-800 px-4 py-4">
                        <BarisIdentitas
                            label="Kader"
                            nilai={auth.user?.name ?? '—'}
                        />
                        <BarisIdentitas
                            label="Meja Anda"
                            nilai={
                                mejaAktif
                                    ? `Meja ${mejaAktif.nomor} · ${mejaAktif.tahap}`
                                    : 'Belum dipilih'
                            }
                        />
                        <BarisIdentitas label="Posyandu" nilai={posyandu} />
                    </dl>
                </section>

                <section aria-labelledby="judul-ringkasan">
                    <h2 id="judul-ringkasan" className="sr-only">
                        Ringkasan hari ini
                    </h2>
                    <div className="grid grid-cols-3 gap-3 max-[359px]:gap-2">
                        <TileAngka
                            angka={ringkasan.terdaftar}
                            label="Terdaftar hari ini"
                            ikon={UserPlus}
                        />
                        <TileAngka
                            angka={ringkasan.sudahDitimbang}
                            label="Sudah ditimbang"
                            ikon={Scale}
                        />
                        <TileAngka
                            angka={ringkasan.selesai}
                            label="Selesai dilayani"
                            ikon={CircleCheck}
                        />
                    </div>
                    {ringkasan.terdaftar === 0 && (
                        <p className="mt-3 text-teks text-ink-700">
                            Belum ada kunjungan hari ini.
                        </p>
                    )}
                </section>

                <Kartu labelSeksi="Antrean per meja">
                    <ul className="divide-y divide-ink-200">
                        {antrean.map((item) => (
                            <li key={item.nomor}>
                                <BarisAntrean item={item} />
                            </li>
                        ))}
                    </ul>
                </Kartu>

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

/** Satu baris panel identitas: label putih, nilai dalam kotak putih kapsul. */
function BarisIdentitas({ label, nilai }: { label: string; nilai: string }) {
    return (
        <div className="flex items-center gap-3">
            <dt className="w-28 shrink-0 text-kecil font-bold text-white/90">
                {label}
            </dt>
            <dd className="flex h-control-h min-w-0 flex-1 items-center rounded-pill bg-white px-4 shadow-1">
                <span className="truncate text-teks font-bold text-ink-900">
                    {nilai}
                </span>
            </dd>
        </div>
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
            <span className="flex w-28 justify-end max-[359px]:w-auto">
                {item.ditunda > 0 && (
                    <ChipStatus varian="waspada">
                        {item.ditunda} ditunda
                    </ChipStatus>
                )}
            </span>
        </Link>
    );
}
