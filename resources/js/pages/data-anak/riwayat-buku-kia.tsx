import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import {
    Bidang,
    deskripsiIsian,
    kelasBingkai,
} from '@/components/dasar/bidang';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { IsianAngka } from '@/components/dasar/isian-angka';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Kartu } from '@/components/dasar/kartu';
import { KontrolSegmen } from '@/components/dasar/kontrol-segmen';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol } from '@/components/dasar/tombol';
import { formatDesimal } from '@/lib/desimal';
import { formatUmurTahunBulan } from '@/lib/umur';
import { detail } from '@/routes/data-anak';
import { simpan } from '@/routes/riwayat-buku-kia';
import type { JenisKelamin, RiwayatLayanan, RiwayatPengukuran } from '@/types';

type JenisEntri = 'imunisasi' | 'pengukuran' | 'vitamin_obat';

type Props = {
    anak: {
        id: number;
        nama: string;
        jenisKelamin: JenisKelamin;
        umurBulan: number;
        tanggalLahir: string;
    };
    hariIni: string;
    daftarVaksin: {
        kode: string;
        nama: string;
        umurBulan: number;
        sudahTercatat: boolean;
    }[];
    daftarVitaminObat: {
        kode: string;
        nama: string;
        umurMin: number;
        umurMaks: number | null;
    }[];
    layanan: RiwayatLayanan[];
    pengukuran: RiwayatPengukuran[];
};

type DataEntri = {
    jenis: JenisEntri;
    tanggal: string;
    vaksin: string;
    layanan: string;
    bb: string;
    pb_tb: string;
    lila: string;
    lk: string;
};

/** Isian ukur dan kunci nilainya di riwayat pengukuran. */
const UKUR = [
    { kolom: 'bb', kunci: 'bb', label: 'Berat badan', satuan: 'kg' },
    {
        kolom: 'pb_tb',
        kunci: 'pbTb',
        label: 'Panjang/tinggi badan',
        satuan: 'cm',
    },
    {
        kolom: 'lila',
        kunci: 'lila',
        label: 'Lingkar lengan atas',
        satuan: 'cm',
    },
    { kolom: 'lk', kunci: 'lk', label: 'Lingkar kepala', satuan: 'cm' },
] as const;

function ringkasUkur(ukur: RiwayatPengukuran): string {
    return UKUR.flatMap(({ kunci, satuan }) => {
        const nilai = ukur[kunci];

        return nilai === null
            ? []
            : [`${formatDesimal(Number(nilai))} ${satuan}`];
    }).join(', ');
}

function labelUmur(umur: number): string {
    return umur === 0 ? '0–24 jam' : `${umur} bulan`;
}

/**
 * S17 Tambah Riwayat dari Buku KIA (FR-64 sampai FR-66, DESIGN 5.9 dan
 * 6.5): pilih Imunisasi, Pengukuran, atau Vitamin A dan obat cacing; isi
 * tanggal dan nilai; simpan lalu ulangi. Entri bertanda "Dari Buku KIA".
 */
export default function RiwayatBukuKia({
    anak,
    hariIni,
    daftarVaksin,
    daftarVitaminObat,
    layanan,
    pengukuran,
}: Props) {
    const { errors: galatHalaman } = usePage().props;
    const form = useForm<DataEntri>({
        jenis: 'imunisasi',
        tanggal: '',
        vaksin: '',
        layanan: '',
        bb: '',
        pb_tb: '',
        lila: '',
        lk: '',
    });
    const { data, setData, errors } = form;

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(simpan.url(anak.id), {
            preserveScroll: true,
            onSuccess: () =>
                form.reset('vaksin', 'layanan', 'bb', 'pb_tb', 'lila', 'lk'),
        });
    }

    const opsiVitaminObat = daftarVitaminObat.map((satu) => ({
        nilai: satu.kode,
        label: satu.kode,
    }));
    const vitaminObatTerpilih = daftarVitaminObat.find(
        (satu) => satu.kode === data.layanan,
    );

    return (
        <>
            <Head title={`Riwayat Buku KIA ${anak.nama}`} />
            <form
                noValidate
                onSubmit={kirim}
                className="toast-di-atas-kaki flex min-h-dvh flex-col bg-paper"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`Tambah dari Buku KIA · ${formatUmurTahunBulan(anak.umurBulan)}`}
                    jenisKelamin={anak.jenisKelamin}
                    kembali={detail(anak.id)}
                    kembaliLewatPost={false}
                />

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 pt-5 tablet:px-5">
                    {galatHalaman.urungan && (
                        <Banner varian="bahaya">{galatHalaman.urungan}</Banner>
                    )}

                    <RingkasanGalat
                        galat={errors}
                        labelIsian={{
                            tanggal: 'isian-tanggal',
                            vaksin: 'isian-vaksin',
                            layanan: 'isian-layanan',
                            bb: 'isian-bb',
                            pb_tb: 'isian-pb_tb',
                            lila: 'isian-lila',
                            lk: 'isian-lk',
                        }}
                    />

                    <KontrolSegmen<JenisEntri>
                        label="Jenis riwayat"
                        nama="jenis"
                        nilai={data.jenis}
                        onUbah={(jenis) => {
                            form.clearErrors();
                            setData('jenis', jenis);
                        }}
                        opsi={[
                            { nilai: 'imunisasi', label: 'Imunisasi' },
                            { nilai: 'pengukuran', label: 'Pengukuran' },
                            {
                                nilai: 'vitamin_obat',
                                label: 'Vitamin A, obat cacing',
                            },
                        ]}
                    />

                    {data.jenis === 'imunisasi' && (
                        <Bidang
                            id="isian-vaksin"
                            label="Vaksin"
                            wajib
                            petunjuk="Urut sesuai jadwal Buku KIA. Dosis yang sudah tercatat tidak dapat dipilih."
                            galat={errors.vaksin}
                        >
                            <select
                                id="isian-vaksin"
                                name="vaksin"
                                value={data.vaksin}
                                onChange={(event) =>
                                    setData('vaksin', event.target.value)
                                }
                                aria-required
                                aria-invalid={errors.vaksin ? true : undefined}
                                aria-describedby={deskripsiIsian(
                                    'isian-vaksin',
                                    {
                                        petunjuk: true,
                                        galat: errors.vaksin,
                                    },
                                )}
                                className={`${kelasBingkai({ galat: errors.vaksin })} h-control-h px-4 text-teks`}
                            >
                                <option value="">Pilih vaksin</option>
                                {daftarVaksin.map((vaksin) => (
                                    <option
                                        key={vaksin.kode}
                                        value={vaksin.kode}
                                        disabled={vaksin.sudahTercatat}
                                    >
                                        {vaksin.nama} ·{' '}
                                        {labelUmur(vaksin.umurBulan)}
                                        {vaksin.sudahTercatat
                                            ? ' · sudah tercatat'
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        </Bidang>
                    )}

                    {data.jenis === 'vitamin_obat' && (
                        <div className="flex flex-col gap-1">
                            <KontrolSegmen
                                id="isian-layanan"
                                label="Layanan"
                                nama="layanan"
                                wajib
                                nilai={data.layanan || null}
                                onUbah={(nilai) => setData('layanan', nilai)}
                                opsi={opsiVitaminObat}
                                galat={errors.layanan}
                            />
                            {vitaminObatTerpilih && (
                                <p className="text-keterangan text-ink-600">
                                    {vitaminObatTerpilih.nama}, umur{' '}
                                    {vitaminObatTerpilih.umurMaks === null
                                        ? `${vitaminObatTerpilih.umurMin} bulan ke atas`
                                        : `${vitaminObatTerpilih.umurMin}–${vitaminObatTerpilih.umurMaks} bulan`}
                                </p>
                            )}
                        </div>
                    )}

                    <IsianTeks
                        id="isian-tanggal"
                        jenis="tanggal"
                        label={
                            data.jenis === 'pengukuran'
                                ? 'Tanggal pengukuran'
                                : 'Tanggal pemberian'
                        }
                        wajib
                        min={anak.tanggalLahir}
                        max={hariIni}
                        name="tanggal"
                        value={data.tanggal}
                        onChange={(event) =>
                            setData('tanggal', event.target.value)
                        }
                        galat={errors.tanggal}
                    />

                    {data.jenis === 'pengukuran' &&
                        UKUR.map(({ kolom, label, satuan }) => (
                            <IsianAngka
                                key={kolom}
                                id={`isian-${kolom}`}
                                name={kolom}
                                label={label}
                                satuan={satuan}
                                nilai={data[kolom]}
                                onUbah={(nilai) => setData(kolom, nilai)}
                                galat={errors[kolom]}
                            />
                        ))}

                    <Kartu labelSeksi="Sudah dimasukkan dari Buku KIA">
                        {layanan.length === 0 && pengukuran.length === 0 ? (
                            <p className="py-2 text-teks text-ink-700">
                                Belum ada.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {layanan.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-label-seksi text-ink-600 uppercase">
                                            Layanan
                                        </p>
                                        <ul className="divide-y divide-ink-200">
                                            {layanan.map((satu) => (
                                                <li
                                                    key={`layanan-${satu.id}`}
                                                    className="flex flex-wrap justify-between gap-x-4 py-3"
                                                >
                                                    <span className="text-teks text-ink-900">
                                                        <span className="font-bold">
                                                            {satu.jenis}
                                                        </span>{' '}
                                                        · {satu.detail}
                                                    </span>
                                                    <span className="text-kecil text-ink-700">
                                                        {satu.tanggal}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {pengukuran.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-label-seksi text-ink-600 uppercase">
                                            Pengukuran
                                        </p>
                                        <ul className="divide-y divide-ink-200">
                                            {pengukuran.map((satu) => (
                                                <li
                                                    key={`ukur-${satu.id}`}
                                                    className="flex flex-wrap justify-between gap-x-4 py-3"
                                                >
                                                    <span className="text-teks text-ink-900">
                                                        <span className="font-bold">
                                                            Pengukuran
                                                        </span>{' '}
                                                        · {ringkasUkur(satu)}
                                                    </span>
                                                    <span className="text-kecil text-ink-700">
                                                        {satu.tanggal}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </Kartu>

                    <KakiTombol denganNavigasi={false}>
                        <Tombol
                            type="submit"
                            lebarPenuh
                            memuat={form.processing}
                        >
                            Simpan entri
                        </Tombol>
                    </KakiTombol>
                </main>
            </form>
        </>
    );
}
