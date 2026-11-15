import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import type { AntreanMeja } from '@/components/antrean/panel-antrean';

type Props = { antreanMeja: AntreanMeja };

/**
 * S08 Antrean meja dan S13 Daftar Ditunda (PRD 3.2–3.3, FR-18, FR-47
 * sampai FR-49). Daftarnya digambar TataLetakMeja (kolom antrean); halaman
 * ini mengisi area detail di tablet lebar dan desktop sebelum anak dipilih
 * (DESIGN bab 9).
 */
export default function Antrean({ antreanMeja }: Props) {
    const { nomor, tersedia, antrean } = antreanMeja;
    const kosong = antrean.length === 0;

    return (
        <>
            <Head title={`Antrean Meja ${nomor}`} />
            <div className="flex flex-1 items-center justify-center px-6 py-10">
                <div className="relative isolate w-full max-w-md overflow-hidden rounded-lg border border-brand-100 bg-gradient-to-br from-white via-brand-50/80 to-brand-100 px-8 py-9 text-center shadow-1">
                    <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-300"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-pill bg-brand-200/50 blur-3xl"
                    />

                    <span
                        aria-hidden="true"
                        className="relative mx-auto flex size-16 items-center justify-center"
                    >
                        <span className="absolute inset-0 rounded-pill bg-brand-200/60 blur-md" />
                        <span className="relative flex size-14 items-center justify-center rounded-pill bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-2">
                            <ClipboardList
                                className="size-6"
                                strokeWidth={2.2}
                            />
                        </span>
                    </span>

                    <p className="mt-4 text-judul-2 text-brand-900">
                        {kosong
                            ? 'Antrean masih kosong'
                            : 'Pilih anak dari antrean'}
                    </p>
                    <p className="mt-1.5 text-teks leading-relaxed text-ink-600">
                        {tersedia
                            ? kosong
                                ? 'Anak dari meja sebelumnya akan muncul di kolom antrean secara otomatis.'
                                : 'Klik kartu anak di kolom antrean untuk mulai melayani.'
                            : `Layanan Meja ${nomor} dikerjakan pada fase berikutnya.`}
                    </p>
                </div>
            </div>
        </>
    );
}
