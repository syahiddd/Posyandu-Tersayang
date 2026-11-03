import { clsx } from 'clsx';
import { useId } from 'react';

export type OpsiSegmen<T extends string> = { nilai: T; label: string };

/**
 * Kontrol segmen 2–3 opsi (DESIGN bab 7): radiogroup dengan radio asli
 * sehingga panah kiri/kanan berpindah opsi (bab 10.3, 10.4). Dipakai untuk
 * Laki-laki/Perempuan, Telentang/Berdiri, Ya/Tidak.
 */
export function KontrolSegmen<T extends string>({
    label,
    nama,
    opsi,
    nilai,
    onUbah,
    wajib = false,
    galat,
    id,
}: {
    label: string;
    nama: string;
    opsi: OpsiSegmen<T>[];
    nilai: T | null;
    onUbah: (nilai: T) => void;
    wajib?: boolean;
    galat?: string;
    id?: string;
}) {
    const idOtomatis = useId();
    const idGrup = id ?? idOtomatis;
    const idPesan = `${idGrup}-pesan`;

    return (
        <fieldset
            id={idGrup}
            tabIndex={-1}
            aria-describedby={galat ? idPesan : undefined}
            className="flex flex-col gap-1"
        >
            <legend className="mb-1 text-kecil font-bold text-ink-900">
                {label}
                {wajib && (
                    <>
                        {' '}
                        <span
                            aria-hidden="true"
                            className="text-status-bahaya-teks"
                        >
                            *
                        </span>
                        <span className="sr-only">(wajib)</span>
                    </>
                )}
            </legend>
            <div
                role="radiogroup"
                aria-invalid={galat ? true : undefined}
                className={clsx(
                    'grid h-control-h overflow-hidden rounded-sm border',
                    // Cincin fokus 3 px tinta di bingkai grup (bab 10.3).
                    'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink-900',
                    galat
                        ? 'border-2 border-status-bahaya-teks'
                        : 'border-ink-900',
                )}
                style={{
                    gridTemplateColumns: `repeat(${opsi.length}, minmax(0, 1fr))`,
                }}
            >
                {opsi.map((item) => {
                    const dipilih = item.nilai === nilai;

                    return (
                        <label
                            key={item.nilai}
                            className={clsx(
                                'flex cursor-pointer items-center justify-center px-2 text-teks font-bold',
                                dipilih
                                    ? 'bg-ink-900 text-white'
                                    : 'bg-white text-ink-900',
                            )}
                        >
                            <input
                                type="radio"
                                name={nama}
                                value={item.nilai}
                                checked={dipilih}
                                required={wajib}
                                onChange={() => onUbah(item.nilai)}
                                className="sr-only"
                            />
                            {item.label}
                        </label>
                    );
                })}
            </div>
            {galat && (
                <p
                    id={idPesan}
                    className="text-keterangan font-bold text-status-bahaya-teks"
                >
                    {galat}
                </p>
            )}
        </fieldset>
    );
}
