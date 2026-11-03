import { formatDesimal } from '@/lib/desimal';

/**
 * Baris nilai (DESIGN bab 7): label kiri, nilai kanan 24 px tebal dengan
 * satuan menempel, perubahan ▲ ▼ berwarna ink-600; kosong ditulis "—".
 * Saat teks diperbesar, label pindah ke atas nilai (bab 9).
 */
export function BarisNilai({
    label,
    nilai,
    satuan,
    namaSatuan,
    perubahan,
    perubahanSr,
}: {
    label: string;
    /** Nilai dengan titik desimal dari server, misalnya "13.2". */
    nilai: string | null;
    satuan: string;
    /** Satuan lengkap untuk pembaca layar, misalnya "kilogram" (bab 10). */
    namaSatuan: string;
    perubahan?: string;
    perubahanSr?: string;
}) {
    const teks = nilai === null ? null : formatDesimal(Number(nilai));

    return (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-4">
            <dt className="text-teks text-ink-700">{label}</dt>
            <dd className="ml-auto flex flex-col items-end text-right">
                {teks === null ? (
                    <span className="text-angka text-ink-600">
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">tidak diukur</span>
                    </span>
                ) : (
                    <span className="text-angka text-ink-900 tabular-nums">
                        <span aria-hidden="true">
                            {teks}
                            <span className="ml-1 text-teks font-bold">
                                {satuan}
                            </span>
                        </span>
                        <span className="sr-only">
                            {teks} {namaSatuan}
                        </span>
                    </span>
                )}
                {perubahan && (
                    <span className="text-keterangan font-bold text-ink-600">
                        <span aria-hidden="true">{perubahan}</span>
                        {perubahanSr && (
                            <span className="sr-only">{perubahanSr}</span>
                        )}
                    </span>
                )}
            </dd>
        </div>
    );
}
