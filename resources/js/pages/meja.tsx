import { Head } from '@inertiajs/react';
import { Banner } from '@/components/dasar/banner';
import { LencanaMeja } from '@/components/dasar/lencana-meja';

/**
 * Layar meja sementara (Fase 1). Antrean dan isian Meja 1–5 (PRD 4.3
 * sampai 4.7) dikerjakan pada fase berikutnya.
 */
export default function Meja({
    nomor,
    tahap,
}: {
    nomor: number;
    tahap: string;
}) {
    return (
        <>
            <Head title={`Meja ${nomor}`} />
            <div className="flex flex-col gap-5 desktop:max-w-2xl">
                <header className="flex items-center gap-4">
                    <LencanaMeja nomor={nomor} denganLabel />
                    <h1 className="text-judul-1 text-ink-900">{tahap}</h1>
                </header>
                <Banner varian="info" judul="Belum tersedia">
                    Layar Meja {nomor} ({tahap}) dikerjakan pada fase
                    berikutnya.
                </Banner>
            </div>
        </>
    );
}
