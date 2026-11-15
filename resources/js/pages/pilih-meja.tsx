import { Head, useForm } from '@inertiajs/react';
import { clsx } from 'clsx';
import { ArrowRight, CalendarDays, Check } from 'lucide-react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { LencanaMeja } from '@/components/dasar/lencana-meja';
import { Tombol } from '@/components/dasar/tombol';
import { useAntreanRealtime } from '@/hooks/use-antrean-realtime';
import { update } from '@/routes/pilih-meja';
import type { AntreanMeja } from '@/types';

type Props = {
    tanggal: string;
    meja: AntreanMeja[];
    terpilih: number | null;
};

function ringkasAntrean({ menunggu, ditunda }: AntreanMeja) {
    return [`${menunggu} menunggu`, ditunda > 0 ? `${ditunda} ditunda` : null]
        .filter(Boolean)
        .join(' · ');
}

/**
 * S02 Pilih Meja (FR-03, DESIGN 6.1 Tabel 23): lima kartu pilihan tunggal
 * dengan jumlah antrean dari database; meja terakhir terpilih otomatis.
 *
 * Kepala gradien plum dan kartu bergradasi blush memberi pemisahan visual
 * yang jelas, sementara lencana meja, nama tahap, dan jumlah antrean tetap
 * menjadi urutan baca utama di layar ponsel.
 */
export default function PilihMeja({ tanggal, meja, terpilih }: Props) {
    const form = useForm<{ meja: number | null }>({ meja: terpilih });
    useAntreanRealtime(['meja']);
    const mejaTerpilih = meja.find((item) => item.nomor === form.data.meja);

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (form.data.meja !== null) {
            form.put(update.url());
        }
    }

    return (
        <>
            <Head title="Pilih meja" />
            <form
                onSubmit={kirim}
                className="flex min-h-dvh flex-col bg-gradient-to-b from-brand-50 via-paper to-paper"
            >
                <header className="relative isolate overflow-hidden rounded-b-[28px] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 pt-5 pb-6 text-white shadow-2 tablet:px-5 tablet:pt-6 tablet:pb-7">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-pill bg-brand-300/20 blur-3xl"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-pill bg-brand-600/30 blur-3xl"
                    />

                    <div className="relative mx-auto w-full max-w-xl">
                        <p className="text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                            Posyandu Tersayang
                        </p>

                        <h1 className="mt-3 text-display text-white">
                            Pilih meja hari ini
                        </h1>
                        <span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-3 text-keterangan font-bold text-white backdrop-blur-sm">
                            <CalendarDays
                                aria-hidden="true"
                                className="size-4 shrink-0"
                            />
                            {tanggal}
                        </span>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-4 tablet:px-5 tablet:pt-5">
                    {form.errors.meja && (
                        <Banner varian="bahaya" className="mb-4">
                            {form.errors.meja}
                        </Banner>
                    )}

                    <div className="mb-2 flex items-center justify-between gap-3 px-1">
                        <h2 className="text-label-seksi tracking-[0.12em] text-ink-600 uppercase">
                            Meja pelayanan
                        </h2>
                        <p className="text-keterangan font-bold text-brand-700">
                            {meja.length} meja
                        </p>
                    </div>

                    <fieldset>
                        <legend className="sr-only">
                            Meja yang dipegang hari ini
                        </legend>
                        <ul className="flex flex-col gap-3">
                            {meja.map((item) => {
                                const dipilih = form.data.meja === item.nomor;

                                return (
                                    <li key={item.nomor}>
                                        <label
                                            className={clsx(
                                                'group relative flex min-h-target-min cursor-pointer items-center gap-4 overflow-hidden rounded-lg border-2 px-4 py-4 transition-all',
                                                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink-900',
                                                dipilih
                                                    ? 'border-brand-600 bg-gradient-to-br from-brand-50 via-white to-brand-100 shadow-2'
                                                    : 'border-ink-200 bg-white shadow-1 hover:border-brand-300 hover:shadow-2 active:bg-brand-50',
                                            )}
                                        >
                                            {dipilih && (
                                                <span
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute -top-12 -right-10 size-28 rounded-pill bg-brand-300/25 blur-2xl"
                                                />
                                            )}

                                            <input
                                                type="radio"
                                                name="meja"
                                                value={item.nomor}
                                                aria-label={`Meja ${item.nomor} ${item.tahap}, ${ringkasAntrean(item)}`}
                                                checked={dipilih}
                                                onChange={() =>
                                                    form.setData(
                                                        'meja',
                                                        item.nomor,
                                                    )
                                                }
                                                className="sr-only"
                                            />

                                            <LencanaMeja
                                                nomor={item.nomor}
                                                denganLabel
                                                className={clsx(
                                                    'relative transition-transform group-active:scale-95',
                                                    dipilih
                                                        ? 'from-brand-600 to-brand-900 ring-2 ring-brand-300 ring-inset'
                                                        : 'from-brand-800 to-brand-900',
                                                )}
                                            />

                                            <span className="relative flex min-w-0 flex-1 flex-col gap-1.5">
                                                <span className="text-judul-2 text-ink-900">
                                                    {item.tahap}
                                                </span>
                                                <span className="flex flex-wrap items-center gap-1.5">
                                                    <span
                                                        className={clsx(
                                                            'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-keterangan font-bold',
                                                            item.menunggu > 0
                                                                ? 'bg-brand-100 text-brand-800'
                                                                : 'bg-ink-100 text-ink-600',
                                                        )}
                                                    >
                                                        <span
                                                            aria-hidden="true"
                                                            className={clsx(
                                                                'size-1.5 rounded-pill',
                                                                item.menunggu >
                                                                    0
                                                                    ? 'bg-brand-600'
                                                                    : 'bg-ink-400',
                                                            )}
                                                        />
                                                        {item.menunggu} menunggu
                                                    </span>
                                                    {item.ditunda > 0 && (
                                                        <span className="inline-flex items-center rounded-pill bg-status-waspada-latar px-2.5 py-1 text-keterangan font-bold text-status-waspada-teks">
                                                            {item.ditunda}{' '}
                                                            ditunda
                                                        </span>
                                                    )}
                                                </span>
                                            </span>

                                            <span
                                                aria-hidden="true"
                                                className={clsx(
                                                    'relative flex size-6 shrink-0 items-center justify-center rounded-pill border-2 transition-all',
                                                    dipilih
                                                        ? 'border-brand-800 bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-1'
                                                        : 'border-ink-300 bg-white',
                                                )}
                                            >
                                                {dipilih && (
                                                    <Check
                                                        aria-hidden="true"
                                                        className="size-4"
                                                        strokeWidth={3}
                                                    />
                                                )}
                                            </span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>

                    <KakiTombol
                        denganNavigasi={false}
                        className="mt-auto border-brand-100 bg-white/95 pt-4 backdrop-blur-sm"
                    >
                        <Tombol
                            type="submit"
                            lebarPenuh
                            disabled={!mejaTerpilih}
                            memuat={form.processing}
                            teksMemuat="Membuka…"
                            className={clsx(
                                mejaTerpilih &&
                                    'bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 shadow-2',
                            )}
                        >
                            {mejaTerpilih
                                ? `Mulai di Meja ${mejaTerpilih.nomor}`
                                : 'Pilih meja dulu'}
                            {mejaTerpilih && (
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            )}
                        </Tombol>
                    </KakiTombol>
                </main>
            </form>
        </>
    );
}
