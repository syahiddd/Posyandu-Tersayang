import { clsx } from 'clsx';

/**
 * Lencana meja (DESIGN bab 7, Prinsip 3): selalu berwarna tinta dengan angka
 * putih; meja tidak dibedakan dengan warna. Besar 44 px, kecil 34 px.
 */
type PropsLencanaMeja = {
    /** Nomor meja 1–5, atau "1–5" untuk identitas aplikasi. */
    nomor: number | string;
    ukuran?: 'besar' | 'kecil';
    /** Menampilkan tulisan kecil "MEJA" di atas nomor (ukuran besar). */
    denganLabel?: boolean;
    className?: string;
};

export function LencanaMeja({
    nomor,
    ukuran = 'besar',
    denganLabel = false,
    className,
}: PropsLencanaMeja) {
    const besar = ukuran === 'besar';

    return (
        <span
            className={clsx(
                'inline-flex shrink-0 flex-col items-center justify-center rounded-md bg-ink-900 px-1 font-bold text-white',
                besar
                    ? 'h-lencana-besar min-w-lencana-besar'
                    : 'h-lencana-kecil min-w-lencana-kecil',
                className,
            )}
        >
            <span aria-hidden="true" className="flex flex-col items-center">
                {besar && denganLabel && (
                    <span className="text-label-seksi leading-none uppercase">
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
