import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KartuHasilAnak } from '@/components/dasar/kartu-hasil-anak';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { formatUmurTahunBulan } from '@/lib/umur';
import { meja } from '@/routes';
import { kirim } from '@/routes/meja1';
import type { RingkasanAnak } from '@/types';

/**
 * S07 Anak Tersimpan (FR-13): Lanjutkan ke Meja 2 membuka kunjungan hari
 * ini; Kembali ke awal menyimpan data tanpa membuka kunjungan.
 */
export default function AnakTersimpan({ anak }: { anak: RingkasanAnak }) {
    const { errors } = usePage().props;
    const [mengirim, setMengirim] = useState(false);

    return (
        <>
            <Head title={anak.nama} />
            <div className="toast-di-atas-kaki flex min-h-dvh flex-col bg-paper">
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`${anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · ${formatUmurTahunBulan(anak.umurBulan)}`}
                    jenisKelamin={anak.jenisKelamin}
                    meja={1}
                    kembali={meja(1)}
                    kembaliLewatPost={false}
                />
                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-5 tablet:px-5">
                    {errors.kunjungan ? (
                        <Banner varian="bahaya">{errors.kunjungan}</Banner>
                    ) : anak.sudahDiAntrean ? (
                        <Banner varian="info" judul="Sudah di antrean hari ini">
                            Anak ini sudah masuk antrean dan tidak bisa dikirim
                            dua kali.
                        </Banner>
                    ) : (
                        <Banner varian="sukses" judul="Data anak tersimpan">
                            Kirim ke Meja 2 untuk diukur, atau kembali ke awal
                            bila anak belum siap.
                        </Banner>
                    )}

                    <KartuHasilAnak anak={anak} />

                    <KakiTombol denganNavigasi={false}>
                        <TombolTautan
                            href={meja(1)}
                            varian="sekunder"
                            lebarPenuh={anak.sudahDiAntrean}
                            className="shrink-0"
                        >
                            Kembali ke awal
                        </TombolTautan>
                        {!anak.sudahDiAntrean && (
                            <Tombol
                                lebarPenuh
                                memuat={mengirim}
                                teksMemuat="Mengirim…"
                                onClick={() =>
                                    router.post(
                                        kirim.url(anak.id),
                                        {},
                                        {
                                            onStart: () => setMengirim(true),
                                            onFinish: () => setMengirim(false),
                                        },
                                    )
                                }
                            >
                                Lanjutkan ke Meja 2
                            </Tombol>
                        )}
                    </KakiTombol>
                </main>
            </div>
        </>
    );
}
