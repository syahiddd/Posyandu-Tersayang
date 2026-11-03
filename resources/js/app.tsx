import { createInertiaApp } from '@inertiajs/react';
import { PenyediaToast } from '@/components/dasar/toast';
import TataLetakAplikasi from '@/layouts/tata-letak-aplikasi';
import { configureEcho } from '@laravel/echo-react';

configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Posyandu Lima Meja';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            // Masuk dan Pilih Meja berdiri sendiri tanpa navigasi (DESIGN 6.1).
            case name.startsWith('auth/'):
            case name === 'pilih-meja':
                return null;
            default:
                return TataLetakAplikasi;
        }
    },
    strictMode: true,
    withApp(app) {
        return <PenyediaToast>{app}</PenyediaToast>;
    },
    progress: {
        color: 'var(--color-ink-900)',
    },
});
