import { Head } from '@inertiajs/react';
import { Banner } from '@/components/dasar/banner';

/**
 * Halaman sementara untuk menu yang dikerjakan pada fase berikutnya
 * (Data Anak, Rekap Imunisasi, Data Posyandu, Pengaturan Akun).
 */
export default function HalamanSementara({
    judul,
    rujukan,
}: {
    judul: string;
    rujukan: string;
}) {
    return (
        <>
            <Head title={judul} />
            <div className="flex flex-col gap-5 desktop:max-w-2xl">
                <h1 className="text-judul-1 text-ink-900">{judul}</h1>
                <Banner varian="info" judul="Belum tersedia">
                    Halaman ini dikerjakan pada fase berikutnya sesuai {rujukan}
                    .
                </Banner>
            </div>
        </>
    );
}
