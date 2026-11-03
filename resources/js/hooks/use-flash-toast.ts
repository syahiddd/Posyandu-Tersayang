import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useToast } from '@/components/dasar/toast';
import { urungkan } from '@/routes/antrean';

/**
 * Menampilkan notifikasi yang dikirim server lewat flash Inertia. Tombol
 * Batal membatalkan tindakan antrean terakhir (DESIGN Prinsip 1).
 */
export function useFlashToast(): void {
    const toast = useToast();

    useEffect(() => {
        return router.on('flash', (event) => {
            const data = event.detail.flash.toast;

            if (!data) {
                return;
            }

            if (data.jenis === 'error') {
                toast.error(data.pesan);

                return;
            }

            toast.sukses(
                data.pesan,
                data.batal
                    ? () =>
                          router.post(
                              urungkan.url(),
                              {},
                              { preserveScroll: true },
                          )
                    : undefined,
            );
        });
    }, [toast]);
}
