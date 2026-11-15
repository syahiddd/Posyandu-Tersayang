import { clsx } from 'clsx';
import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

export type ItemTab<T extends string> = { id: T; label: string };

export function idTab(id: string) {
    return `tab-${id}`;
}

export function idPanel(id: string) {
    return `panel-${id}`;
}

/** Atribut ARIA untuk panel milik sebuah tab. */
export function propsPanel(id: string) {
    return {
        id: idPanel(id),
        role: 'tabpanel',
        'aria-labelledby': idTab(id),
        tabIndex: 0,
    } as const;
}

/**
 * Tab (DESIGN bab 7 "Tab grafik", 10.3–10.4): tablist dengan panah
 * kiri/kanan, Home, dan End; hanya tab aktif yang masuk urutan Tab.
 * Dapat digulir horizontal di ponsel bila tidak muat. Varian "pil" untuk tab
 * grafik (Gambar 7, 8, 10; radius-pill); "garis" untuk bagian halaman, dengan
 * penanda gradien plum di bawah tab aktif.
 */
export function Tab<T extends string>({
    label,
    item,
    aktif,
    onUbah,
    className,
    varian = 'garis',
}: {
    label: string;
    item: ItemTab<T>[];
    aktif: T;
    onUbah: (id: T) => void;
    className?: string;
    varian?: 'garis' | 'pil';
}) {
    const refDaftar = useRef<HTMLDivElement>(null);

    function pindah(event: KeyboardEvent<HTMLDivElement>) {
        const posisi = item.findIndex((satu) => satu.id === aktif);
        const tujuan = {
            ArrowRight: (posisi + 1) % item.length,
            ArrowLeft: (posisi - 1 + item.length) % item.length,
            Home: 0,
            End: item.length - 1,
        }[event.key];

        if (tujuan === undefined) {
            return;
        }

        event.preventDefault();
        onUbah(item[tujuan].id);
        refDaftar.current
            ?.querySelector<HTMLButtonElement>(`#${idTab(item[tujuan].id)}`)
            ?.focus();
    }

    return (
        <div
            ref={refDaftar}
            role="tablist"
            aria-label={label}
            onKeyDown={pindah}
            className={clsx(
                'flex overflow-x-auto',
                // Sembunyikan batang gulir agar deretan tab tetap bersih.
                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                // Pil: ruang 8 px di sekeliling agar cincin fokus (6 px)
                // tidak terpotong wadah gulir.
                varian === 'pil'
                    ? '-mx-2 gap-2 p-2'
                    : 'gap-1 rounded-lg border border-brand-100 bg-gradient-to-r from-white via-brand-50/60 to-white p-1 shadow-1',
                className,
            )}
        >
            {item.map((satu) => {
                const terpilih = satu.id === aktif;

                return (
                    <button
                        key={satu.id}
                        id={idTab(satu.id)}
                        type="button"
                        role="tab"
                        aria-selected={terpilih}
                        aria-controls={idPanel(satu.id)}
                        tabIndex={terpilih ? 0 : -1}
                        onClick={() => onUbah(satu.id)}
                        className={clsx(
                            'relative min-h-target-min shrink-0 cursor-pointer rounded-md px-4 whitespace-nowrap transition-all',
                            varian === 'pil'
                                ? [
                                      'rounded-pill border-2 text-kecil font-bold',
                                      terpilih
                                          ? 'border-brand-800 bg-gradient-to-br from-brand-800 to-brand-600 text-white shadow-1'
                                          : 'border-brand-100 bg-white text-ink-900 hover:border-brand-300',
                                  ]
                                : [
                                      'text-teks focus-visible:-outline-offset-3',
                                      terpilih
                                          ? 'bg-gradient-to-br from-brand-50 to-brand-100 font-bold text-brand-900 shadow-1'
                                          : 'font-bold text-ink-600 hover:bg-brand-50/70 hover:text-brand-800',
                                  ],
                        )}
                    >
                        {satu.label}
                        {varian === 'garis' && (
                            <span
                                aria-hidden="true"
                                className={clsx(
                                    'absolute inset-x-3 bottom-1 h-1 rounded-pill transition-opacity',
                                    terpilih
                                        ? 'bg-gradient-to-r from-brand-800 via-brand-600 to-brand-300 opacity-100'
                                        : 'opacity-0',
                                )}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
