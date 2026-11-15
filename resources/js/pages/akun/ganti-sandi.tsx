import { Head, useForm } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    Check,
    Eye,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { lainnya } from '@/routes';
import { update } from '@/routes/ganti-sandi';

type DataSandi = {
    sandi_lama: string;
    sandi_baru: string;
    sandi_baru_confirmation: string;
};

/** Syarat kata sandi yang diperiksa di layar agar kader tahu sebelum simpan. */
const SYARAT = [
    { kunci: 'panjang', label: 'Minimal 8 karakter' },
    { kunci: 'huruf', label: 'Mengandung huruf' },
    { kunci: 'angka', label: 'Mengandung angka' },
] as const;

/** Kader mengganti kata sandinya sendiri (FR-02; keputusan pemilik produk). */
export default function GantiSandi() {
    const form = useForm<DataSandi>({
        sandi_lama: '',
        sandi_baru: '',
        sandi_baru_confirmation: '',
    });
    const { data, setData, errors } = form;

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url(), {
            onError: () => form.reset(),
        });
    }

    const sandi = (nama: keyof DataSandi, autoComplete: string) => ({
        id: `isian-${nama}`,
        name: nama,
        jenis: 'kata-sandi' as const,
        autoComplete,
        value: data[nama],
        onChange: (event: { target: { value: string } }) =>
            setData(nama, event.target.value),
        galat: errors[nama],
    });

    const terpenuhi = {
        panjang: data.sandi_baru.length >= 8,
        huruf: /[a-zA-Z]/.test(data.sandi_baru),
        angka: /[0-9]/.test(data.sandi_baru),
    };

    const cocok =
        data.sandi_baru_confirmation !== '' &&
        data.sandi_baru === data.sandi_baru_confirmation;

    const beda =
        data.sandi_baru_confirmation !== '' &&
        data.sandi_baru !== data.sandi_baru_confirmation;

    return (
        <>
            <Head title="Ganti kata sandi" />
            <form
                noValidate
                onSubmit={kirim}
                className="flex flex-1 flex-col gap-4 desktop:max-w-2xl"
            >
                <header className="relative isolate overflow-hidden rounded-lg bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 pt-4 pb-4 text-white shadow-2 tablet:px-5">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-14 -right-10 size-40 rounded-pill bg-brand-300/20 blur-3xl"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-16 -left-12 size-36 rounded-pill bg-brand-600/30 blur-3xl"
                    />

                    <div className="relative">
                        <TombolTautan
                            href={lainnya()}
                            varian="tersier"
                            className="mb-1 -ml-2 text-brand-100 hover:text-white"
                        >
                            ‹ Kembali
                        </TombolTautan>
                        <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                            <LockKeyhole
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            Keamanan akun
                        </p>
                        <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                            Ganti kata sandi
                        </h1>
                        <p className="mt-1 text-kecil text-brand-100">
                            Ganti kata sandi sementara dari Ketua Kader dengan
                            kata sandi pilihan Anda sendiri.
                        </p>
                    </div>
                </header>

                <RingkasanGalat
                    galat={errors}
                    labelIsian={{
                        sandi_lama: 'isian-sandi_lama',
                        sandi_baru: 'isian-sandi_baru',
                        sandi_baru_confirmation:
                            'isian-sandi_baru_confirmation',
                    }}
                />

                <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <KeyRound
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Kata sandi
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 px-3.5 py-3.5">
                        <IsianTeks
                            label="Kata sandi lama"
                            wajib
                            petunjuk="Kata sandi yang dipakai untuk masuk saat ini."
                            {...sandi('sandi_lama', 'current-password')}
                        />

                        <div className="border-t border-brand-100 pt-3.5">
                            <IsianTeks
                                label="Kata sandi baru"
                                wajib
                                petunjuk="Buat kata sandi yang mudah Anda ingat, tetapi sulit ditebak orang lain."
                                {...sandi('sandi_baru', 'new-password')}
                            />
                        </div>

                        <ul
                            aria-label="Syarat kata sandi"
                            className="flex flex-wrap gap-1.5"
                        >
                            {SYARAT.map(({ kunci, label }) => {
                                const lulus = terpenuhi[kunci];

                                return (
                                    <li
                                        key={kunci}
                                        className={clsx(
                                            'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-keterangan font-bold transition-colors',
                                            lulus
                                                ? 'border-status-normal-teks/30 bg-status-normal-latar text-status-normal-teks'
                                                : 'border-brand-100 bg-brand-50 text-ink-600',
                                        )}
                                    >
                                        <Check
                                            aria-hidden="true"
                                            className={clsx(
                                                'size-3',
                                                lulus
                                                    ? 'opacity-100'
                                                    : 'opacity-30',
                                            )}
                                            strokeWidth={3}
                                        />
                                        {label}
                                    </li>
                                );
                            })}
                        </ul>

                        <IsianTeks
                            label="Ulangi kata sandi baru"
                            wajib
                            {...sandi(
                                'sandi_baru_confirmation',
                                'new-password',
                            )}
                        />

                        {cocok && (
                            <p
                                role="status"
                                className="flex items-center gap-1.5 text-keterangan font-bold text-status-normal-teks"
                            >
                                <Check
                                    aria-hidden="true"
                                    className="size-3.5"
                                    strokeWidth={3}
                                />
                                Kedua kata sandi sama.
                            </p>
                        )}
                        {beda && (
                            <p
                                role="status"
                                className="flex items-center gap-1.5 text-keterangan font-bold text-status-waspada-teks"
                            >
                                <Eye aria-hidden="true" className="size-3.5" />
                                Ulangi kata sandi belum sama.
                            </p>
                        )}
                    </div>
                </section>

                <section className="flex gap-2.5 rounded-md border border-l-5 border-brand-200 bg-brand-50 px-3.5 py-3">
                    <ShieldCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-brand-700"
                    />
                    <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-kecil font-bold text-brand-900">
                            <Sparkles
                                aria-hidden="true"
                                className="size-3.5 text-brand-600"
                            />
                            Jaga kerahasiaan kata sandi
                        </p>
                        <p className="mt-0.5 text-keterangan leading-relaxed [text-wrap:pretty] text-ink-700 tablet:text-justify">
                            Jangan bagikan kata sandi kepada siapa pun, termasuk
                            sesama kader. Setelah diganti, gunakan kata sandi
                            baru saat masuk berikutnya.
                        </p>
                    </div>
                </section>

                <KakiTombol>
                    <TombolTautan
                        href={lainnya()}
                        varian="sekunder"
                        className="shrink-0"
                    >
                        Batal
                    </TombolTautan>
                    <Tombol type="submit" lebarPenuh memuat={form.processing}>
                        Simpan kata sandi
                    </Tombol>
                </KakiTombol>
            </form>
        </>
    );
}
