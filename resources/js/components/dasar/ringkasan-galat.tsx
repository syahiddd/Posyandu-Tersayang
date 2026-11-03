import { useEffect, useRef } from 'react';

/**
 * Ringkasan error di atas formulir (DESIGN 2.2 GOV.UK, Tabel 33, 10.4):
 * role="alert", berisi tautan ke setiap isian yang salah, dan menerima
 * fokus setelah simpan gagal.
 */
export function RingkasanGalat({
    galat,
    labelIsian,
    percobaan,
}: {
    /** Pesan per nama isian. */
    galat: Record<string, string | undefined>;
    /** Nama isian → id elemen yang dituju tautan. */
    labelIsian: Record<string, string>;
    /**
     * Nomor percobaan simpan. Bila diisi, fokus hanya pindah saat nomor ini
     * berubah, sehingga galat yang muncul saat isian ditinggalkan tidak
     * merebut fokus. Bila kosong, fokus pindah setiap daftar galat berubah.
     */
    percobaan?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const daftar = Object.entries(galat).filter(
        (entri): entri is [string, string] => Boolean(entri[1]),
    );
    const kunci = daftar.map(([nama]) => nama).join(',');
    const adaGalat = useRef(false);
    adaGalat.current = kunci !== '';
    const pemicu = percobaan ?? kunci;

    useEffect(() => {
        if (adaGalat.current) {
            ref.current?.focus();
        }
    }, [pemicu]);

    if (daftar.length === 0) {
        return null;
    }

    return (
        <div
            ref={ref}
            role="alert"
            tabIndex={-1}
            className="rounded-md border-l-5 border-status-bahaya-teks bg-status-bahaya-latar px-4 py-3 text-status-bahaya-teks"
        >
            <p className="text-teks font-bold">
                {daftar.length} isian perlu diperbaiki
            </p>
            <ul className="mt-1 flex flex-col">
                {daftar.map(([nama, pesan]) => (
                    <li key={nama}>
                        <a
                            href={`#${labelIsian[nama] ?? nama}`}
                            className="inline-flex min-h-target-min items-center text-teks underline underline-offset-4"
                        >
                            {pesan}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
