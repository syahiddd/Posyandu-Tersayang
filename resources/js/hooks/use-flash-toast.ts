import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useToast } from '@/components/dasar/toast';
import { urungkan } from '@/routes/antrean';

/**
 * Menampilkan notifikasi yang dikirim server lewat flash Inertia. Tombol
 * Batal membatalkan tindakan antrean terakhir, atau tindakan lain bila
 * server mengirim urlBatal (DESIGN Prinsip 1).
 *
 * Juga menangani permintaan yang gagal (DESIGN bab 8, state Error): tanpa
 * ini Inertia menampilkan halaman galat mentah. Isian di layar tidak hilang.
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
                              data.urlBatal ?? urungkan.url(),
                              {},
                              { preserveScroll: true },
                          )
                    : undefined,
            );
        });
    }, [toast]);

    useEffect(() => {
        const lepasJaringan = router.on('networkError', (event) => {
            event.preventDefault();
            toast.error(
                'Tidak tersambung, belum terkirim. Isian masih ada; coba simpan lagi.',
            );
        });
        // 419: sesi atau halaman kedaluwarsa (FR-05).
        const lepasSesi = router.on('httpException', (event) => {
            if (event.detail.response.status !== 419) {
                return;
            }

            event.preventDefault();
            toast.error('Sesi berakhir. Muat ulang, lalu masuk lagi.', () =>
                window.location.reload(),
            );
        });

        return () => {
            lepasJaringan();
            lepasSesi();
        };
    }, [toast]);
}
