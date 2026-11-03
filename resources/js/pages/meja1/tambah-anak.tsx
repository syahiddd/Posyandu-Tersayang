import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { IsianAngka } from '@/components/dasar/isian-angka';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KartuHasilAnak } from '@/components/dasar/kartu-hasil-anak';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import {
    IDENTITAS_KOSONG,
    IsianIdentitasAnak,
} from '@/components/isian-identitas-anak';
import type { DataIdentitasAnak } from '@/components/isian-identitas-anak';
import { meja } from '@/routes';
import { anak as halamanAnak, simpan } from '@/routes/meja1';
import type { RingkasanAnak } from '@/types';

type Props = {
    hariIni: string;
    daftarDusun: string[];
    anakSamaNik: RingkasanAnak | null;
    kemiripan: RingkasanAnak[];
};

type DataAnak = DataIdentitasAnak & {
    ukur_tanggal: string;
    ukur_bb: string;
    ukur_pb_tb: string;
    ukur_lila: string;
    ukur_lk: string;
    abaikan_kemiripan: boolean;
};

const ISIAN_UKUR = [
    'ukur_tanggal',
    'ukur_bb',
    'ukur_pb_tb',
    'ukur_lila',
    'ukur_lk',
];

/**
 * S05 Tambah Anak (FR-10 sampai FR-12, FR-67; DESIGN 5.2): satu halaman
 * dengan empat seksi; ukuran terakhir dari Buku KIA terlipat.
 */
export default function TambahAnak({
    hariIni,
    daftarDusun,
    anakSamaNik,
    kemiripan,
}: Props) {
    const form = useForm<DataAnak>({
        ...IDENTITAS_KOSONG,
        ukur_tanggal: '',
        ukur_bb: '',
        ukur_pb_tb: '',
        ukur_lila: '',
        ukur_lk: '',
        abaikan_kemiripan: false,
    });
    const { data, setData, errors } = form;
    const adaGalatUkur = ISIAN_UKUR.some(
        (nama) => errors[nama as keyof DataAnak],
    );

    function kirim(event?: FormEvent<HTMLFormElement>, abaikan = false) {
        event?.preventDefault();
        form.transform((isi) => ({ ...isi, abaikan_kemiripan: abaikan }));
        form.post(simpan.url(), { preserveScroll: true });
    }

    const teks = (nama: keyof DataAnak) => ({
        id: `isian-${nama}`,
        name: nama,
        value: String(data[nama]),
        onChange: (event: { target: { value: string } }) =>
            setData(nama, event.target.value),
        galat: errors[nama],
    });

    const angka = (nama: keyof DataAnak) => ({
        id: `isian-${nama}`,
        name: nama,
        nilai: String(data[nama]),
        onUbah: (nilai: string) => setData(nama, nilai),
        galat: errors[nama],
    });

    const labelIsian = Object.fromEntries(
        Object.keys(data).map((nama) => [nama, `isian-${nama}`]),
    );

    return (
        <>
            <Head title="Tambah anak baru" />
            <form
                noValidate
                onSubmit={(event) => kirim(event)}
                className="flex min-h-dvh flex-col bg-paper [--offset-toast:96px]"
            >
                <HeaderAnak
                    nama="Tambah anak baru"
                    keterangan={
                        data.jenis_kelamin === 'L'
                            ? 'Laki-laki'
                            : data.jenis_kelamin === 'P'
                              ? 'Perempuan'
                              : 'Meja 1 · Pendaftaran'
                    }
                    jenisKelamin={data.jenis_kelamin || null}
                    meja={1}
                    kembali={meja(1)}
                    kembaliLewatPost={false}
                />

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-5 tablet:px-5">
                    <RingkasanGalat galat={errors} labelIsian={labelIsian} />

                    {anakSamaNik && (
                        <Banner varian="bahaya" judul="NIK sudah terdaftar">
                            <div className="mt-2 flex flex-col gap-3 text-ink-900">
                                <KartuHasilAnak anak={anakSamaNik} />
                                <TombolTautan
                                    href={halamanAnak(anakSamaNik.id)}
                                    varian="sekunder"
                                    lebarPenuh
                                >
                                    Pakai data ini
                                </TombolTautan>
                            </div>
                        </Banner>
                    )}

                    {kemiripan.length > 0 && (
                        <Banner
                            varian="peringatan"
                            judul="Kemungkinan data ganda"
                        >
                            <p>
                                Sudah ada anak dengan nama, tanggal lahir, dan
                                nama ibu yang sama.
                            </p>
                            <ul className="mt-3 flex flex-col gap-3 text-ink-900">
                                {kemiripan.map((anak) => (
                                    <li
                                        key={anak.id}
                                        className="flex flex-col gap-2"
                                    >
                                        <KartuHasilAnak anak={anak} />
                                        <TombolTautan
                                            href={halamanAnak(anak.id)}
                                            varian="sekunder"
                                            lebarPenuh
                                        >
                                            Pakai data ini
                                        </TombolTautan>
                                    </li>
                                ))}
                            </ul>
                            <Tombol
                                varian="tersier"
                                className="mt-2"
                                onClick={() => kirim(undefined, true)}
                            >
                                Tetap simpan sebagai anak baru
                            </Tombol>
                        </Banner>
                    )}

                    <IsianIdentitasAnak
                        data={data}
                        ubah={(nama, nilai) => setData(nama, nilai)}
                        galat={errors}
                        hariIni={hariIni}
                        daftarDusun={daftarDusun}
                    />

                    <details
                        open={adaGalatUkur || undefined}
                        className="rounded-md border border-ink-200 bg-white px-4 shadow-1"
                    >
                        <summary className="flex min-h-target-min cursor-pointer items-center text-teks font-bold text-ink-900">
                            Ukuran terakhir dari Buku KIA (opsional)
                        </summary>
                        <div className="flex flex-col gap-4 pt-2 pb-4">
                            <p className="text-kecil text-ink-700">
                                Dipakai sebagai pembanding pada kunjungan
                                pertama.
                            </p>
                            <IsianTeks
                                jenis="tanggal"
                                label="Tanggal pengukuran"
                                max={hariIni}
                                {...teks('ukur_tanggal')}
                            />
                            <IsianAngka
                                label="Berat badan"
                                satuan="kg"
                                {...angka('ukur_bb')}
                            />
                            <IsianAngka
                                label="Panjang/tinggi badan"
                                satuan="cm"
                                {...angka('ukur_pb_tb')}
                            />
                            <IsianAngka
                                label="Lingkar lengan atas"
                                satuan="cm"
                                {...angka('ukur_lila')}
                            />
                            <IsianAngka
                                label="Lingkar kepala"
                                satuan="cm"
                                {...angka('ukur_lk')}
                            />
                        </div>
                    </details>

                    <KakiTombol denganNavigasi={false}>
                        <TombolTautan
                            href={meja(1)}
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
                            Simpan data
                        </Tombol>
                    </KakiTombol>
                </main>
            </form>
        </>
    );
}
