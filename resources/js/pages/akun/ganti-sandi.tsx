import { Head, useForm } from '@inertiajs/react';
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

    return (
        <>
            <Head title="Ganti kata sandi" />
            <form
                noValidate
                onSubmit={kirim}
                className="flex flex-1 flex-col gap-5 desktop:max-w-2xl"
            >
                <header>
                    <TombolTautan
                        href={lainnya()}
                        varian="tersier"
                        className="-ml-2"
                    >
                        ‹ Kembali
                    </TombolTautan>
                    <h1 className="text-judul-1 text-ink-900">
                        Ganti kata sandi
                    </h1>
                </header>

                <RingkasanGalat
                    galat={errors}
                    labelIsian={{
                        sandi_lama: 'isian-sandi_lama',
                        sandi_baru: 'isian-sandi_baru',
                    }}
                />

                <IsianTeks
                    label="Kata sandi lama"
                    wajib
                    {...sandi('sandi_lama', 'current-password')}
                />
                <IsianTeks
                    label="Kata sandi baru"
                    wajib
                    {...sandi('sandi_baru', 'new-password')}
                />
                <IsianTeks
                    label="Ulangi kata sandi baru"
                    wajib
                    {...sandi('sandi_baru_confirmation', 'new-password')}
                />

                <KakiTombol>
                    <Tombol type="submit" lebarPenuh memuat={form.processing}>
                        Simpan kata sandi
                    </Tombol>
                </KakiTombol>
            </form>
        </>
    );
}
