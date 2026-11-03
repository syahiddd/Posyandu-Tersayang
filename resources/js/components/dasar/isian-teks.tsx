import { clsx } from 'clsx';
import { useId, useState } from 'react';
import type { ComponentProps } from 'react';
import { Bidang, deskripsiIsian, kelasBingkai } from './bidang';

/**
 * Isian teks (DESIGN bab 7): varian teks, cari, kata sandi, dan area teks.
 * Label di atas, bukan placeholder; petunjuk dan error di bawah.
 */
type PropsUmum = {
    label: string;
    wajib?: boolean;
    petunjuk?: string;
    galat?: string;
    bacaSaja?: boolean;
    className?: string;
};

type PropsIsianTeks = PropsUmum &
    Omit<ComponentProps<'input'>, 'className' | 'type'> & {
        jenis?: 'teks' | 'cari' | 'kata-sandi' | 'tanggal' | 'telepon';
        /** Untuk jenis cari: menampilkan tombol Hapus saat ada isi. */
        onHapus?: () => void;
    };

export function IsianTeks({
    label,
    wajib = false,
    petunjuk,
    galat,
    bacaSaja = false,
    className,
    jenis = 'teks',
    onHapus,
    id,
    value,
    ...props
}: PropsIsianTeks) {
    const idOtomatis = useId();
    const idIsian = id ?? idOtomatis;
    const [tampilkanSandi, setTampilkanSandi] = useState(false);

    const tombolTampilkan =
        jenis === 'kata-sandi' ? (
            <button
                type="button"
                aria-controls={idIsian}
                aria-pressed={tampilkanSandi}
                onClick={() => setTampilkanSandi((nilai) => !nilai)}
                className="-my-3 inline-flex min-h-target-min cursor-pointer items-center px-1 text-kecil text-ink-900 underline underline-offset-4"
            >
                {tampilkanSandi ? 'Sembunyikan' : 'Tampilkan'}
            </button>
        ) : null;

    const type = {
        'kata-sandi': tampilkanSandi ? 'text' : 'password',
        cari: 'search',
        tanggal: 'date',
        telepon: 'tel',
        teks: 'text',
    }[jenis];

    const adaIsi = typeof value === 'string' ? value.length > 0 : false;

    return (
        <Bidang
            id={idIsian}
            label={label}
            wajib={wajib}
            kananLabel={tombolTampilkan}
            petunjuk={petunjuk}
            galat={galat}
            className={className}
        >
            <div className="relative">
                <input
                    id={idIsian}
                    type={type}
                    value={value}
                    readOnly={bacaSaja}
                    required={wajib}
                    aria-required={wajib || undefined}
                    aria-invalid={galat ? true : undefined}
                    aria-describedby={deskripsiIsian(idIsian, {
                        petunjuk,
                        galat,
                    })}
                    className={clsx(
                        kelasBingkai({ galat, bacaSaja }),
                        'h-control-h px-4 text-teks',
                        jenis === 'cari' && onHapus && adaIsi && 'pr-20',
                    )}
                    {...props}
                />
                {jenis === 'cari' && onHapus && adaIsi && (
                    <button
                        type="button"
                        onClick={onHapus}
                        className="absolute inset-y-0 right-0 inline-flex min-w-target-min cursor-pointer items-center px-4 text-kecil text-ink-900 underline underline-offset-4"
                    >
                        Hapus
                    </button>
                )}
            </div>
        </Bidang>
    );
}

type PropsAreaTeks = PropsUmum & Omit<ComponentProps<'textarea'>, 'className'>;

export function AreaTeks({
    label,
    wajib = false,
    petunjuk,
    galat,
    bacaSaja = false,
    className,
    id,
    ...props
}: PropsAreaTeks) {
    const idOtomatis = useId();
    const idIsian = id ?? idOtomatis;

    return (
        <Bidang
            id={idIsian}
            label={label}
            wajib={wajib}
            petunjuk={petunjuk}
            galat={galat}
            className={className}
        >
            <textarea
                id={idIsian}
                readOnly={bacaSaja}
                required={wajib}
                aria-required={wajib || undefined}
                aria-invalid={galat ? true : undefined}
                aria-describedby={deskripsiIsian(idIsian, { petunjuk, galat })}
                className={clsx(
                    kelasBingkai({ galat, bacaSaja }),
                    'min-h-32 px-4 py-3 text-teks',
                )}
                {...props}
            />
        </Bidang>
    );
}
