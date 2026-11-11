import { usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { PanelAntrean } from '@/components/antrean/panel-antrean';
import type { AntreanMeja } from '@/components/antrean/panel-antrean';

/**
 * Tata letak layar meja (DESIGN bab 9, Gambar 10), di dalam
 * TataLetakAplikasi dan persisten antara layar antrean dan layar anak:
 *
 * - Ponsel dan tablet sempit: satu kolom; layar antrean menampilkan
 *   antrean, layar anak menampilkan formulir.
 * - Mulai 776 px (`panel:`): kolom antrean (320 px, 300 px di desktop)
 *   menempel di kiri dan dapat digulir sendiri; area detail di kanan.
 */
export default function TataLetakMeja({ children }: { children: ReactNode }) {
    const { component, props } = usePage<{
        antreanMeja: AntreanMeja;
        kunjunganAktif?: number;
    }>();
    const layarAnak = component.startsWith('kunjungan/');

    return (
        <div className="flex min-h-dvh flex-col panel:grid panel:grid-cols-[320px_minmax(0,1fr)] desktop:grid-cols-[300px_minmax(0,1fr)]">
            <aside
                aria-label={`Antrean Meja ${props.antreanMeja.nomor}`}
                className={clsx(
                    layarAnak ? 'hidden panel:flex' : 'flex',
                    'flex-col px-4 pt-5 pb-19 tablet:px-5 tablet:pb-5',
                    'panel:sticky panel:top-0 panel:h-dvh panel:overflow-y-auto panel:border-r panel:border-ink-200 panel:px-4',
                )}
            >
                <PanelAntrean
                    antreanMeja={props.antreanMeja}
                    kunjunganAktif={layarAnak ? props.kunjunganAktif : null}
                />
            </aside>
            <div
                className={clsx(
                    layarAnak ? 'flex' : 'hidden panel:flex',
                    'min-w-0 flex-col',
                )}
            >
                {children}
            </div>
        </div>
    );
}
