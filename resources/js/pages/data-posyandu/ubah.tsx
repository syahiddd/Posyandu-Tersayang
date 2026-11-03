import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { dataPosyandu } from '@/routes';
import { perbarui } from '@/routes/data-posyandu';

type DataProfil = {
    nama: string;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
    puskesmas_pembina: string;
    alamat: string;
    jadwal_kegiatan: string;
};

const ISIAN: { nama: keyof DataProfil; label: string; petunjuk?: string }[] = [
    { nama: 'nama', label: 'Nama posyandu' },
    { nama: 'desa_kelurahan', label: 'Desa atau kelurahan' },
    { nama: 'kecamatan', label: 'Kecamatan' },
    { nama: 'kabupaten_kota', label: 'Kabupaten atau kota' },
    { nama: 'puskesmas_pembina', label: 'Puskesmas pembina' },
    { nama: 'alamat', label: 'Alamat' },
    {
        nama: 'jadwal_kegiatan',
        label: 'Jadwal kegiatan',
        petunjuk: 'Contoh: setiap tanggal 5, pukul 08.00',
    },
];

/** Ubah profil posyandu, khusus Ketua Kader (FR-59). */
export default function UbahProfilPosyandu({ profil }: { profil: DataProfil }) {
    const form = useForm<DataProfil>(profil);
    const { data, setData, errors } = form;

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(perbarui.url());
    }

    return (
        <>
            <Head title="Ubah profil posyandu" />
            <form
                noValidate
                onSubmit={kirim}
                className="flex flex-1 flex-col gap-5 desktop:max-w-2xl"
            >
                <header>
                    <TombolTautan
                        href={dataPosyandu()}
                        varian="tersier"
                        className="-ml-2"
                    >
                        ‹ Kembali
                    </TombolTautan>
                    <h1 className="text-judul-1 text-ink-900">
                        Ubah profil posyandu
                    </h1>
                </header>

                <RingkasanGalat
                    galat={errors}
                    labelIsian={Object.fromEntries(
                        ISIAN.map(({ nama }) => [nama, `isian-${nama}`]),
                    )}
                />

                {ISIAN.map(({ nama, label, petunjuk }) => (
                    <IsianTeks
                        key={nama}
                        id={`isian-${nama}`}
                        name={nama}
                        label={label}
                        petunjuk={petunjuk}
                        wajib={nama === 'nama'}
                        value={data[nama]}
                        onChange={(event) => setData(nama, event.target.value)}
                        galat={errors[nama]}
                    />
                ))}

                <KakiTombol>
                    <Tombol type="submit" lebarPenuh memuat={form.processing}>
                        Simpan profil
                    </Tombol>
                </KakiTombol>
            </form>
        </>
    );
}
