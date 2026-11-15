import { clsx } from 'clsx';

/**
 * Lencana meja (DESIGN bab 7, Prinsip 3): nomor meja adalah penanda utama,
 * bukan warna. Dua varian disediakan agar selalu kontras dengan latarnya:
 * "plum" (gradien merek) untuk latar terang, "terang" (krem) untuk latar
 * gradien plum. Besar 44 px, kecil 34 px.
 */
type PropsLencanaMeja = {
    /** Nomor meja 1–5, atau "1–5" untuk identitas aplikasi. */
    nomor: number | string;
    ukuran?: 'besar' | 'kecil';
    /** Menampilkan tulisan kecil "MEJA" di atas nomor (ukuran besar). */
    denganLabel?: boolean;
    /** Kontras terhadap latar: plum untuk latar terang, terang untuk latar plum. */
    varian?: 'plum' | 'terang';
    className?: string;
};

export function LencanaMeja({
    nomor,
    ukuran = 'besar',
    denganLabel = false,
    varian = 'plum',
    className,
}: PropsLencanaMeja) {
    const besar = ukuran === 'besar';

    return (
        <span
            className={clsx(
                'inline-flex shrink-0 flex-col items-center justify-center rounded-md px-1 font-bold shadow-1',
                varian === 'plum'
                    ? 'bg-gradient-to-br from-brand-600 to-brand-900 text-white ring-1 ring-white/25 ring-inset'
                    : 'bg-gradient-to-br from-white to-brand-50 text-brand-800 ring-1 ring-brand-200/70 ring-inset',
                besar
                    ? 'h-lencana-besar min-w-lencana-besar'
                    : 'h-lencana-kecil min-w-lencana-kecil',
                className,
            )}
        >
            <span aria-hidden="true" className="flex flex-col items-center">
                {besar && denganLabel && (
                    <span
                        className={clsx(
                            'text-label-seksi leading-none uppercase',
                            varian === 'plum'
                                ? 'text-brand-100'
                                : 'text-brand-600',
                        )}
                    >
                        Meja
                    </span>
                )}
                <span
                    className={clsx(
                        besar ? 'text-judul-1' : 'text-teks',
                        denganLabel && 'leading-none',
                    )}
                >
                    {nomor}
                </span>
            </span>
            <span className="sr-only">Meja {nomor}</span>
        </span>
    );
}
