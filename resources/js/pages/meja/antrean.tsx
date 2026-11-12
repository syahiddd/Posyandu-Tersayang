import { Head } from '@inertiajs/react';
import type { AntreanMeja } from '@/components/antrean/panel-antrean';

type Props = { antreanMeja: AntreanMeja };

/**
 * S08 Antrean meja dan S13 Daftar Ditunda (PRD 3.2–3.3, FR-18, FR-47
 * sampai FR-49). Daftarnya digambar TataLetakMeja (kolom antrean); halaman
 * ini mengisi area detail di tablet lebar dan desktop sebelum anak dipilih
 * (DESIGN bab 9).
 */
export default function Antrean({ antreanMeja }: Props) {
    const { nomor, antrean } = antreanMeja;

    return (
        <>
            <Head title={`Antrean Meja ${nomor}`} />
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-7 text-center">
                <p className="text-judul-2 text-ink-900">
                    {antrean.length === 0
                        ? 'Belum ada anak di antrean'
                        : 'Pilih anak dari antrean untuk mulai'}
                </p>
                <p className="max-w-sm text-teks text-ink-700">
                    Data anak tampil di sini. Antrean di kiri diperbarui
                    otomatis.
                </p>
            </div>
        </>
    );
}
