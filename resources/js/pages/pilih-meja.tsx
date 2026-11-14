import { Head, useForm } from '@inertiajs/react';
import { clsx } from 'clsx';
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
            <form onSubmit={kirim} className="flex min-h-dvh flex-col bg-paper">
                <header className="border-b border-ink-200 bg-white pt-5 pb-4">
                    <div className="mx-auto w-full max-w-xl px-4 tablet:px-5">
                        <h1 className="text-judul-2 text-ink-900 desktop:text-judul-1">
                            Pilih meja hari ini
                        </h1>
                        <p className="text-teks text-ink-700">{tanggal}</p>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-4 tablet:px-5">
                    {form.errors.meja && (
                        <Banner varian="bahaya" className="mb-4">
                            {form.errors.meja}
                        </Banner>
                    )}

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
                                                'flex min-h-target-min cursor-pointer items-center gap-4 rounded-md bg-white px-4 py-3 shadow-1',
                                                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink-900',
                                                dipilih
                                                    ? 'border-2 border-ink-900'
                                                    : 'border border-ink-200',
                                            )}
                                        >
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
                                            />
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span className="text-judul-2 text-ink-900">
                                                    {item.tahap}
                                                </span>
                                                <span className="text-teks text-ink-700">
                                                    {ringkasAntrean(item)}
                                                </span>
                                            </span>
                                            <span
                                                aria-hidden="true"
                                                className={clsx(
                                                    'flex size-5 shrink-0 items-center justify-center rounded-pill border-2',
                                                    dipilih
                                                        ? 'border-ink-900'
                                                        : 'border-ink-400',
                                                )}
                                            >
                                                {dipilih && (
                                                    <span className="size-3 rounded-pill bg-ink-900" />
                                                )}
                                            </span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>

                    <KakiTombol denganNavigasi={false} className="mt-auto pt-5">
                        <Tombol
                            type="submit"
                            lebarPenuh
                            disabled={!mejaTerpilih}
                            memuat={form.processing}
                            teksMemuat="Membuka…"
                        >
                            {mejaTerpilih
                                ? `Mulai di Meja ${mejaTerpilih.nomor}`
                                : 'Pilih meja dulu'}
                        </Tombol>
                    </KakiTombol>
                </main>
            </form>
        </>
    );
}
