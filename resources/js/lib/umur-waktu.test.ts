import { describe, expect, it } from 'vite-plus/test';
import {
    formatUmurBulan,
    formatUmurLengkap,
    formatUmurTahunBulan,
    pecahUmur,
} from './umur';
import { inisial, lamaSejak } from './waktu';

describe('format umur (PRD 5.6, DESIGN Gambar 4)', () => {
    it('menulis umur dalam bulan', () => {
        expect(formatUmurBulan(39)).toBe('39 bulan');
        expect(formatUmurBulan(0)).toBe('0 bulan');
    });

    it('menulis umur dalam tahun dan bulan', () => {
        expect(formatUmurTahunBulan(39)).toBe('3 th 3 bln');
        expect(formatUmurTahunBulan(24)).toBe('2 th 0 bln');
        expect(formatUmurTahunBulan(9)).toBe('9 bln');
    });

    it('menulis umur lengkap dengan bulan bila lebih dari setahun', () => {
        expect(formatUmurLengkap(0)).toBe('0 bulan');
        expect(formatUmurLengkap(9)).toBe('9 bulan');
        expect(formatUmurLengkap(12)).toBe('1 tahun 0 bulan (12 bulan)');
        expect(formatUmurLengkap(39)).toBe('3 tahun 3 bulan (39 bulan)');
        expect(pecahUmur(39).teks).toBe('3 tahun 3 bulan');
        expect(pecahUmur(39).teksBulan).toBe('39 bulan');
        expect(pecahUmur(9).teks).toBe('9 bulan');
    });
});

describe('lamaSejak (FR-49)', () => {
    const sekarang = new Date('2026-11-04T09:00:00+07:00');

    it('menulis menit dan jam', () => {
        expect(lamaSejak('2026-11-04T08:59:30+07:00', sekarang)).toBe(
            'kurang dari 1 menit',
        );
        expect(lamaSejak('2026-11-04T08:48:00+07:00', sekarang)).toBe(
            '12 menit',
        );
        expect(lamaSejak('2026-11-04T08:00:00+07:00', sekarang)).toBe('1 jam');
        expect(lamaSejak('2026-11-04T07:35:00+07:00', sekarang)).toBe(
            '1 jam 25 menit',
        );
    });

    it('tidak pernah negatif', () => {
        expect(lamaSejak('2026-11-04T09:05:00+07:00', sekarang)).toBe(
            'kurang dari 1 menit',
        );
    });
});

describe('inisial', () => {
    it('mengambil huruf awal dua kata pertama', () => {
        expect(inisial('Nayla Putri')).toBe('NP');
        expect(inisial('  raka  pratama  jaya ')).toBe('RP');
        expect(inisial('Alya')).toBe('A');
    });
});
