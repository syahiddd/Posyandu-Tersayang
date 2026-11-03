import { describe, expect, it } from 'vite-plus/test';
import { formatDesimal, parseDesimal, saringKetikanDesimal } from './desimal';

describe('parseDesimal (FR-20)', () => {
    it('menyamakan koma dan titik', () => {
        expect(parseDesimal('8,5')).toBe(8.5);
        expect(parseDesimal('8.5')).toBe(8.5);
        expect(parseDesimal('8,5')).toBe(parseDesimal('8.5'));
    });

    it('menerima bilangan bulat dan spasi di tepi', () => {
        expect(parseDesimal('13')).toBe(13);
        expect(parseDesimal(' 88,0 ')).toBe(88);
    });

    it('menolak lebih dari satu angka di belakang koma (PRD 7.2)', () => {
        expect(parseDesimal('7,25')).toBeNull();
        expect(parseDesimal('8.55')).toBeNull();
    });

    it('menolak huruf, tanda ganda, dan isian kosong', () => {
        for (const salah of [
            '',
            'abc',
            '8,5kg',
            '8,,5',
            '8.5.1',
            ',5',
            '8,',
            '-1',
        ]) {
            expect(parseDesimal(salah)).toBeNull();
        }
    });
});

describe('formatDesimal', () => {
    it('menampilkan satu desimal dengan koma', () => {
        expect(formatDesimal(8.5)).toBe('8,5');
        expect(formatDesimal(13)).toBe('13,0');
    });
});

describe('saringKetikanDesimal', () => {
    it('hanya menyisakan angka dan satu pemisah', () => {
        expect(saringKetikanDesimal('8,5')).toBe('8,5');
        expect(saringKetikanDesimal('8a.5')).toBe('8.5');
        expect(saringKetikanDesimal('8,5,1')).toBe('8,51');
        expect(saringKetikanDesimal('1.2.3')).toBe('1.23');
    });
});
