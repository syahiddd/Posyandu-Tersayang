import { createContext, useContext, useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Keadaan isian layar anak yang dibaca kolom antrean saat kader mengetuk
 * anak lain (DESIGN bab 9; keputusan pemilik produk): bila ada perubahan,
 * tanya dulu lalu Tunda dengan draf; bila tidak, cukup lepas.
 */
export type InfoLayarAnak = {
    adaPerubahan: () => boolean;
    draf: () => Record<string, unknown>;
};

export const KonteksLayarAnak =
    createContext<RefObject<InfoLayarAnak | null> | null>(null);

/** Didaftarkan halaman layar anak (Meja 2, Meja 3) setiap render. */
export function useDaftarLayarAnak(info: InfoLayarAnak) {
    const ref = useContext(KonteksLayarAnak);

    useEffect(() => {
        if (!ref) {
            return;
        }

        ref.current = info;

        return () => {
            ref.current = null;
        };
    });
}
