import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Bidang,
    deskripsiIsian,
    kelasBingkai,
} from '@/components/dasar/bidang';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
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
                className="flex flex-1 flex-col gap-5 desktop:max-w-2xl"
            >
                <header>
                    <TombolTautan
                        href={pengaturanAkun()}
                        varian="tersier"
                        className="-ml-2"
                    >
                        ‹ Kembali
                    </TombolTautan>
                    <h1 className="text-judul-1 text-ink-900">{judul}</h1>
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

                <IsianTeks
                    label="Nama"
                    wajib
                    autoComplete="off"
                    {...teks('name')}
                />
                <IsianTeks
                    label="Nama pengguna"
                    wajib
                    petunjuk="Huruf kecil, angka, titik, atau garis bawah"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    {...teks('username')}
                />
                {baru && (
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
                )}
                <IsianTeks
                    jenis="telepon"
                    label="Nomor HP"
                    petunjuk="Diawali 08 atau +62"
                    inputMode="tel"
                    {...teks('no_hp')}
                />
                <Bidang
                    id="isian-meja_biasa"
                    label="Meja yang biasa dipegang"
                    galat={errors.meja_biasa}
                >
                    <select
                        id="isian-meja_biasa"
                        name="meja_biasa"
                        value={data.meja_biasa}
                        onChange={(event) =>
                            setData('meja_biasa', event.target.value)
                        }
                        aria-invalid={errors.meja_biasa ? true : undefined}
                        aria-describedby={deskripsiIsian('isian-meja_biasa', {
                            galat: errors.meja_biasa,
                        })}
                        className={`${kelasBingkai({ galat: errors.meja_biasa })} h-control-h px-4 text-teks`}
                    >
                        <option value="">Belum ditentukan</option>
                        {daftarMeja.map((meja) => (
                            <option key={meja.nomor} value={meja.nomor}>
                                Meja {meja.nomor} · {meja.tahap}
                            </option>
                        ))}
                    </select>
                </Bidang>

                <KakiTombol>
                    <Tombol type="submit" lebarPenuh memuat={form.processing}>
                        {baru ? 'Simpan akun' : 'Simpan perubahan'}
                    </Tombol>
                </KakiTombol>
            </form>
        </>
    );
}
