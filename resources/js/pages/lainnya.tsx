import { Head, Link, usePage } from '@inertiajs/react';
import { Kartu } from '@/components/dasar/kartu';
import {
    dataPosyandu,
    logout,
    pengaturanAkun,
    pilihMeja,
    rekapImunisasi,
} from '@/routes';

const kelasBaris =
    'flex min-h-target-min w-full cursor-pointer items-center py-2 text-left text-teks font-bold text-ink-900 underline underline-offset-4';

/**
 * S20 Lainnya (DESIGN Tabel 11): Rekap Imunisasi, Data Posyandu, Pengaturan
 * Akun (Ketua Kader), Ganti Meja, Keluar (FR-05).
 */
export default function Lainnya() {
    const { auth, bolehKelolaAkun, mejaAktif } = usePage().props;

    return (
        <>
            <Head title="Lainnya" />
            <div className="flex flex-col gap-5 desktop:max-w-2xl">
                <header>
                    <h1 className="text-judul-1 text-ink-900">Lainnya</h1>
                    {auth.user && (
                        <p className="text-teks text-ink-700">
                            Masuk sebagai {auth.user.name}
                            {mejaAktif && ` · Meja ${mejaAktif.nomor}`}
                        </p>
                    )}
                </header>

                <Kartu labelSeksi="Menu">
                    <ul className="divide-y divide-ink-200">
                        <li>
                            <Link
                                href={rekapImunisasi()}
                                className={kelasBaris}
                            >
                                Rekapitulasi Imunisasi
                            </Link>
                        </li>
                        <li>
                            <Link href={dataPosyandu()} className={kelasBaris}>
                                Data Posyandu
                            </Link>
                        </li>
                        {bolehKelolaAkun && (
                            <li>
                                <Link
                                    href={pengaturanAkun()}
                                    className={kelasBaris}
                                >
                                    Pengaturan Akun
                                </Link>
                            </li>
                        )}
                    </ul>
                </Kartu>

                <Kartu labelSeksi="Sesi">
                    <ul className="divide-y divide-ink-200">
                        <li>
                            <Link href={pilihMeja()} className={kelasBaris}>
                                Ganti meja
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={logout()}
                                as="button"
                                className={kelasBaris}
                            >
                                Keluar
                            </Link>
                        </li>
                    </ul>
                </Kartu>
            </div>
        </>
    );
}
