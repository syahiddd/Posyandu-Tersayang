import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Info, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KartuHasilAnak } from '@/components/dasar/kartu-hasil-anak';
import { Seksi } from '@/components/dasar/seksi';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { formatUmurTahunBulan } from '@/lib/umur';
import { meja } from '@/routes';
import { kirim } from '@/routes/meja1';
import type { RingkasanAnak } from '@/types';

/**
 * S07 Anak Tersimpan (FR-13): Lanjutkan ke Meja 2 membuka kunjungan hari
 * ini; Kembali ke awal menyimpan data tanpa membuka kunjungan.
 *
 * Kartu anak dipakai ulang agar tampilannya sama dengan hasil pencarian
 * Meja 1, lalu ditambah panduan singkat langkah berikutnya.
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
                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 tablet:px-5">
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

                    <Seksi
                        judul="Data anak tersimpan"
                        ikon={CheckCircle2}
                        isiClassName="px-3.5 py-3"
                    >
                        <KartuHasilAnak anak={anak} redupDiAntrean={false} />
                    </Seksi>

                    <Seksi
                        judul="Langkah berikutnya"
                        ikon={ListChecks}
                        isiClassName="px-3.5 py-3"
                    >
                        <ol className="flex flex-col gap-2">
                            <li className="flex items-start gap-2 text-kecil leading-relaxed text-ink-700">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-brand-700 text-keterangan font-bold text-white">
                                    1
                                </span>
                                <span className="text-justify">
                                    Tekan{' '}
                                    <span className="font-bold text-ink-900">
                                        Lanjutkan ke Meja 2
                                    </span>{' '}
                                    agar anak masuk antrean pengukuran.
                                </span>
                            </li>
                            <li className="flex items-start gap-2 text-kecil leading-relaxed text-ink-700">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-brand-700 text-keterangan font-bold text-white">
                                    2
                                </span>
                                <span className="text-justify">
                                    Di Meja 2, ukur berat badan dan
                                    panjang/tinggi badan anak.
                                </span>
                            </li>
                            <li className="flex items-start gap-2 text-kecil leading-relaxed text-ink-700">
                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-brand-700 text-keterangan font-bold text-white">
                                    3
                                </span>
                                <span className="text-justify">
                                    Bila anak belum siap diukur, pilih{' '}
                                    <span className="font-bold text-ink-900">
                                        Kembali ke awal
                                    </span>
                                    . Data tetap tersimpan.
                                </span>
                            </li>
                        </ol>

                        <p className="mt-3 flex items-start gap-2 rounded-md bg-brand-50 px-2.5 py-2 text-keterangan leading-relaxed text-ink-700">
                            <Info
                                aria-hidden="true"
                                className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                            />
                            <span className="text-justify">
                                Anak yang sudah masuk antrean tidak dapat
                                dikirim ulang pada hari yang sama.
                            </span>
                        </p>
                    </Seksi>

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
