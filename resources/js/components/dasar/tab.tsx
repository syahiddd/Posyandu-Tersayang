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
 * grafik (Gambar 7, 8, 10; radius-pill); "garis" untuk bagian halaman.
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
                // Pil: ruang 8 px di sekeliling agar cincin fokus (6 px)
                // tidak terpotong wadah gulir.
                varian === 'pil'
                    ? '-mx-2 gap-2 p-2'
                    : 'border-b border-ink-200',
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
                            'min-h-target-min shrink-0 cursor-pointer px-4 whitespace-nowrap',
                            varian === 'pil'
                                ? [
                                      'rounded-pill border-2 text-kecil font-bold',
                                      terpilih
                                          ? 'border-ink-900 bg-ink-900 text-white'
                                          : 'border-ink-300 bg-white text-ink-900',
                                  ]
                                : [
                                      // Cincin fokus ke dalam: wadah gulir
                                      // memotong cincin di luar tab.
                                      'border-b-4 text-teks focus-visible:-outline-offset-3',
                                      terpilih
                                          ? 'border-ink-900 font-bold text-ink-900'
                                          : 'border-transparent text-ink-700',
                                  ],
                        )}
                    >
                        {satu.label}
                    </button>
                );
            })}
        </div>
    );
}
