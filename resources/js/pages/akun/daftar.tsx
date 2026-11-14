import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { Dialog } from '@/components/dasar/dialog';
import { ChipStatus } from '@/components/dasar/chip-status';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Kartu } from '@/components/dasar/kartu';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { aturUlangSandi, status, tambah, ubah } from '@/routes/akun';
import type { AkunKader, PilihanMeja } from '@/types';

type Props = {
    akun: (AkunKader & {
        aktif: boolean;
        peran: string;
        diriSendiri: boolean;
    })[];
    daftarMeja: PilihanMeja[];
    sandiSementara: {
        judul: string;
        nama: string;
        username: string;
        sandi: string;
    } | null;
};

/**
 * S21 Pengaturan Akun (FR-02, DESIGN 5.10 dan 6.5): daftar akun dengan
 * status aktif; Atur ulang kata sandi dan Nonaktifkan pada setiap akun.
 * Kata sandi sementara tampil sekali untuk diberikan langsung kepada kader.
 */
export default function DaftarAkun({
    akun,
    daftarMeja,
    sandiSementara,
}: Props) {
    const { errors } = usePage().props;
    const galat = errors.aktif ?? errors.sandi;
    // Atur ulang tidak bisa dibatalkan, jadi dikonfirmasi dulu (DESIGN Prinsip 1).
    const [aturUlang, setAturUlang] = useState<Props['akun'][number] | null>(
        null,
    );
    const [mengatur, setMengatur] = useState(false);
    const labelMeja = (nomor: number | null) => {
        const meja = daftarMeja.find((satu) => satu.nomor === nomor);

        return meja ? `Meja ${meja.nomor} · ${meja.tahap}` : null;
    };

    return (
        <>
            <Head title="Pengaturan Akun" />
            <div className="flex flex-1 flex-col gap-5 desktop:max-w-2xl">
                <header>
                    <h1 className="text-judul-2 text-ink-900 desktop:text-judul-1">
                        Pengaturan Akun
                    </h1>
                    <p className="text-teks text-ink-700">{akun.length} akun</p>
                </header>

                {galat && <Banner varian="bahaya">{galat}</Banner>}

                {sandiSementara && (
                    <Banner varian="sukses" judul={sandiSementara.judul}>
                        <p>
                            Berikan langsung kepada {sandiSementara.nama}. Kata
                            sandi ini hanya tampil sekali.
                        </p>
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                            <dt>Nama pengguna</dt>
                            <dd className="font-bold">
                                {sandiSementara.username}
                            </dd>
                            <dt>Kata sandi</dt>
                            <dd className="font-mono text-judul-2 font-bold tracking-wide">
                                {sandiSementara.sandi}
                            </dd>
                        </dl>
                    </Banner>
                )}

                <ul className="flex flex-col gap-3">
                    {akun.map((satu) => (
                        <li key={satu.id}>
                            <Kartu>
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-judul-2 text-ink-900">
                                            {satu.nama}
                                        </p>
                                        <p className="text-kecil text-ink-700">
                                            {satu.username} · {satu.peran}
                                            {satu.diriSendiri && ' · Anda'}
                                        </p>
                                    </div>
                                    <ChipStatus varian="info">
                                        {satu.aktif ? 'Aktif' : 'Nonaktif'}
                                    </ChipStatus>
                                </div>
                                <p className="mt-1 text-kecil text-ink-700">
                                    {[
                                        satu.noHp ?? 'Nomor HP belum diisi',
                                        labelMeja(satu.mejaBiasa),
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <TombolTautan
                                        href={ubah(satu.id)}
                                        varian="sekunder"
                                    >
                                        Ubah
                                    </TombolTautan>
                                    {!satu.diriSendiri && satu.aktif && (
                                        <Tombol
                                            varian="sekunder"
                                            onClick={() => setAturUlang(satu)}
                                        >
                                            Atur ulang kata sandi
                                        </Tombol>
                                    )}
                                    {!satu.diriSendiri && (
                                        <Tombol
                                            varian={
                                                satu.aktif
                                                    ? 'bahaya'
                                                    : 'sekunder'
                                            }
                                            onClick={() =>
                                                router.put(
                                                    status.url(satu.id),
                                                    { aktif: !satu.aktif },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            {satu.aktif
                                                ? 'Nonaktifkan'
                                                : 'Aktifkan lagi'}
                                        </Tombol>
                                    )}
                                </div>
                            </Kartu>
                        </li>
                    ))}
                </ul>

                <KakiTombol>
                    <TombolTautan href={tambah()} lebarPenuh>
                        Tambah kader
                    </TombolTautan>
                </KakiTombol>

                <Dialog
                    terbuka={aturUlang !== null}
                    onTutup={() => setAturUlang(null)}
                    judul={`Atur ulang kata sandi ${aturUlang?.nama ?? ''}?`}
                    labelBahaya="Atur ulang kata sandi"
                    memuat={mengatur}
                    teksMemuat="Mengatur ulang…"
                    onKonfirmasi={() => {
                        if (aturUlang === null) {
                            return;
                        }

                        router.post(
                            aturUlangSandi.url(aturUlang.id),
                            {},
                            {
                                preserveScroll: false,
                                onStart: () => setMengatur(true),
                                onFinish: () => {
                                    setMengatur(false);
                                    setAturUlang(null);
                                },
                            },
                        );
                    }}
                >
                    <p>
                        Kata sandi lama langsung tidak berlaku dan tidak dapat
                        dikembalikan. Kata sandi sementara tampil sekali untuk
                        Anda berikan kepada {aturUlang?.nama}.
                    </p>
                </Dialog>
            </div>
        </>
    );
}
