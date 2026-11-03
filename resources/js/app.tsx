import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { PenyediaToast } from '@/components/dasar/toast';
import { useFlashToast } from '@/hooks/use-flash-toast';
import TataLetakAplikasi from '@/layouts/tata-letak-aplikasi';

// Antrean realtime lewat Reverb (FR-09, NFR-02); konfigurasi dari VITE_REVERB_*.
configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Posyandu Lima Meja';

function PendengarFlash() {
    useFlashToast();

    return null;
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            // Masuk, Pilih Meja, dan layar per anak berdiri sendiri tanpa
            // navigasi (DESIGN 6.1–6.3): tombol utama di kaki layar.
            case name.startsWith('auth/'):
            case name.startsWith('kunjungan/'):
            case name.startsWith('meja1/'):
            case name === 'pilih-meja':
                return null;
            default:
                return TataLetakAplikasi;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <PenyediaToast>
                <PendengarFlash />
                {app}
            </PenyediaToast>
        );
    },
    progress: {
        color: 'var(--color-ink-900)',
    },
});
