import { useState } from 'react';
import { Tombol } from '@/components/dasar/tombol';
import { useToast } from '@/components/dasar/toast';
import { useOnline } from '@/hooks/use-online';
import { unduhBerkas } from '@/lib/unduh';

/**
 * Tombol Unduh CSV (DESIGN 5.10 dan bab 8): "Menyiapkan berkas…" saat
 * memuat; notifikasi nama berkas saat berhasil; notifikasi gagal dengan
 * Coba lagi; pesan bila penyaring tidak menghasilkan data.
 */
export function TombolUnduhCsv({
    url,
    kosong = false,
}: {
    /** Alamat unduh beserta penyaring aktif. */
    url: string;
    kosong?: boolean;
}) {
    const toast = useToast();
    const [memuat, setMemuat] = useState(false);
    const online = useOnline();
    // Keterangan tampil sebagai teks: tooltip tidak muncul di layar sentuh
    // dan tidak terjangkau pada tombol nonaktif (DESIGN Tabel 33).
    const keterangan = !online
        ? 'Perlu sinyal untuk mengunduh'
        : kosong
          ? 'Tidak ada data untuk penyaring ini'
          : null;

    async function unduh() {
        setMemuat(true);
        const hasil = await unduhBerkas(url);
        setMemuat(false);

        if (hasil.jenis === 'berhasil') {
            toast.sukses(`${hasil.namaBerkas} diunduh`);
        } else if (hasil.jenis === 'kosong') {
            toast.error(hasil.pesan);
        } else {
            toast.error('Berkas gagal diunduh', () => void unduh());
        }
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <Tombol
                varian="sekunder"
                memuat={memuat}
                teksMemuat="Menyiapkan berkas…"
                disabled={keterangan !== null}
                onClick={() => void unduh()}
            >
                Unduh CSV
            </Tombol>
            {keterangan && (
                <p className="text-keterangan text-ink-700">{keterangan}</p>
            )}
        </div>
    );
}
