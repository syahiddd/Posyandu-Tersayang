import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * DESIGN 10.3: tombol "/" memfokuskan isian cari di Meja 1 dan Data Anak,
 * kecuali saat kader sedang mengetik di isian lain.
 */
export function usePintasanCari(ref: RefObject<HTMLInputElement | null>) {
    useEffect(() => {
        const tangani = (event: KeyboardEvent) => {
            const sasaran = event.target as HTMLElement;

            if (
                event.key === '/' &&
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(sasaran.tagName)
            ) {
                event.preventDefault();
                ref.current?.focus();
            }
        };

        document.addEventListener('keydown', tangani);

        return () => document.removeEventListener('keydown', tangani);
    }, [ref]);
}
