import { Download } from 'lucide-react';
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
    tampilan = 'biasa',
}: {
    /** Alamat unduh beserta penyaring aktif. */
    url: string;
    kosong?: boolean;
    /** "header" dipakai di atas latar gradien: kapsul kaca yang ringkas. */
    tampilan?: 'biasa' | 'header';
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

    if (tampilan === 'header') {
        return (
            <div className="flex flex-col items-start gap-1">
                <Tombol
                    memuat={memuat}
                    teksMemuat="Menyiapkan…"
                    disabled={keterangan !== null}
                    onClick={() => void unduh()}
                    className="h-10 min-h-10 border border-white/25 bg-white/15 px-3 text-kecil text-white backdrop-blur-sm active:bg-white/25 disabled:border-white/15 disabled:bg-white/10 disabled:text-white/60"
                >
                    <Download aria-hidden="true" className="size-4" />
                    Unduh CSV
                </Tombol>
                {keterangan && (
                    <p className="text-keterangan text-brand-100">
                        {keterangan}
                    </p>
                )}
            </div>
        );
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
