import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { buatAntreanToast, DURASI_TOAST_MS } from './antrean-toast';

describe('antrean toast (DESIGN bab 7: Batal 5 detik)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('tidak menghilang selama ditahan, lalu menghitung ulang 5 detik', () => {
        const antrean = buatAntreanToast();
        const id = antrean.tampilkan({ jenis: 'sukses', pesan: 'Tersimpan' });

        antrean.tahan(id);
        vi.advanceTimersByTime(DURASI_TOAST_MS * 3);
        expect(antrean.daftar()).toHaveLength(1);

        antrean.lanjutkan(id);
        vi.advanceTimersByTime(DURASI_TOAST_MS - 1);
        expect(antrean.daftar()).toHaveLength(1);
        vi.advanceTimersByTime(1);
        expect(antrean.daftar()).toHaveLength(0);
    });

    it('menghilang sendiri setelah 5 detik', () => {
        const antrean = buatAntreanToast();
        antrean.tampilkan({ jenis: 'sukses', pesan: 'Tersimpan' });

        vi.advanceTimersByTime(DURASI_TOAST_MS - 1);
        expect(antrean.daftar()).toHaveLength(1);

        vi.advanceTimersByTime(1);
        expect(antrean.daftar()).toHaveLength(0);
    });

    it('Batal menjalankan aksi sekali lalu menutup notifikasi', () => {
        const antrean = buatAntreanToast();
        const batal = vi.fn();
        const id = antrean.tampilkan({
            jenis: 'sukses',
            pesan: 'Tersimpan',
            aksi: batal,
        });

        antrean.jalankanAksi(id);
        antrean.jalankanAksi(id);

        expect(batal).toHaveBeenCalledTimes(1);
        expect(antrean.daftar()).toHaveLength(0);
    });

    it('Batal tidak tersedia lagi setelah 5 detik', () => {
        const antrean = buatAntreanToast();
        const batal = vi.fn();
        const id = antrean.tampilkan({
            jenis: 'sukses',
            pesan: 'Tersimpan',
            aksi: batal,
        });

        vi.advanceTimersByTime(DURASI_TOAST_MS);
        antrean.jalankanAksi(id);

        expect(batal).not.toHaveBeenCalled();
    });

    it('mengabari pelanggan setiap perubahan', () => {
        const antrean = buatAntreanToast();
        const pendengar = vi.fn();
        const berhenti = antrean.langganan(pendengar);

        const id = antrean.tampilkan({ jenis: 'error', pesan: 'Gagal' });
        antrean.tutup(id);
        berhenti();
        antrean.tampilkan({ jenis: 'error', pesan: 'Gagal lagi' });

        expect(pendengar).toHaveBeenCalledTimes(2);
    });
});
