import { Head, useForm } from '@inertiajs/react';
import { Building2, CalendarDays, MapPin, Stethoscope } from 'lucide-react';
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

const ISIAN: {
    nama: keyof DataProfil;
    label: string;
    petunjuk?: string;
}[] = [
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
                            href={dataPosyandu()}
                            varian="tersier"
                            className="mb-1 -ml-2 text-brand-100 hover:text-white"
                        >
                            ‹ Kembali
                        </TombolTautan>
                        <p className="flex items-center gap-1.5 text-label-seksi tracking-[0.18em] text-brand-200 uppercase">
                            <Building2
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            Profil posyandu
                        </p>
                        <h1 className="mt-1.5 text-judul-1 text-white desktop:text-display">
                            Ubah profil posyandu
                        </h1>
                        <p className="mt-1 text-kecil text-brand-100">
                            Data ini tampil di kepala aplikasi dan rekap CSV.
                        </p>
                    </div>
                </header>

                <RingkasanGalat
                    galat={errors}
                    labelIsian={Object.fromEntries(
                        ISIAN.map(({ nama }) => [nama, `isian-${nama}`]),
                    )}
                />

                <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <Building2
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Identitas
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 px-3.5 py-3.5">
                        {ISIAN.slice(0, 1).map(({ nama, label, petunjuk }) => (
                            <IsianTeks
                                key={nama}
                                id={`isian-${nama}`}
                                name={nama}
                                label={label}
                                petunjuk={petunjuk}
                                wajib={nama === 'nama'}
                                value={data[nama]}
                                onChange={(event) =>
                                    setData(nama, event.target.value)
                                }
                                galat={errors[nama]}
                            />
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <MapPin
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Wilayah kerja
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 px-3.5 py-3.5">
                        {ISIAN.slice(1, 5).map(({ nama, label, petunjuk }) => (
                            <IsianTeks
                                key={nama}
                                id={`isian-${nama}`}
                                name={nama}
                                label={label}
                                petunjuk={petunjuk}
                                value={data[nama]}
                                onChange={(event) =>
                                    setData(nama, event.target.value)
                                }
                                galat={errors[nama]}
                            />
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
                    <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                            <CalendarDays
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2.4}
                            />
                        </span>
                        <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                            Alamat &amp; jadwal
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 px-3.5 py-3.5">
                        {ISIAN.slice(5).map(({ nama, label, petunjuk }) => (
                            <IsianTeks
                                key={nama}
                                id={`isian-${nama}`}
                                name={nama}
                                label={label}
                                petunjuk={petunjuk}
                                value={data[nama]}
                                onChange={(event) =>
                                    setData(nama, event.target.value)
                                }
                                galat={errors[nama]}
                            />
                        ))}
                        <p className="flex items-start gap-1.5 rounded-md bg-brand-50 px-2.5 py-2 text-keterangan text-ink-700">
                            <Stethoscope
                                aria-hidden="true"
                                className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                            />
                            Puskesmas pembina dipakai sebagai rujukan tindak
                            lanjut di Panduan KIA.
                        </p>
                    </div>
                </section>

                <KakiTombol>
                    <TombolTautan
                        href={dataPosyandu()}
                        varian="sekunder"
                        className="shrink-0"
                    >
                        Batal
                    </TombolTautan>
                    <Tombol type="submit" lebarPenuh memuat={form.processing}>
                        Simpan profil
                    </Tombol>
                </KakiTombol>
            </form>
        </>
    );
}
