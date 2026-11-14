import { describe, expect, it } from 'vite-plus/test';
import { perubahan, teksKbm, teksPerubahan } from './perbandingan';

describe('perubahan (FR-25)', () => {
    it('menentukan naik, tetap, atau turun', () => {
        expect(perubahan('13.2', '13.0')).toEqual({
            arah: 'naik',
            selisih: 0.2,
        });
        expect(perubahan('13.0', '13.0')).toEqual({
            arah: 'tetap',
            selisih: 0,
        });
        expect(perubahan('12.7', '13.0')).toEqual({
            arah: 'turun',
            selisih: 0.3,
        });
    });

    it('tanpa nilai lalu atau sekarang tidak ada perbandingan', () => {
        expect(perubahan(null, '13.0')).toBeNull();
        expect(perubahan('13.0', null)).toBeNull();
    });

    it('membulatkan galat pecahan biner', () => {
        expect(perubahan('88.0', '87.4')).toEqual({
            arah: 'naik',
            selisih: 0.6,
        });
    });
});

describe('teks perubahan dan KBM (DESIGN Gambar 5)', () => {
    it('menulis panah, tanda, satuan, dan tanggal', () => {
        expect(
            teksPerubahan({ arah: 'naik', selisih: 0.2 }, 'kg', '8 Okt'),
        ).toBe('▲ +0,2 kg dari 8 Okt');
        expect(
            teksPerubahan({ arah: 'turun', selisih: 0.3 }, 'kg', '8 Okt'),
        ).toBe('▼ −0,3 kg dari 8 Okt');
        expect(
            teksPerubahan({ arah: 'tetap', selisih: 0 }, 'cm', '8 Okt'),
        ).toBe('Tetap sejak 8 Okt');
    });

    it('membandingkan kenaikan dengan KBM', () => {
        expect(teksKbm(200, 200)).toBe('+200 g ≥ KBM 200 g');
        expect(teksKbm(100, 200)).toBe('+100 g < KBM 200 g');
        expect(teksKbm(-50, 200)).toBe('-50 g < KBM 200 g');
    });
});
