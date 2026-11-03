import { Head, router } from '@inertiajs/react';
import { Banner } from '@/components/dasar/banner';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Tombol } from '@/components/dasar/tombol';
import { formatUmurBulan } from '@/lib/umur';
import { lepas, tunda } from '@/routes/kunjungan';
import type { HeaderKunjungan } from '@/types';

/**
 * Layar sementara untuk meja yang isiannya belum dikerjakan. Anak tetap
 * terkunci untuk kader ini dan dapat ditunda atau dilepas ke antrean.
 */
export default function LayarSementara({
    anak,
    tahap,
}: {
    anak: HeaderKunjungan;
    tahap: string;
}) {
    return (
        <>
            <Head title={anak.nama} />
            <div className="flex min-h-dvh flex-col bg-paper [--offset-toast:96px]">
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`${anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · ${formatUmurBulan(anak.umurBulan)} · Antrean #${String(anak.nomorAntrean).padStart(2, '0')}`}
                    jenisKelamin={anak.jenisKelamin}
                    meja={anak.meja}
                    kembali={lepas(anak.id)}
                />
                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-5 tablet:px-5">
                    <Banner varian="info" judul="Belum tersedia">
                        Isian Meja {anak.meja} ({tahap}) dikerjakan pada fase
                        berikutnya.
                    </Banner>
                    <KakiTombol denganNavigasi={false}>
                        <Tombol
                            varian="sekunder"
                            lebarPenuh
                            onClick={() => router.post(tunda.url(anak.id))}
                        >
                            Tunda
                        </Tombol>
                    </KakiTombol>
                </main>
            </div>
        </>
    );
}
