import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Kartu } from '@/components/dasar/kartu';
import { KartuHasilAnak } from '@/components/dasar/kartu-hasil-anak';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { dataAnak } from '@/routes';
import { pulihkan } from '@/routes/data-anak';
import type { RingkasanAnak } from '@/types';

type AnakTerhapus = RingkasanAnak & {
    dihapusPada: string;
    dihapusOleh: string | null;
    sisaHari: number;
};

/**
 * Data anak terhapus (FR-53; keputusan pemilik produk: dibuka dari Data
 * Anak, khusus Ketua Kader). Dapat dipulihkan sebelum 30 hari, lalu
 * terhapus permanen.
 */
export default function DataAnakTerhapus({ anak }: { anak: AnakTerhapus[] }) {
    const [memulihkan, setMemulihkan] = useState<number | null>(null);

    function pulihkanAnak(id: number) {
        setMemulihkan(id);
        router.post(
            pulihkan.url(id),
            {},
            { onFinish: () => setMemulihkan(null) },
        );
    }

    return (
        <>
            <Head title="Data anak terhapus" />
            <div className="flex flex-col gap-4 desktop:max-w-3xl">
                <header>
                    <TombolTautan
                        href={dataAnak()}
                        varian="tersier"
                        className="-ml-2"
                    >
                        ‹ Kembali
                    </TombolTautan>
                    <h1 className="text-judul-1 text-ink-900">
                        Data anak terhapus
                    </h1>
                    <p className="text-teks text-ink-700">
                        Dapat dipulihkan sebelum 30 hari. Setelah itu data
                        terhapus permanen beserta riwayatnya.
                    </p>
                </header>

                {anak.length === 0 ? (
                    <p className="text-teks text-ink-700">
                        Tidak ada data anak yang terhapus.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {anak.map((satu) => (
                            <li key={satu.id}>
                                <Kartu className="flex flex-col gap-3">
                                    <KartuHasilAnak
                                        anak={satu}
                                        redupDiAntrean={false}
                                    />
                                    <p className="text-kecil text-ink-700">
                                        Dihapus {satu.dihapusPada}
                                        {satu.dihapusOleh &&
                                            ` oleh ${satu.dihapusOleh}`}
                                        {' · '}
                                        <span className="font-bold text-ink-900">
                                            {satu.sisaHari === 0
                                                ? 'Terhapus permanen malam ini'
                                                : `Sisa ${satu.sisaHari} hari`}
                                        </span>
                                    </p>
                                    <Tombol
                                        varian="sekunder"
                                        className="self-start"
                                        memuat={memulihkan === satu.id}
                                        teksMemuat="Memulihkan…"
                                        onClick={() => pulihkanAnak(satu.id)}
                                    >
                                        Pulihkan {satu.nama}
                                    </Tombol>
                                </Kartu>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
