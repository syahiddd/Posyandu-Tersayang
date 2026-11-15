import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export type OpsiTarik = { nilai: string; label: string };

/**
 * Pilihan tarik-turun (dropdown) buatan sendiri, bukan `<select>` bawaan
 * peramban. Alasannya: menu bawaan digambar sistem sehingga tidak bisa diberi
 * warna merek, keadaan sorot, atau batas tinggi yang rapi di ponsel.
 *
 * Perilaku:
 * - Tombol pemicu setinggi kontrol (52 px) berbentuk kapsul; saat terbuka
 *   bingkai dan cincin fokus menguat.
 * - Menu selebar pemicu, tinggi dibatasi dan dapat digulir sendiri sehingga
 *   tidak keluar layar.
 * - Opsi yang disorot (hover atau panah) diberi latar blush dan bayangan
 *   lembut sebagai isyarat "siap dipilih"; opsi terpilih memakai gradien plum.
 * - Papan ketik: panah atas/bawah, Home/End, Enter/Space, Escape, Tab.
 */
export function PilihanTarik({
    id,
    label,
    nilai,
    opsi,
    onUbah,
    labelKosong = 'Semua',
    className,
}: {
    id: string;
    /** Label aksesibel tombol; teks visual memakai label terpilih. */
    label: string;
    nilai: string | null;
    opsi: OpsiTarik[];
    onUbah: (nilai: string | null) => void;
    /** Teks untuk pilihan tanpa penyaring. */
    labelKosong?: string;
    className?: string;
}) {
    const semua: OpsiTarik[] = [{ nilai: '', label: labelKosong }, ...opsi];
    const idDaftar = `${id}-daftar`;
    const idOpsi = (index: number) => `${id}-opsi-${index}`;
    const idUnik = useId();
    const [terbuka, setTerbuka] = useState(false);
    const [sorot, setSorot] = useState(0);
    /** Arah buka menu: ke bawah bila ruang cukup, ke atas bila di bawah sempit. */
    const [arah, setArah] = useState<'bawah' | 'atas'>('bawah');
    /** Batas tinggi menu mengikuti ruang layar yang tersedia. */
    const [tinggiMaks, setTinggiMaks] = useState(288);
    const refTombol = useRef<HTMLButtonElement>(null);
    const refPanel = useRef<HTMLDivElement>(null);

    const terpilih = semua.findIndex((item) => item.nilai === (nilai ?? ''));

    // Sorot opsi terpilih setiap kali menu dibuka.
    useEffect(() => {
        if (terbuka) {
            setSorot(terpilih >= 0 ? terpilih : 0);
        }
    }, [terbuka, terpilih]);

    // Ukur ruang layar: buka ke atas bila ruang bawah tidak cukup, dan batasi
    // tinggi menu supaya tidak pernah keluar dari layar.
    useEffect(() => {
        if (!terbuka) {
            return;
        }

        function ukur() {
            const kotak = refTombol.current?.getBoundingClientRect();

            if (!kotak) {
                return;
            }

            // Jangan biarkan menu menutupi kepala aplikasi yang lengket di atas
            // maupun navigasi bawah yang tetap di ponsel.
            const kepala = document.querySelector('header.sticky');
            const navigasi = document.querySelector('nav.fixed.bottom-0');
            const batasAtas =
                (kepala?.getBoundingClientRect().bottom ?? 56) + 8;
            const batasBawah = navigasi
                ? navigasi.getBoundingClientRect().top - 8
                : window.innerHeight;
            const jarak = 12;
            const bawah = batasBawah - kotak.bottom - jarak;
            const atas = kotak.top - batasAtas - jarak;
            const keAtas = bawah < 220 && atas > bawah;

            setArah(keAtas ? 'atas' : 'bawah');
            setTinggiMaks(
                Math.max(
                    120,
                    Math.min(keAtas ? atas : bawah, window.innerHeight * 0.6),
                ),
            );
        }

        ukur();
        window.addEventListener('resize', ukur);
        window.addEventListener('scroll', ukur, true);

        return () => {
            window.removeEventListener('resize', ukur);
            window.removeEventListener('scroll', ukur, true);
        };
    }, [terbuka]);

    // Tutup saat mengetuk di luar komponen.
    useEffect(() => {
        if (!terbuka) {
            return;
        }

        function diLuar(event: PointerEvent) {
            const target = event.target as Node | null;

            if (
                target &&
                !refTombol.current?.contains(target) &&
                !refPanel.current?.contains(target)
            ) {
                setTerbuka(false);
            }
        }

        document.addEventListener('pointerdown', diLuar);

        return () => document.removeEventListener('pointerdown', diLuar);
    }, [terbuka]);

    // Pastikan opsi yang disorot tetap terlihat di dalam menu bergulir.
    useEffect(() => {
        if (!terbuka) {
            return;
        }

        refPanel.current
            ?.querySelector(`#${CSS.escape(idOpsi(sorot))}`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [terbuka, sorot, idUnik]);

    function pilih(index: number) {
        const item = semua[index];

        if (item) {
            onUbah(item.nilai === '' ? null : item.nilai);
        }

        setTerbuka(false);
        refTombol.current?.focus();
    }

    function tombolPapanKetik(event: React.KeyboardEvent) {
        if (event.key === 'Escape') {
            setTerbuka(false);

            return;
        }

        if (!terbuka) {
            if (
                event.key === 'ArrowDown' ||
                event.key === 'ArrowUp' ||
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();
                setTerbuka(true);
            }

            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSorot((lama) => Math.min(lama + 1, semua.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSorot((lama) => Math.max(lama - 1, 0));
        } else if (event.key === 'Home') {
            event.preventDefault();
            setSorot(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            setSorot(semua.length - 1);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            pilih(sorot);
        } else if (event.key === 'Tab') {
            setTerbuka(false);
        }
    }

    const teks = semua[terpilih]?.label ?? labelKosong;

    return (
        <div className={clsx('relative', className)}>
            <button
                ref={refTombol}
                id={id}
                type="button"
                role="combobox"
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={terbuka}
                aria-controls={terbuka ? idDaftar : undefined}
                aria-activedescendant={terbuka ? idOpsi(sorot) : undefined}
                onClick={() => setTerbuka((lama) => !lama)}
                onKeyDown={tombolPapanKetik}
                className={clsx(
                    'flex h-control-h w-full cursor-pointer items-center gap-2 rounded-pill border bg-gradient-to-b from-white to-brand-50/60 px-4 text-left text-teks transition-all',
                    terbuka
                        ? 'border-brand-600 text-ink-900 shadow-2 ring-2 ring-brand-200'
                        : 'border-brand-200 text-ink-900 shadow-1 hover:border-brand-300 hover:shadow-2 active:border-brand-600',
                )}
            >
                <span className="min-w-0 flex-1 truncate">{teks}</span>
                <ChevronDown
                    aria-hidden="true"
                    className={clsx(
                        'size-5 shrink-0 transition-transform',
                        terbuka ? 'rotate-180 text-brand-700' : 'text-ink-500',
                    )}
                />
            </button>

            {terbuka && (
                <div
                    ref={refPanel}
                    id={idDaftar}
                    role="listbox"
                    aria-label={label}
                    tabIndex={-1}
                    style={{ maxHeight: tinggiMaks }}
                    className={clsx(
                        'absolute inset-x-0 z-40 flex flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-md border border-brand-200 bg-white p-1 shadow-2 ring-1 ring-brand-100',
                        arah === 'bawah'
                            ? 'top-[calc(100%+6px)]'
                            : 'bottom-[calc(100%+6px)]',
                    )}
                >
                    {semua.map((item, index) => {
                        const dipilih = item.nilai === (nilai ?? '');
                        const disorot = index === sorot;

                        return (
                            <div
                                key={item.nilai || 'semua'}
                                id={idOpsi(index)}
                                role="option"
                                aria-selected={dipilih}
                                onPointerEnter={() => setSorot(index)}
                                onPointerDown={(event) => {
                                    // Cegah fokus berpindah dari tombol pemicu.
                                    event.preventDefault();
                                    pilih(index);
                                }}
                                className={clsx(
                                    'relative flex min-h-target-min cursor-pointer items-center gap-2 overflow-hidden rounded-sm border px-3 text-teks transition-all select-none',
                                    dipilih
                                        ? 'border-brand-800 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 font-bold text-white shadow-2'
                                        : disorot
                                          ? 'border-brand-200 bg-white font-bold text-brand-900 shadow-2'
                                          : 'border-transparent text-ink-900',
                                )}
                            >
                                {disorot && !dipilih && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-y-1.5 left-1 w-1 rounded-pill bg-gradient-to-b from-brand-800 to-brand-300"
                                    />
                                )}
                                <span
                                    className={clsx(
                                        'min-w-0 flex-1 truncate',
                                        disorot && !dipilih && 'pl-2',
                                    )}
                                >
                                    {item.label}
                                </span>
                                {dipilih && (
                                    <Check
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                        strokeWidth={3}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
