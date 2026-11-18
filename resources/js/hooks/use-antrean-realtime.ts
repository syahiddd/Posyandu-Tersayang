import { router, usePoll } from '@inertiajs/react';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { useEffect, useRef } from 'react';

type PerubahanAntrean = { meja: number[] };

/**
 * Memuat ulang props halaman saat antrean berubah di perangkat lain
 * (FR-09, NFR-02). Hanya props yang disebut yang diminta ulang, sehingga
 * isian yang sedang diketik kader tidak hilang.
 *
 * Siaran yang terlewat saat koneksi putus (layar ponsel mati, sinyal
 * hilang, tab di latar belakang) ditutup dengan memuat ulang begitu koneksi
 * tersambung kembali atau halaman kembali terlihat.
 *
 * @param props Nama props Inertia yang dimuat ulang.
 * @param meja Bila diisi, hanya bereaksi pada perubahan meja tersebut.
 */
function useAntreanReverb(
    props: string[],
    meja?: number,
    onBerubah?: (perubahan: PerubahanAntrean) => void,
) {
    const kunciProps = props.join(',');

    useEcho<PerubahanAntrean>(
        'antrean',
        '.antrean.berubah',
        (perubahan) => {
            if (meja !== undefined && !perubahan.meja.includes(meja)) {
                return;
            }

            router.reload({ only: kunciProps.split(',') });
            onBerubah?.(perubahan);
        },
        [kunciProps, meja],
    );

    const status = useConnectionStatus();
    const pernahTerhubung = useRef(false);

    useEffect(() => {
        if (status !== 'connected') {
            return;
        }

        if (pernahTerhubung.current) {
            router.reload({ only: kunciProps.split(',') });
        }

        pernahTerhubung.current = true;
    }, [status, kunciProps]);

    useEffect(() => {
        const saatTerlihat = () => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: kunciProps.split(',') });
            }
        };

        document.addEventListener('visibilitychange', saatTerlihat);

        return () =>
            document.removeEventListener('visibilitychange', saatTerlihat);
    }, [kunciProps]);
}

/**
 * Cadangan tanpa server Reverb (TECHSTACK: polling setiap 3 detik, tetap
 * memenuhi target 3 detik NFR-02). Dipakai bila VITE_REVERB_APP_KEY kosong.
 */
function useAntreanPolling(props: string[]) {
    usePoll(3000, { only: props });
}

export const useAntreanRealtime: (
    props: string[],
    meja?: number,
    onBerubah?: (perubahan: PerubahanAntrean) => void,
) => void = import.meta.env.VITE_REVERB_APP_KEY
    ? useAntreanReverb
    : useAntreanPolling;
