import { Head } from '@inertiajs/react';
import { Kartu } from '@/components/dasar/kartu';
import { TombolTautan } from '@/components/dasar/tombol';
import { ubah } from '@/routes/data-posyandu';

export type ProfilPosyandu = {
    nama: string | null;
    desa_kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    puskesmas_pembina: string | null;
    alamat: string | null;
    jadwal_kegiatan: string | null;
};

type Props = {
    profil: ProfilPosyandu;
    bolehUbah: boolean;
    kader: {
        id: number;
        nama: string;
        peran: string;
        noHp: string | null;
        mejaBiasa: string | null;
    }[];
};

const BARIS_PROFIL: { kunci: keyof ProfilPosyandu; label: string }[] = [
    { kunci: 'desa_kelurahan', label: 'Desa/kelurahan' },
    { kunci: 'kecamatan', label: 'Kecamatan' },
    { kunci: 'kabupaten_kota', label: 'Kabupaten/kota' },
    { kunci: 'puskesmas_pembina', label: 'Puskesmas pembina' },
    { kunci: 'alamat', label: 'Alamat' },
    { kunci: 'jadwal_kegiatan', label: 'Jadwal kegiatan' },
];

/**
 * S19 Data Posyandu (DESIGN 6.5): kartu profil (FR-59) dan daftar kader
 * dengan nomor HP dan meja yang biasa dipegang (FR-60). Profil diubah oleh
 * Ketua Kader.
 */
export default function DataPosyandu({ profil, bolehUbah, kader }: Props) {
    return (
        <>
            <Head title="Data Posyandu" />
            <div className="flex flex-col gap-4 desktop:max-w-3xl">
                <header>
                    <h1 className="text-judul-1 text-ink-900">Data Posyandu</h1>
                </header>

                <Kartu judul={profil.nama ?? 'Profil posyandu belum diisi'}>
                    <dl className="divide-y divide-ink-200">
                        {BARIS_PROFIL.map(({ kunci, label }) => (
                            <div
                                key={kunci}
                                className="flex flex-col gap-0.5 py-3 tablet:flex-row tablet:justify-between tablet:gap-4"
                            >
                                <dt className="text-kecil text-ink-700">
                                    {label}
                                </dt>
                                <dd className="text-teks font-bold text-ink-900 tablet:text-right">
                                    {profil[kunci] || '—'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    {bolehUbah && (
                        <TombolTautan
                            href={ubah()}
                            varian="sekunder"
                            className="mt-2"
                        >
                            Ubah profil
                        </TombolTautan>
                    )}
                </Kartu>

                <Kartu labelSeksi={`Kader (${kader.length})`}>
                    <ul className="divide-y divide-ink-200">
                        {kader.map((satu) => (
                            <li
                                key={satu.id}
                                className="flex flex-col gap-0.5 py-3"
                            >
                                <span className="text-teks font-bold text-ink-900">
                                    {satu.nama}
                                    {satu.peran !== 'Kader' && (
                                        <span className="font-normal text-ink-700">
                                            {' '}
                                            · {satu.peran}
                                        </span>
                                    )}
                                </span>
                                <span className="text-kecil text-ink-700">
                                    {satu.noHp ? (
                                        <a
                                            href={`tel:${satu.noHp}`}
                                            className="underline underline-offset-4"
                                        >
                                            {satu.noHp}
                                        </a>
                                    ) : (
                                        'Nomor HP belum diisi'
                                    )}
                                    {satu.mejaBiasa &&
                                        ` · Biasa di ${satu.mejaBiasa}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Kartu>
            </div>
        </>
    );
}
