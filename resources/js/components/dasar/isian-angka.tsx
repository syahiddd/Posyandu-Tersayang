import { clsx } from 'clsx';
import { useId } from 'react';
import type { ComponentProps } from 'react';
import { saringKetikanDesimal } from '@/lib/desimal';
import { Bidang, deskripsiIsian, kelasBingkai } from './bidang';

/**
 * Isian angka (DESIGN bab 7, FR-20): inputmode desimal, menerima koma dan
 * titik, angka 24 px tebal dengan satuan di sebelahnya.
 * Jenis "digit" untuk NIK dan nomor HP: hanya angka, tanpa pemisah desimal.
 */
/** Bab 10: pembaca layar membaca satuan lengkap, misalnya "13,2 kilogram". */
const namaSatuan: Record<string, string> = {
    kg: 'kilogram',
    cm: 'sentimeter',
};

type PropsIsianAngka = Omit<
    ComponentProps<'input'>,
    'className' | 'type' | 'value' | 'onChange' | 'inputMode'
> & {
    label: string;
    nilai: string;
    onUbah: (nilai: string) => void;
    jenis?: 'desimal' | 'digit';
    satuan?: string;
    wajib?: boolean;
    /** Ditampilkan di kanan label, misalnya untuk LiLA dan LK. */
    dianjurkan?: boolean;
    /** Ditambahkan ke petunjuk, misalnya "Lalu: 13,0 kg (8 Okt)". */
    nilaiLalu?: string;
    petunjuk?: string;
    galat?: string;
    peringatan?: string;
    bacaSaja?: boolean;
    className?: string;
};

export function IsianAngka({
    label,
    nilai,
    onUbah,
    jenis = 'desimal',
    satuan,
    wajib = false,
    dianjurkan = false,
    nilaiLalu,
    petunjuk,
    galat,
    peringatan,
    bacaSaja = false,
    className,
    id,
    ...props
}: PropsIsianAngka) {
    const idOtomatis = useId();
    const idIsian = id ?? idOtomatis;

    const teksPetunjuk =
        [
            petunjuk ??
                (jenis === 'desimal' ? 'Boleh pakai koma atau titik' : null),
            nilaiLalu ? `Lalu: ${nilaiLalu}` : null,
        ]
            .filter(Boolean)
            .join(' · ') || undefined;

    return (
        <Bidang
            id={idIsian}
            label={label}
            wajib={wajib}
            kananLabel={
                dianjurkan ? (
                    <span className="text-kecil text-ink-600">Dianjurkan</span>
                ) : null
            }
            petunjuk={bacaSaja ? undefined : teksPetunjuk}
            galat={galat}
            peringatan={peringatan}
            className={className}
        >
            <div
                className={clsx(
                    kelasBingkai({ galat, peringatan, bacaSaja }),
                    'flex h-control-h items-center focus-within:border-ink-900',
                    // Cincin fokus (bab 10.3) di bingkai, bukan di dalam isian.
                    'focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-ink-900',
                )}
            >
                <input
                    id={idIsian}
                    type="text"
                    inputMode={jenis === 'desimal' ? 'decimal' : 'numeric'}
                    autoComplete="off"
                    value={nilai}
                    readOnly={bacaSaja}
                    required={wajib}
                    aria-required={wajib || undefined}
                    aria-invalid={galat ? true : undefined}
                    aria-describedby={
                        [
                            satuan ? `${idIsian}-satuan` : null,
                            deskripsiIsian(idIsian, {
                                petunjuk: bacaSaja ? undefined : teksPetunjuk,
                                galat,
                                peringatan,
                            }),
                        ]
                            .filter(Boolean)
                            .join(' ') || undefined
                    }
                    onChange={(event) =>
                        onUbah(
                            jenis === 'desimal'
                                ? saringKetikanDesimal(event.target.value)
                                : event.target.value.replace(/\D/g, ''),
                        )
                    }
                    className={clsx(
                        'h-full min-w-0 flex-1 rounded-sm bg-transparent px-4 text-ink-900 placeholder:text-ink-500 focus-visible:outline-none',
                        jenis === 'desimal' ? 'text-angka' : 'text-teks',
                    )}
                    {...props}
                />
                {satuan && (
                    <>
                        <span
                            aria-hidden="true"
                            className="flex h-8 items-center border-l border-ink-300 px-4 text-teks font-bold text-ink-600"
                        >
                            {satuan}
                        </span>
                        <span id={`${idIsian}-satuan`} className="sr-only">
                            dalam {namaSatuan[satuan] ?? satuan}
                        </span>
                    </>
                )}
            </div>
        </Bidang>
    );
}
