import { describe, expect, it } from 'vite-plus/test';
import { namaBerkasDari } from './unduh';

describe('namaBerkasDari (PRD 7.3)', () => {
    it('membaca nama berkas dari attachment Laravel', () => {
        expect(
            namaBerkasDari(
                'attachment; filename=data-anak_03-11-2026.csv',
                'x.csv',
            ),
        ).toBe('data-anak_03-11-2026.csv');
        expect(
            namaBerkasDari(
                'attachment; filename="data-anak_03-11-2026.csv"',
                'x.csv',
            ),
        ).toBe('data-anak_03-11-2026.csv');
    });

    it('mengutamakan filename* UTF-8', () => {
        expect(
            namaBerkasDari(
                "attachment; filename=a.csv; filename*=UTF-8''rekap%20imunisasi.csv",
                'x.csv',
            ),
        ).toBe('rekap imunisasi.csv');
    });

    it('memakai cadangan bila header tidak ada', () => {
        expect(namaBerkasDari(null, 'unduhan.csv')).toBe('unduhan.csv');
    });
});
