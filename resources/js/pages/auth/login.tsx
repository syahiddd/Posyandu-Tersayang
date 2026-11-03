import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { LencanaMeja } from '@/components/dasar/lencana-meja';
import { Tombol } from '@/components/dasar/tombol';
import { store } from '@/routes/login';

type GalatIsian = { username?: string; password?: string };

/**
 * S01 Masuk (FR-01, DESIGN 6.1 Tabel 22): nama pengguna dan kata sandi,
 * tanpa daftar akun, tanpa login Google, tanpa lupa sandi via email.
 * Pesan gagal dari server bersifat umum dan tampil di bawah tombol.
 */
export default function Masuk() {
    const { name } = usePage<{ name: string }>().props;
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
            <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-7 pb-4 tablet:justify-center tablet:pb-7">
                <header className="flex items-center gap-4">
                    <LencanaMeja nomor="1–5" denganLabel />
                    <div>
                        <h1 className="text-judul-1 text-ink-900">{name}</h1>
                        <p className="text-teks text-ink-700">
                            Khusus kader posyandu
                        </p>
                    </div>
                </header>

                <form
                    noValidate
                    onSubmit={kirim}
                    className="mt-7 flex flex-col gap-5"
                >
                    <IsianTeks
                        ref={refUsername}
                        label="Nama pengguna"
                        name="username"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
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
                        required
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                        galat={galatIsian.password}
                    />

                    <div className="mt-2 flex flex-col gap-3">
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

                <Banner varian="info" className="mt-auto tablet:mt-7">
                    Akun dibuat oleh Ketua Kader. Lupa kata sandi? Minta Ketua
                    Kader mengatur ulang.
                </Banner>
            </main>
        </>
    );
}
