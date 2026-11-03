import { describe, expect, it } from 'vite-plus/test';
import {
    caraUkurBawaan,
    periksaUkur,
    peringatanPerubahan,
    saranNilai,
} from './pengukuran';

describe('cara ukur bawaan (FR-21)', () => {
    it('telentang di bawah 24 bulan, berdiri mulai 24 bulan', () => {
        expect(caraUkurBawaan(0)).toBe('telentang');
        expect(caraUkurBawaan(23)).toBe('telentang');
        expect(caraUkurBawaan(24)).toBe('berdiri');
        expect(caraUkurBawaan(59)).toBe('berdiri');
    });
});

describe('periksaUkur (PRD 7.2, FR-20)', () => {
    it('BB dan PB/TB wajib, LiLA dan LK boleh kosong', () => {
        expect(periksaUkur('bb', '', 'Berat badan', true)).toBe(
            'Berat badan wajib diisi.',
        );
        expect(periksaUkur('lila', '', 'LiLA', false)).toBeNull();
    });

    it('koma dan titik sama-sama sah', () => {
        expect(periksaUkur('bb', '8,5', 'Berat badan', true)).toBeNull();
        expect(periksaUkur('bb', '8.5', 'Berat badan', true)).toBeNull();
    });

    it('batas bawah dan atas termasuk', () => {
        expect(periksaUkur('bb', '1,0', 'Berat badan', true)).toBeNull();
        expect(periksaUkur('bb', '35,0', 'Berat badan', true)).toBeNull();
        expect(periksaUkur('bb', '35,1', 'Berat badan', true)).toBe(
            'Isi antara 1,0 dan 35,0 kg.',
        );
        expect(periksaUkur('lk', '27,9', 'Lingkar kepala', false)).toBe(
            'Isi antara 28,0 dan 60,0 cm.',
        );
    });

    it('menyarankan letak koma yang mungkin dimaksud (Gambar 4)', () => {
        expect(periksaUkur('pb_tb', '7,25', 'Panjang badan', true)).toBe(
            'Tulis angka dengan paling banyak satu angka di belakang koma, misalnya 8,5. Mungkin maksudnya 72,5?',
        );
        expect(periksaUkur('pb_tb', '725', 'Panjang badan', true)).toBe(
            'Isi antara 40,0 dan 130,0 cm. Mungkin maksudnya 72,5?',
        );
    });
});

describe('saranNilai', () => {
    it('tidak menyarankan bila hasilnya di luar batas atau sama', () => {
        expect(saranNilai('5', 'bb')).toBeNull();
        expect(saranNilai('9999', 'bb')).toBeNull();
        expect(saranNilai('88,5', 'pb_tb')).toBeNull();
    });
});

describe('peringatanPerubahan (FR-22)', () => {
    const lalu = { bb: '6.8', pbTb: '70.0', tanggal: '8 Okt' };

    it('memperingatkan BB berubah lebih dari 20%', () => {
        expect(peringatanPerubahan({ bb: '8,7', pbTb: '71' }, lalu)).toEqual([
            'BB naik 1,9 kg (28%) sejak 8 Okt.',
        ]);
        expect(peringatanPerubahan({ bb: '5,2', pbTb: '71' }, lalu)).toEqual([
            'BB turun 1,6 kg (24%) sejak 8 Okt.',
        ]);
    });

    it('tidak memperingatkan perubahan 20% atau kurang', () => {
        // 5,0 → 6,0 tepat 20%.
        expect(
            peringatanPerubahan(
                { bb: '6,0', pbTb: '71' },
                { ...lalu, bb: '5.0' },
            ),
        ).toEqual([]);
        expect(peringatanPerubahan({ bb: '7,4', pbTb: '71' }, lalu)).toEqual(
            [],
        );
    });

    it('memperingatkan PB/TB turun lebih dari 1 cm', () => {
        expect(peringatanPerubahan({ bb: '7', pbTb: '68,9' }, lalu)).toEqual([
            'Panjang/tinggi badan turun 1,1 cm sejak 8 Okt.',
        ]);
        expect(peringatanPerubahan({ bb: '7', pbTb: '69' }, lalu)).toEqual([]);
    });

    it('tanpa nilai sebelumnya tidak ada peringatan', () => {
        expect(
            peringatanPerubahan(
                { bb: '20', pbTb: '50' },
                { bb: null, pbTb: null, tanggal: '' },
            ),
        ).toEqual([]);
    });
});
