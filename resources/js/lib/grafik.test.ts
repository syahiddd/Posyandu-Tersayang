import { describe, expect, it } from 'vite-plus/test';
import {
    formatSatuDesimal,
    formatZ,
    labelGaris,
    tick,
    titikDalamRentang,
    zonaIndeks,
} from './grafik';
import type { DataGrafik } from './grafik';

describe('format angka grafik (PRD 5.6, DESIGN 7.1)', () => {
    it('z-score dua desimal dengan koma dan tanda', () => {
        expect(formatZ(-2.31)).toBe('−2,31');
        expect(formatZ(0.92)).toBe('+0,92');
        expect(formatZ(0)).toBe('0,00');
        expect(formatZ(-0.001)).toBe('0,00');
    });

    it('nilai ukur satu desimal dan pil garis', () => {
        expect(formatSatuDesimal(88)).toBe('88,0');
        expect(formatSatuDesimal(null)).toBe('—');
        expect(labelGaris(-3)).toBe('−3');
        expect(labelGaris(2)).toBe('+2');
        expect(labelGaris(0)).toBe('0');
    });

    it('tick mengikuti rentang sumbu', () => {
        expect(tick(24, 60, 6)).toEqual([24, 30, 36, 42, 48, 54, 60]);
        expect(tick(45, 110, 10)).toEqual([50, 60, 70, 80, 90, 100, 110]);
    });
});

describe('zona kategori status gizi (PRD Tabel 25)', () => {
    it('TB/U normal sampai +3 lalu tinggi', () => {
        expect(
            zonaIndeks('pb_tb_u').map((satu) => [
                satu.bawah,
                satu.atas,
                satu.label,
            ]),
        ).toEqual([
            [null, -3, 'Sangat pendek'],
            [-3, -2, 'Pendek'],
            [-2, 3, 'Normal'],
            [3, null, 'Tinggi'],
        ]);
    });

    it('BB/U dan KMS: risiko lebih di atas +1', () => {
        expect(zonaIndeks('kms').at(-1)).toMatchObject({
            bawah: 1,
            label: 'Risiko lebih',
        });
        expect(zonaIndeks('bb_u')).toEqual(zonaIndeks('kms'));
    });

    it('IMT/U dan BB/TB memuat enam kategori sampai obesitas', () => {
        expect(zonaIndeks('imt_u').map((satu) => satu.label)).toEqual([
            'Gizi buruk',
            'Gizi kurang',
            'Gizi baik',
            'Berisiko gizi lebih',
            'Gizi lebih',
            'Obesitas',
        ]);
    });
});

describe('titik anak di grafik (kriteria PRD 4.7)', () => {
    it('titik di luar rentang umur grafik tidak digambar, urut umur', () => {
        const titik = (id: number, x: number) => ({
            id,
            x,
            y: 10,
            tanggal: `2026-0${id}-01`,
            umurBulan: x,
            zScore: 0,
            kategori: 'Normal',
            dariBukuKia: false,
            hariIni: false,
        });
        const data = {
            dariX: 24,
            sampaiX: 60,
            titik: [titik(3, 25), titik(1, 23), titik(2, 24)],
        } as DataGrafik;

        expect(titikDalamRentang(data).map((satu) => satu.id)).toEqual([2, 3]);
    });
});
