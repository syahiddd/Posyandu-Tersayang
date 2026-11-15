import { describe, expect, it } from 'vite-plus/test';
import { selJadwalPadaUmur } from './jadwal-imunisasi';

describe('sel jadwal imunisasi Buku KIA', () => {
    it('menghormati jendela usia tepat BCG dan Polio 1 pada 0–1 bulan', () => {
        const dosis = {
            nomor: 1,
            umurBulan: 1,
            umurTepatMin: 0,
            umurMaks: 59,
            endemis: false,
        };

        expect(selJadwalPadaUmur([dosis], 0)).toEqual({
            nomor: 1,
            jenis: 'tepat',
        });
        expect(selJadwalPadaUmur([dosis], 1)).toEqual({
            nomor: 1,
            jenis: 'tepat',
        });
        expect(selJadwalPadaUmur([dosis], 2)).toEqual({
            nomor: 1,
            jenis: 'lengkapi',
        });
        expect(selJadwalPadaUmur([dosis], 12)).toEqual({
            nomor: 1,
            jenis: 'kejar',
        });
    });

    it('membedakan usia sebelum jadwal, pelengkapan, kejar, dan batas akhir', () => {
        const dosis = {
            nomor: 1,
            umurBulan: 2,
            umurMaks: 59,
            endemis: false,
        };

        expect(selJadwalPadaUmur([dosis], 1)).toEqual({
            nomor: null,
            jenis: 'terlarang',
        });
        expect(selJadwalPadaUmur([dosis], 2)).toEqual({
            nomor: 1,
            jenis: 'tepat',
        });
        expect(selJadwalPadaUmur([dosis], 11)).toEqual({
            nomor: 1,
            jenis: 'lengkapi',
        });
        expect(selJadwalPadaUmur([dosis], 12)).toEqual({
            nomor: 1,
            jenis: 'kejar',
        });
        expect(selJadwalPadaUmur([dosis], 59)).toEqual({
            nomor: 1,
            jenis: 'kejar',
        });
        expect(selJadwalPadaUmur([dosis], 60)).toEqual({
            nomor: null,
            jenis: 'terlarang',
        });
    });

    it('memilih dosis tepat alih-alih dosis sebelumnya yang sedang tertinggal', () => {
        const dosis = [
            { nomor: 1, umurBulan: 9, umurMaks: 59, endemis: false },
            { nomor: 2, umurBulan: 18, umurMaks: 59, endemis: false },
        ];

        expect(selJadwalPadaUmur(dosis, 18)).toEqual({
            nomor: 2,
            jenis: 'tepat',
        });
    });

    it('menghentikan warna pelengkapan saat dosis sudah melewati batasnya', () => {
        const dosis = {
            nomor: 1,
            umurBulan: 2,
            umurMaks: 6,
            endemis: false,
        };

        expect(selJadwalPadaUmur([dosis], 6).jenis).toBe('lengkapi');
        expect(selJadwalPadaUmur([dosis], 7).jenis).toBe('terlarang');
    });
});
