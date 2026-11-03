import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { IsianIdentitasAnak } from '@/components/isian-identitas-anak';
import type { DataIdentitasAnak } from '@/components/isian-identitas-anak';
import { detail, perbarui } from '@/routes/data-anak';

type Props = {
    anak: DataIdentitasAnak & { id: number };
    hariIni: string;
    daftarDusun: string[];
};

/**
 * S16 Ubah Data Anak (FR-52, DESIGN 6.5): memperbaiki identitas, orang tua,
 * dan alamat. Setiap perubahan dicatat di log aktivitas (NFR-06).
 */
export default function UbahDataAnak({ anak, hariIni, daftarDusun }: Props) {
    const { id, ...awal } = anak;
    const form = useForm<DataIdentitasAnak>(awal);
    const { data, setData, errors } = form;

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(perbarui.url(id), { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Ubah data ${anak.nama}`} />
            <form
                noValidate
                onSubmit={kirim}
                className="flex min-h-dvh flex-col bg-paper [--offset-toast:96px]"
            >
                <HeaderAnak
                    nama={`Ubah data ${anak.nama}`}
                    keterangan={
                        data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
                    }
                    jenisKelamin={data.jenis_kelamin || null}
                    kembali={detail(id)}
                    kembaliLewatPost={false}
                />

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-5 tablet:px-5">
                    <RingkasanGalat
                        galat={errors}
                        labelIsian={Object.fromEntries(
                            Object.keys(data).map((nama) => [
                                nama,
                                `isian-${nama}`,
                            ]),
                        )}
                    />

                    <IsianIdentitasAnak
                        data={data}
                        ubah={(nama, nilai) => setData(nama, nilai)}
                        galat={errors}
                        hariIni={hariIni}
                        daftarDusun={daftarDusun}
                    />

                    <KakiTombol denganNavigasi={false}>
                        <TombolTautan
                            href={detail(id)}
                            varian="sekunder"
                            className="shrink-0"
                        >
                            Batal
                        </TombolTautan>
                        <Tombol
                            type="submit"
                            lebarPenuh
                            memuat={form.processing}
                        >
                            Simpan perubahan
                        </Tombol>
                    </KakiTombol>
                </main>
            </form>
        </>
    );
}
