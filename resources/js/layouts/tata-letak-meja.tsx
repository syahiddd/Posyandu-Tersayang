import { router, usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
import { Fragment, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PanelAntrean } from '@/components/antrean/panel-antrean';
import type { AntreanMeja } from '@/components/antrean/panel-antrean';
import { Dialog } from '@/components/dasar/dialog';
import { KonteksLayarAnak } from '@/hooks/use-layar-anak';
import type { InfoLayarAnak } from '@/hooks/use-layar-anak';
import { lepas, tunda } from '@/routes/kunjungan';
import type { KartuAntrean } from '@/types';

/**
 * Tata letak layar meja (DESIGN bab 9, Gambar 10), di dalam
 * TataLetakAplikasi dan persisten antara layar antrean dan layar anak:
 *
 * - Ponsel dan tablet sempit: satu kolom; layar antrean menampilkan
 *   antrean, layar anak menampilkan formulir.
 * - Mulai 776 px (`panel:`): kolom antrean (320 px, 300 px di desktop)
 *   menempel di kiri dan dapat digulir sendiri; area detail di kanan.
 *
 * Mengetuk anak lain di kolom saat seorang anak terbuka: tanpa perubahan
 * isian anak sekarang dilepas; dengan perubahan kader ditanya dulu, lalu
 * anak sekarang ditunda beserta drafnya (keputusan pemilik produk).
 */
export default function TataLetakMeja({ children }: { children: ReactNode }) {
    const { component, props } = usePage<{
        antreanMeja: AntreanMeja;
        kunjunganAktif?: number;
    }>();
    const layarAnak = component.startsWith('kunjungan/');
    const kunjunganAktif = layarAnak ? (props.kunjunganAktif ?? null) : null;
    const infoLayar = useRef<InfoLayarAnak | null>(null);
    const [tujuan, setTujuan] = useState<KartuAntrean | null>(null);
    const [memuat, setMemuat] = useState(false);

    const anakSekarang = props.antreanMeja.antrean.find(
        (anak) => anak.id === kunjunganAktif,
    );

    function pilih(anak: KartuAntrean) {
        if (kunjunganAktif === null) {
            return;
        }

        if (!infoLayar.current?.adaPerubahan()) {
            router.post(lepas.url(kunjunganAktif), { buka: anak.id });

            return;
        }

        setTujuan(anak);
    }

    function tundaLaluBuka() {
        if (kunjunganAktif === null || tujuan === null) {
            return;
        }

        router.post(
            tunda.url(kunjunganAktif),
            {
                draf: (infoLayar.current?.draf() ?? {}) as never,
                buka: tujuan.id,
            },
            {
                onStart: () => setMemuat(true),
                onFinish: () => {
                    setMemuat(false);
                    setTujuan(null);
                },
            },
        );
    }

    return (
        <KonteksLayarAnak.Provider value={infoLayar}>
            <div className="flex flex-1 flex-col panel:grid panel:grid-cols-[320px_minmax(0,1fr)] desktop:grid-cols-[300px_minmax(0,1fr)]">
                <aside
                    aria-label={`Antrean Meja ${props.antreanMeja.nomor}`}
                    className={clsx(
                        layarAnak ? 'hidden panel:flex' : 'flex',
                        'flex-col px-4 pt-5 pb-19 tablet:px-5 tablet:pb-5',
                        'panel:sticky panel:top-14 panel:h-[calc(100dvh-3.5rem)] panel:overflow-y-auto panel:border-r panel:border-ink-200 panel:px-4 desktop:top-16 desktop:h-[calc(100dvh-4rem)]',
                    )}
                >
                    <PanelAntrean
                        antreanMeja={props.antreanMeja}
                        kunjunganAktif={kunjunganAktif}
                        onPilih={layarAnak ? pilih : undefined}
                    />
                </aside>
                <div
                    className={clsx(
                        layarAnak ? 'flex' : 'hidden panel:flex',
                        'min-w-0 flex-col',
                    )}
                >
                    {/* Kunci per kunjungan: pindah anak dari kolom antrean
                        memasang ulang halaman sehingga isian anak sebelumnya
                        tidak terbawa ke anak berikutnya (FR-47, FR-48). */}
                    <Fragment key={kunjunganAktif ?? 'antrean'}>
                        {children}
                    </Fragment>
                </div>
            </div>

            <Dialog
                terbuka={tujuan !== null}
                onTutup={() => setTujuan(null)}
                judul={`Tunda ${anakSekarang?.nama ?? 'anak ini'}?`}
                labelBahaya={`Tunda lalu buka ${tujuan?.nama.split(' ')[0] ?? ''}`}
                varianKonfirmasi="utama"
                memuat={memuat}
                teksMemuat="Memindahkan…"
                onKonfirmasi={tundaLaluBuka}
            >
                <p>
                    Isian {anakSekarang?.nama ?? 'anak ini'} belum disimpan.
                    Isian disimpan sebagai draf dan anak masuk daftar Ditunda,
                    lalu {tujuan?.nama} dibuka.
                </p>
            </Dialog>
        </KonteksLayarAnak.Provider>
    );
}
