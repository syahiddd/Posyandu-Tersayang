import { clsx } from 'clsx';

export type OpsiPenyaring = { nilai: string | null; label: string };

/**
 * Chip penyaring (DESIGN 6.5: Data Anak, Rekap Imunisasi): sekelompok tombol
 * pilihan tunggal dengan aria-pressed; target sentuh 48 px. Berbeda dengan
 * Chip status yang bukan tombol. Pilihan terpilih memakai tinta, bukan warna
 * status (Prinsip 3). Mulai tablet, label berada di kolom kiri selebar tetap
 * agar chip antarkelompok sejajar.
 */
export function ChipPenyaring({
    label,
    opsi,
    nilai,
    onUbah,
}: {
    label: string;
    opsi: OpsiPenyaring[];
    nilai: string | null;
    onUbah: (nilai: string | null) => void;
}) {
    return (
        <div
            role="group"
            aria-label={label}
            className="flex flex-col gap-1 tablet:flex-row tablet:items-start tablet:gap-4"
        >
            <p
                aria-hidden="true"
                className="text-kecil font-bold text-ink-900 tablet:flex tablet:min-h-target-min tablet:w-30 tablet:shrink-0 tablet:items-center"
            >
                {label}
            </p>
            <div className="flex flex-wrap gap-2">
                {opsi.map((satu) => {
                    const terpilih = satu.nilai === nilai;

                    return (
                        <button
                            key={satu.nilai ?? 'semua'}
                            type="button"
                            aria-pressed={terpilih}
                            onClick={() => onUbah(satu.nilai)}
                            className={clsx(
                                'inline-flex min-h-target-min cursor-pointer items-center rounded-pill border-2 px-4 text-kecil font-bold transition-colors',
                                terpilih
                                    ? 'border-brand-700 bg-brand-700 text-white'
                                    : 'border-ink-300 bg-white text-ink-900 hover:border-brand-700',
                            )}
                        >
                            {satu.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
