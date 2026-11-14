import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { Banner } from '@/components/dasar/banner';
import { PenyediaToast } from '@/components/dasar/toast';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useOnline } from '@/hooks/use-online';
import TataLetakAplikasi from '@/layouts/tata-letak-aplikasi';
import TataLetakMeja from '@/layouts/tata-letak-meja';

// Antrean realtime lewat Reverb (FR-09, NFR-02); konfigurasi dari VITE_REVERB_*.
configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Posyandu Lima Meja';

function PendengarFlash() {
    useFlashToast();

    return null;
}

/**
 * Banner offline (DESIGN bab 7 dan 8). Antrean kirim saat sinyal kembali
 * (NFR-03) masuk Rilis 2, jadi teksnya tidak menjanjikan kirim otomatis.
 */
function BannerOffline() {
    if (useOnline()) {
        return null;
    }

    return (
        <Banner
            varian="offline"
            judul="Offline"
            className="sticky top-0 z-50 rounded-none"
        >
            Tidak ada sinyal. Isian tetap ada di layar; simpan lagi setelah
            sinyal kembali.
        </Banner>
    );
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            // Layar antrean dan layar anak berbagi kolom antrean di tablet
            // lebar dan desktop (DESIGN bab 9, Gambar 10). Di ponsel layar
            // anak tetap penuh tanpa navigasi bawah.
            case name === 'meja/antrean':
            case name.startsWith('kunjungan/'):
                return [TataLetakAplikasi, TataLetakMeja];
            // Masuk, Pilih Meja, dan layar per anak (termasuk Detail Anak)
            // berdiri sendiri tanpa navigasi (DESIGN 6.1–6.3, 6.5): header
            // anak berwarna dan tombol utama di kaki layar.
            case name.startsWith('auth/'):
            case name.startsWith('meja1/'):
            case name.startsWith('data-anak/') &&
                !['data-anak/daftar', 'data-anak/terhapus'].includes(name):
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
                <BannerOffline />
                {app}
            </PenyediaToast>
        );
    },
    progress: {
        color: 'var(--color-ink-900)',
    },
});
