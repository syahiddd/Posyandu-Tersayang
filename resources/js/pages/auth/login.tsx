import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { Tombol } from '@/components/dasar/tombol';
import { store } from '@/routes/login';

type GalatIsian = { username?: string; password?: string };

/**
 * S01 Masuk (FR-01, DESIGN 6.1 Tabel 22): nama pengguna dan kata sandi,
 * tanpa daftar akun, tanpa login Google, tanpa lupa sandi via email.
 * Pesan gagal dari server bersifat umum dan tampil di bawah tombol.
 */
export default function Masuk() {
    const form = useForm({ username: '', password: '' });
    const [galatIsian, setGalatIsian] = useState<GalatIsian>({});
    const refUsername = useRef<HTMLInputElement>(null);
    const refPassword = useRef<HTMLInputElement>(null);

    const pesanUmum = form.errors.username ?? form.errors.password;

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const galat: GalatIsian = {
            username: form.data.username.trim()
                ? undefined
                : 'Isi nama pengguna.',
            password: form.data.password ? undefined : 'Isi kata sandi.',
        };
        setGalatIsian(galat);

        if (galat.username) {
            refUsername.current?.focus();

            return;
        }

        if (galat.password) {
            refPassword.current?.focus();

            return;
        }

        form.post(store.url(), {
            onError: () => form.reset('password'),
        });
    }

    return (
        <>
            <Head title="Masuk" />
            {/* Ponsel: mengalir dari atas dengan bantuan menempel di bawah.
                Tablet ke atas: satu kartu di tengah (DESIGN 3.6). */}
            <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-7 pb-4 tablet:max-w-[26rem] tablet:justify-center tablet:py-7">
                <div className="flex flex-1 flex-col tablet:flex-none tablet:rounded-lg tablet:border tablet:border-ink-200 tablet:bg-white tablet:p-6 tablet:shadow-1">
                    {/* Ilustrasi kartun ringan di awal layar: menyapa kader
                        dengan warna blush yang senada dengan logo. */}
                    <img
                        src="/images/login-bayi.svg"
                        alt=""
                        aria-hidden="true"
                        width={640}
                        height={220}
                        fetchPriority="high"
                        decoding="async"
                        className="mb-5 block w-full select-none tablet:mb-6"
                    />
                    <header className="flex items-center gap-4">
                        <img
                            src="/images/logo-posyandu-tersayang.svg"
                            alt=""
                            aria-hidden="true"
                            width={80}
                            height={80}
                            decoding="async"
                            className="size-16 shrink-0 tablet:size-20"
                        />
                        <div className="min-w-0">
                            <p
                                aria-hidden="true"
                                className="text-label-seksi tracking-[0.18em] text-brand-700 uppercase"
                            >
                                Posyandu
                            </p>
                            <h1 className="mt-1 text-display tracking-tight text-ink-900">
                                <span className="sr-only">Posyandu </span>
                                Tersayang
                            </h1>
                            <p className="mt-1 text-kecil text-ink-700">
                                Khusus kader posyandu
                            </p>
                        </div>
                    </header>

                    <form
                        noValidate
                        onSubmit={kirim}
                        className="mt-7 mb-6 flex flex-col gap-5 tablet:mt-6"
                    >
                        <IsianTeks
                            ref={refUsername}
                            label="Nama pengguna"
                            name="username"
                            autoComplete="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="next"
                            required
                            value={form.data.username}
                            onChange={(event) =>
                                form.setData('username', event.target.value)
                            }
                            galat={galatIsian.username}
                        />
                        <IsianTeks
                            ref={refPassword}
                            jenis="kata-sandi"
                            label="Kata sandi"
                            name="password"
                            autoComplete="current-password"
                            enterKeyHint="go"
                            required
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            galat={galatIsian.password}
                        />

                        <div className="mt-1 flex flex-col gap-3">
                            <Tombol
                                type="submit"
                                lebarPenuh
                                memuat={form.processing}
                                teksMemuat="Memeriksa…"
                            >
                                Masuk
                            </Tombol>
                            {pesanUmum && (
                                <p
                                    role="alert"
                                    className="text-teks font-bold text-status-bahaya-teks"
                                >
                                    {pesanUmum}
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Bantuan tetap, bukan status: kotak info tanpa garis kiri
                    seperti Gambar 3; di dalam kartu cukup garis pemisah. */}
                    <p className="mt-auto rounded-md bg-status-info-latar px-4 py-3 text-status-info-teks tablet:rounded-none tablet:border-t tablet:border-ink-200 tablet:bg-transparent tablet:px-0 tablet:pt-5 tablet:pb-0">
                        Akun dibuat oleh Ketua Kader. Lupa kata sandi? Minta
                        Ketua Kader mengatur ulang.
                    </p>
                </div>
            </main>
        </>
    );
}
