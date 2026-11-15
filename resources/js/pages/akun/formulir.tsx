import { Head, useForm } from '@inertiajs/react';
import { ClipboardList, KeyRound, UserPlus, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { Bidang } from '@/components/dasar/bidang';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { PilihanTarik } from '@/components/dasar/pilihan-tarik';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { pengaturanAkun } from '@/routes';
import { perbarui, simpan } from '@/routes/akun';
import type { AkunKader, PilihanMeja } from '@/types';

type Props = {
    akun: AkunKader | null;
    usulanSandi: string | null;
    daftarMeja: PilihanMeja[];
};

type DataAkun = {
    name: string;
    username: string;
    password: string;
    no_hp: string;
    meja_biasa: string;
};

/**
 * Tambah kader dan Ubah data kader (FR-02, FR-60; DESIGN 5.10): nama, nama
 * pengguna, kata sandi awal (hanya saat tambah), nomor HP, dan meja yang
 * biasa dipegang. Kata sandi awal diisi usulan acak yang boleh diganti.
 *
 * Isian dikelompokkan menjadi tiga kartu (identitas, kata sandi, penempatan)
 * agar mudah dipindai; meja memakai pilihan tarik-turun aplikasi, bukan
 * `<select>` bawaan peramban, supaya warnanya seragam.
 */
export default function FormulirAkun({ akun, usulanSandi, daftarMeja }: Props) {
    const baru = akun === null;
    const form = useForm<DataAkun>({
        name: akun?.nama ?? '',
        username: akun?.username ?? '',
        password: usulanSandi ?? '',
        no_hp: akun?.noHp ?? '',
        meja_biasa: akun?.mejaBiasa ? String(akun.mejaBiasa) : '',
    });
    const { data, setData, errors } = form;

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (baru) {
            form.post(simpan.url());
        } else {
            // Kata sandi diabaikan server saat mengubah data (FR-02).
            form.put(perbarui.url(akun.id));
        }
    }

    const teks = (nama: keyof DataAkun) => ({
        id: `isian-${nama}`,
        name: nama,
        value: data[nama],
        onChange: (event: { target: { value: string } }) =>
            setData(nama, event.target.value),
        galat: errors[nama],
    });

    const judul = baru ? 'Tambah kader' : `Ubah data ${akun.nama}`;

    return (
        <>
            <Head title={judul} />
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
                            href={pengaturanAkun()}
                            varian="tersier"
                            className="mb-1 -ml-2 text-brand-100 hover:text-white"
                        >
                            ‹ Kembali
                        </TombolTautan>
                        <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                            <UserPlus aria-hidden="true" className="size-3.5" />
                            {baru ? 'Akun baru' : 'Ubah akun'}
                        </p>
                        <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                            {judul}
                        </h1>
                        <p className="mt-1 text-kecil text-brand-100">
                            {baru
                                ? 'Kata sandi awal tampil sekali setelah akun disimpan.'
                                : 'Kata sandi tidak berubah lewat formulir ini.'}
                        </p>
                    </div>
                </header>

                <RingkasanGalat
                    galat={errors}
                    labelIsian={Object.fromEntries(
                        Object.keys(data).map((nama) => [
                            nama,
                            `isian-${nama}`,
                        ]),
                    )}
                />

                <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <UserRound
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Identitas kader
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 px-3.5 py-3.5">
                        <IsianTeks
                            label="Nama"
                            wajib
                            autoComplete="off"
                            {...teks('name')}
                        />
                        <IsianTeks
                            label="Nama pengguna"
                            wajib
                            petunjuk="Huruf kecil, angka, titik, atau garis bawah. Dipakai untuk masuk."
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            {...teks('username')}
                        />
                        <IsianTeks
                            jenis="telepon"
                            label="Nomor HP"
                            petunjuk="Diawali 08 atau +62"
                            inputMode="tel"
                            autoComplete="tel"
                            {...teks('no_hp')}
                        />
                    </div>
                </section>

                {baru && (
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
                                Kata sandi awal
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4 px-3.5 py-3.5">
                            <IsianTeks
                                label="Kata sandi awal"
                                wajib
                                petunjuk="Boleh diganti. Kader dapat menggantinya sendiri setelah masuk."
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                className="[&_input]:font-mono"
                                {...teks('password')}
                            />
                        </div>
                    </section>
                )}

                <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <ClipboardList
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Penempatan meja
                        </h2>
                    </div>

                    <div className="px-3.5 py-3.5">
                        <Bidang
                            id="isian-meja_biasa"
                            label="Meja yang biasa dipegang"
                            petunjuk="Dipakai di Data Posyandu dan saat membagi tugas."
                            galat={errors.meja_biasa}
                        >
                            <PilihanTarik
                                id="isian-meja_biasa"
                                label="Meja yang biasa dipegang"
                                nilai={data.meja_biasa || null}
                                labelKosong="Belum ditentukan"
                                onUbah={(nilai) =>
                                    setData('meja_biasa', nilai ?? '')
                                }
                                opsi={daftarMeja.map((meja) => ({
                                    nilai: String(meja.nomor),
                                    label: `Meja ${meja.nomor} · ${meja.tahap}`,
                                }))}
                            />
                        </Bidang>
                    </div>
                </section>

                <KakiTombol>
                    <TombolTautan
                        href={pengaturanAkun()}
                        varian="sekunder"
                        className="shrink-0"
                    >
                        Batal
                    </TombolTautan>
                    <Tombol type="submit" lebarPenuh memuat={form.processing}>
                        {baru ? 'Simpan akun' : 'Simpan perubahan'}
                    </Tombol>
                </KakiTombol>
            </form>
        </>
    );
}
