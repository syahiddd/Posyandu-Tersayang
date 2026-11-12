import { useState } from 'react';
import { Kartu } from '@/components/dasar/kartu';
import { Tab } from '@/components/dasar/tab';
import { GrafikPertumbuhan } from '@/components/grafik-pertumbuhan';
import type { DataGrafik, IndeksGrafik } from '@/lib/grafik';
import type { JenisKelamin } from '@/types';

/** Props grafik dari server (App\Gizi\GrafikPertumbuhan::daftar). */
export type PropsGrafik = {
    jenisKelamin: JenisKelamin;
    tabAwal: IndeksGrafik;
    pakaiPanjang: boolean;
    daftar: Record<IndeksGrafik, DataGrafik>;
};

/**
 * Kartu grafik pertumbuhan dengan tab KMS, BB/U, PB/U atau TB/U, BB/PB atau
 * BB/TB, IMT/U, dan LK (DESIGN 7.1, Tabel 29). Label PB atau TB mengikuti
 * umur anak. Dipakai Meja 5 dan tab Grafik Detail Anak.
 */
export function KartuGrafik({ grafik }: { grafik: PropsGrafik }) {
    const [tab, setTab] = useState<IndeksGrafik>(grafik.tabAwal);

    const item: { id: IndeksGrafik; label: string }[] = [
        { id: 'kms', label: 'KMS' },
        { id: 'bb_u', label: 'BB/U' },
        { id: 'pb_tb_u', label: grafik.pakaiPanjang ? 'PB/U' : 'TB/U' },
        { id: 'bb_pb_tb', label: grafik.pakaiPanjang ? 'BB/PB' : 'BB/TB' },
        { id: 'imt_u', label: 'IMT/U' },
        { id: 'lk_u', label: 'LK' },
    ];

    return (
        <Kartu aria-label="Grafik pertumbuhan" className="flex flex-col gap-3">
            <Tab
                label="Jenis grafik"
                item={item}
                aktif={tab}
                onUbah={setTab}
                className="-mx-4"
            />
            <div
                id={`panel-${tab}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab}`}
            >
                <p className="mb-2 text-kecil font-bold text-ink-900">
                    {grafik.daftar[tab].judul}
                </p>
                <GrafikPertumbuhan
                    data={grafik.daftar[tab]}
                    indeks={tab}
                    jenisKelamin={grafik.jenisKelamin}
                />
            </div>
        </Kartu>
    );
}
