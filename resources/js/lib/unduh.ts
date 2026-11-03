/**
 * Unduh CSV (FR-54, PRD 7.3; DESIGN bab 8 "Unduh CSV"): berkas diambil
 * dengan fetch agar layar dapat menampilkan state memuat, kosong, error,
 * dan nama berkas saat berhasil.
 */
export type HasilUnduh =
    | { jenis: 'berhasil'; namaBerkas: string }
    | { jenis: 'kosong'; pesan: string }
    | { jenis: 'gagal' };

/** Nama berkas dari header Content-Disposition, misalnya data-anak_03-11-2026.csv. */
export function namaBerkasDari(
    header: string | null,
    cadangan: string,
): string {
    if (!header) {
        return cadangan;
    }

    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);

    if (utf8) {
        return decodeURIComponent(utf8[1].trim());
    }

    const biasa = /filename="?([^";]+)"?/i.exec(header);

    return biasa ? biasa[1].trim() : cadangan;
}

export async function unduhBerkas(url: string): Promise<HasilUnduh> {
    let respons: Response;

    try {
        respons = await fetch(url, {
            credentials: 'same-origin',
            headers: { Accept: 'text/csv, application/json' },
        });
    } catch {
        return { jenis: 'gagal' };
    }

    if (respons.status === 422) {
        const isi = (await respons.json().catch(() => null)) as {
            pesan?: string;
        } | null;

        return {
            jenis: 'kosong',
            pesan: isi?.pesan ?? 'Tidak ada data untuk penyaring ini.',
        };
    }

    if (!respons.ok) {
        return { jenis: 'gagal' };
    }

    const namaBerkas = namaBerkasDari(
        respons.headers.get('Content-Disposition'),
        'unduhan.csv',
    );
    const tautan = document.createElement('a');
    tautan.href = URL.createObjectURL(await respons.blob());
    tautan.download = namaBerkas;
    document.body.append(tautan);
    tautan.click();
    tautan.remove();
    setTimeout(() => URL.revokeObjectURL(tautan.href), 1000);

    return { jenis: 'berhasil', namaBerkas };
}
