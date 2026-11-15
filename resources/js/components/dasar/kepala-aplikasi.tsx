import { HeartPulse } from 'lucide-react';

/**
 * Kepala aplikasi: bilah merek plum bergradien yang menempel di atas konten,
 * berisi nama aplikasi dan meja yang sedang dipegang. Mengikuti acuan
 * prototipe "Posya App"; makna data Posyandu tidak berubah.
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
        <header className="sticky top-0 isolate z-30 overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-brand-600 text-white shadow-2">
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 right-8 size-44 rounded-pill bg-brand-300/15 blur-2xl"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 left-1/3 size-36 rounded-pill bg-brand-600/30 blur-2xl"
            />

            <div className="relative flex h-14 items-center gap-3 px-4 tablet:px-5 desktop:h-16 desktop:px-6">
                <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-gradient-to-br from-white/25 to-white/5 shadow-1"
                >
                    <HeartPulse className="size-5" />
                </span>
                <p className="min-w-0 flex-1 truncate text-teks font-bold">
                    {judul}
                </p>
                {mejaNomor !== undefined && (
                    <span className="shrink-0 rounded-pill border border-white/15 bg-white/10 px-3 py-1 text-kecil font-bold backdrop-blur-sm">
                        Meja {mejaNomor}
                    </span>
                )}
            </div>
        </header>
    );
}
