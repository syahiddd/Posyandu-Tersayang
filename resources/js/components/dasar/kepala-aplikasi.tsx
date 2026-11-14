import { HeartPulse } from 'lucide-react';

/**
 * Kepala aplikasi: bilah merek plum yang menempel di atas konten, berisi
 * nama aplikasi dan meja yang sedang dipegang. Mengikuti acuan prototipe
 * "Posya App"; makna data Posyandu tidak berubah.
 */
export function KepalaAplikasi({
    judul,
    mejaNomor,
}: {
    judul: string;
    /** Nomor meja yang sedang dipegang, bila kader sudah memilih meja. */
    mejaNomor?: number;
}) {
    return (
        <header className="sticky top-0 z-30 bg-brand-700 text-white shadow-2">
            <div className="flex h-14 items-center gap-3 px-4 tablet:px-5 desktop:h-16 desktop:px-6">
                <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/15"
                >
                    <HeartPulse className="size-5" />
                </span>
                <p className="min-w-0 flex-1 truncate text-teks font-bold">
                    {judul}
                </p>
                {mejaNomor !== undefined && (
                    <span className="shrink-0 rounded-pill bg-white/15 px-3 py-1 text-kecil font-bold">
                        Meja {mejaNomor}
                    </span>
                )}
            </div>
        </header>
    );
}
