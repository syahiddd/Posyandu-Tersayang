import { router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';

type PerubahanAntrean = { meja: number[] };

/**
 * Memuat ulang props halaman saat antrean berubah di perangkat lain
 * (FR-09, NFR-02). Hanya props yang disebut yang diminta ulang, sehingga
 * isian yang sedang diketik kader tidak hilang.
 *
 * @param props Nama props Inertia yang dimuat ulang.
 * @param meja Bila diisi, hanya bereaksi pada perubahan meja tersebut.
 */
export function useAntreanRealtime(
    props: string[],
    meja?: number,
    onBerubah?: (perubahan: PerubahanAntrean) => void,
) {
    useEcho<PerubahanAntrean>(
        'antrean',
        '.antrean.berubah',
        (perubahan) => {
            if (meja !== undefined && !perubahan.meja.includes(meja)) {
                return;
            }

            router.reload({ only: props });
            onBerubah?.(perubahan);
        },
        [props.join(','), meja],
    );
}
