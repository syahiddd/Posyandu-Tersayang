import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipPenyaring } from '@/components/dasar/chip-penyaring';
import { Kartu } from '@/components/dasar/kartu';
import { propsPanel, Tab } from '@/components/dasar/tab';
import { formatUmurBulan } from '@/lib/umur';
import { panduanKia } from '@/routes';

type KelompokUmur = { dari: number; label: string };

type AnjuranUmur = {
    dari: number;
    sampai: number;
    label: string;
    halaman: string;
    anjuran: string[];
};

type PorsiMpasi = {
    dari: number;
    sampai: number;
    label: string;
    jumlah: string;
    frekuensi: string;
    energi: string;
    tekstur: string;
    cairan: string;
};

type Panduan = {
    umurBulan: number;
    asi: {
        judul: string;
        sumber: string;
        definisi: string;
        langkah: string[];
        alasan: string[];
        frekuensi: { waktu: string; lambung: string; frekuensi: string }[];
        penyimpanan: { tempat: string; suhu: string; lama: string }[];
        catatanPenyimpanan: string[];
    };
    mpasi: {
        judul: string;
        sumber: string;
        syarat: { judul: string; isi: string }[];
        variasi: { kelompok: string; contoh: string }[];
        porsi: PorsiMpasi[];
        catatan: string[];
    };
    porsiMpasi: PorsiMpasi | null;
    anjuranUmur: AnjuranUmur | null;
    anjuranSemua: AnjuranUmur[];
    tandaBahaya: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    } | null;
    tandaBahayaSemua: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    }[];
    pemantauanBulanan: { judul: string; sumber: string; daftar: string[] };
    perawatanSakit: {
        kode: string;
        judul: string;
        halaman: string;
        lakukan: string[];
        segera: string[];
    }[];
    cairan: {
        sumber: string;
        daftar: { umur: string; jumlah: string }[];
        catatan: string;
    };
    gigi: {
        sumber: string;
        daftar: { umur: string; cara: string }[];
        hindari: string[];
    };
    stimulasi: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    } | null;
    stimulasiSemua: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    }[];
    tidur: {
        sumber: string;
        daftar: { umur: string; durasi: string }[];
        gawai: string[];
    };
    tindakLanjut: {
        kode: string;
        judul: string;
        tingkat: string;
        tindakan: string[];
        sumber: string;
    }[];
    tindakLanjutLila: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        kategori: {
            kode: string;
            batas: string;
            label: string;
            tingkat: string;
            tindakan: string;
        }[];
    }[];
};

type Props = {
    umurBulan: number;
    panduan: Panduan;
    kelompokUmur: KelompokUmur[];
};

type IdTab = 'anjuran' | 'asi-mpasi' | 'bahaya' | 'tindak-lanjut' | 'perawatan';

const LABEL_TINGKAT: Record<string, string> = {
    rujuk: 'Rujuk ke puskesmas',
    tindak_lanjut: 'Tindak lanjut di Posyandu',
    pantau: 'Pantau bulan depan',
};

function Daftar({ item }: { item: string[] }) {
    return (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-teks text-ink-900">
            {item.map((satu) => (
                <li key={satu}>{satu}</li>
            ))}
        </ul>
    );
}

function Sumber({ children }: { children: string }) {
    return <p className="text-keterangan text-ink-600">{children}</p>;
}

/**
 * Panduan KIA (Buku KIA 2024): materi edukasi yang dibaca kader bersama ibu.
 * Penyaring umur mengubah anjuran, tanda bahaya, porsi MPASI, dan stimulasi
 * yang ditampilkan. Seluruh isi berasal dari Buku KIA; tidak ada anjuran di
 * luar buku.
 */
export default function PanduanKiaPage({
    umurBulan,
    panduan,
    kelompokUmur,
}: Props) {
    const [tab, setTab] = useState<IdTab>('anjuran');

    const opsi = kelompokUmur.map((satu) => ({
        nilai: String(satu.dari),
        label: satu.label,
    }));

    // Chip yang tersorot mengikuti kelompok umur, bukan bulan persisnya,
    // sehingga ?umur=10 tetap menyorot "Bayi 9–11 bulan".
    const kelompokTerpilih = String(panduan.anjuranUmur?.dari ?? umurBulan);

    // Kelompok stimulasi di buku lebih rinci daripada kelompok anjuran
    // (mis. 12–23 bulan mencakup 12–18 dan 18–24 bulan), jadi tampilkan
    // semua kelompok stimulasi yang beririsan dengan umur terpilih.
    const dariKelompok = panduan.anjuranUmur?.dari ?? umurBulan;
    const sampaiKelompok = panduan.anjuranUmur?.sampai ?? umurBulan;
    const stimulasiTampil = panduan.stimulasiSemua.filter(
        (satu) => satu.dari <= sampaiKelompok && satu.sampai >= dariKelompok,
    );

    function ubahUmur(nilai: string | null) {
        if (nilai === null) {
            return;
        }

        router.get(
            panduanKia.url(),
            { umur: nilai },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Panduan KIA" />
            <div className="flex flex-col gap-4 desktop:max-w-3xl">
                <header>
                    <h1 className="text-judul-1 text-ink-900">Panduan KIA</h1>
                    <p className="text-teks text-ink-700">
                        Materi edukasi dari Buku KIA 2024 untuk dibacakan
                        bersama ibu. Pilih umur anak agar anjuran yang tampil
                        sesuai.
                    </p>
                </header>

                <Kartu labelSeksi="Umur anak">
                    <div className="flex flex-col gap-3 py-1">
                        <ChipPenyaring
                            label="Kelompok umur"
                            opsi={opsi}
                            nilai={kelompokTerpilih}
                            onUbah={ubahUmur}
                        />
                        <p className="text-kecil text-ink-700">
                            {panduan.anjuranUmur === null
                                ? `Belum ada kelompok umur untuk ${formatUmurBulan(umurBulan)}.`
                                : `Menampilkan ${panduan.anjuranUmur.label} · umur ${formatUmurBulan(umurBulan)}.`}
                        </p>
                    </div>
                </Kartu>

                <Tab<IdTab>
                    label="Bagian panduan"
                    aktif={tab}
                    onUbah={setTab}
                    item={[
                        { id: 'anjuran', label: 'Anjuran umur' },
                        { id: 'asi-mpasi', label: 'ASI & MPASI' },
                        { id: 'bahaya', label: 'Tanda bahaya' },
                        { id: 'tindak-lanjut', label: 'Tindak lanjut' },
                        { id: 'perawatan', label: 'Perawatan' },
                    ]}
                />

                {tab === 'anjuran' && (
                    <div
                        {...propsPanel('anjuran')}
                        className="flex flex-col gap-4"
                    >
                        {panduan.anjuranUmur === null ? (
                            <Banner varian="info">
                                Belum ada anjuran untuk umur ini.
                            </Banner>
                        ) : (
                            <Kartu
                                judul={panduan.anjuranUmur.label}
                                labelSeksi="Yang harus dilakukan"
                            >
                                <div className="flex flex-col gap-2 py-1">
                                    <Daftar
                                        item={panduan.anjuranUmur.anjuran}
                                    />
                                    <Sumber>
                                        {panduan.anjuranUmur.halaman}
                                    </Sumber>
                                </div>
                            </Kartu>
                        )}

                        {stimulasiTampil.map((satu) => (
                            <Kartu
                                key={satu.label}
                                judul={satu.label}
                                labelSeksi="Stimulasi perkembangan"
                            >
                                <div className="flex flex-col gap-2 py-1">
                                    <Daftar item={satu.daftar} />
                                    <Sumber>{satu.halaman}</Sumber>
                                </div>
                            </Kartu>
                        ))}

                        <Kartu labelSeksi="Anjuran semua kelompok umur">
                            <dl className="divide-y divide-ink-200">
                                {panduan.anjuranSemua.map((satu) => (
                                    <div
                                        key={satu.label}
                                        className="flex flex-col gap-1 py-3"
                                    >
                                        <dt className="text-kecil font-bold text-ink-900">
                                            {satu.label}
                                        </dt>
                                        <dd className="text-teks text-ink-700">
                                            <Daftar item={satu.anjuran} />
                                        </dd>
                                        <Sumber>{satu.halaman}</Sumber>
                                    </div>
                                ))}
                            </dl>
                        </Kartu>
                    </div>
                )}

                {tab === 'asi-mpasi' && (
                    <div
                        {...propsPanel('asi-mpasi')}
                        className="flex flex-col gap-4"
                    >
                        <Kartu
                            judul={panduan.asi.judul}
                            labelSeksi="ASI eksklusif"
                        >
                            <div className="flex flex-col gap-3 py-1">
                                <p className="text-teks text-ink-900">
                                    {panduan.asi.definisi}
                                </p>
                                <div>
                                    <p className="text-kecil font-bold text-ink-900">
                                        Yang harus dilakukan
                                    </p>
                                    <Daftar item={panduan.asi.langkah} />
                                </div>
                                <div>
                                    <p className="text-kecil font-bold text-ink-900">
                                        Mengapa harus dilakukan
                                    </p>
                                    <Daftar item={panduan.asi.alasan} />
                                </div>
                                <Sumber>{panduan.asi.sumber}</Sumber>
                            </div>
                        </Kartu>

                        <Kartu labelSeksi="Ukuran lambung dan frekuensi menyusu">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[420px] border-collapse text-teks">
                                    <thead>
                                        <tr className="border-b border-ink-200 text-left text-kecil text-ink-700">
                                            <th className="py-2 pr-3 font-bold">
                                                Waktu
                                            </th>
                                            <th className="py-2 pr-3 font-bold">
                                                Ukuran lambung
                                            </th>
                                            <th className="py-2 font-bold">
                                                Frekuensi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {panduan.asi.frekuensi.map((satu) => (
                                            <tr
                                                key={satu.waktu}
                                                className="border-b border-ink-100 align-top"
                                            >
                                                <td className="py-2 pr-3 font-bold text-ink-900">
                                                    {satu.waktu}
                                                </td>
                                                <td className="py-2 pr-3 text-ink-900">
                                                    {satu.lambung}
                                                </td>
                                                <td className="py-2 text-ink-900">
                                                    {satu.frekuensi}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Kartu>

                        <Kartu
                            judul={panduan.mpasi.judul}
                            labelSeksi="MPASI 6–24 bulan"
                        >
                            <div className="flex flex-col gap-3 py-1">
                                <div>
                                    <p className="text-kecil font-bold text-ink-900">
                                        Empat syarat MPASI
                                    </p>
                                    <dl className="flex flex-col gap-2">
                                        {panduan.mpasi.syarat.map((satu) => (
                                            <div key={satu.judul}>
                                                <dt className="text-teks font-bold text-ink-900">
                                                    {satu.judul}
                                                </dt>
                                                <dd className="text-teks text-ink-700">
                                                    {satu.isi}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                                {panduan.porsiMpasi !== null && (
                                    <div>
                                        <p className="text-kecil font-bold text-ink-900">
                                            Porsi untuk{' '}
                                            {panduan.porsiMpasi.label}
                                        </p>
                                        <dl className="flex flex-col gap-1 text-teks text-ink-900">
                                            <div>
                                                <dt className="inline font-bold">
                                                    Jumlah:{' '}
                                                </dt>
                                                <dd className="inline">
                                                    {panduan.porsiMpasi.jumlah}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="inline font-bold">
                                                    Frekuensi:{' '}
                                                </dt>
                                                <dd className="inline">
                                                    {
                                                        panduan.porsiMpasi
                                                            .frekuensi
                                                    }
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="inline font-bold">
                                                    Tekstur:{' '}
                                                </dt>
                                                <dd className="inline">
                                                    {panduan.porsiMpasi.tekstur}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="inline font-bold">
                                                    Energi:{' '}
                                                </dt>
                                                <dd className="inline">
                                                    {panduan.porsiMpasi.energi}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="inline font-bold">
                                                    Cairan:{' '}
                                                </dt>
                                                <dd className="inline">
                                                    {panduan.porsiMpasi.cairan}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}
                                <div>
                                    <p className="text-kecil font-bold text-ink-900">
                                        Variasi makanan
                                    </p>
                                    <dl className="flex flex-col gap-1 text-teks">
                                        {panduan.mpasi.variasi.map((satu) => (
                                            <div key={satu.kelompok}>
                                                <dt className="inline font-bold text-ink-900">
                                                    {satu.kelompok}:{' '}
                                                </dt>
                                                <dd className="inline text-ink-700">
                                                    {satu.contoh}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                                <div>
                                    <p className="text-kecil font-bold text-ink-900">
                                        Catatan
                                    </p>
                                    <Daftar item={panduan.mpasi.catatan} />
                                </div>
                                <Sumber>{panduan.mpasi.sumber}</Sumber>
                            </div>
                        </Kartu>

                        <Kartu labelSeksi="Cara menyimpan ASI perah">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[420px] border-collapse text-teks">
                                    <thead>
                                        <tr className="border-b border-ink-200 text-left text-kecil text-ink-700">
                                            <th className="py-2 pr-3 font-bold">
                                                Tempat
                                            </th>
                                            <th className="py-2 pr-3 font-bold">
                                                Suhu
                                            </th>
                                            <th className="py-2 font-bold">
                                                Lama
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {panduan.asi.penyimpanan.map((satu) => (
                                            <tr
                                                key={satu.tempat}
                                                className="border-b border-ink-100 align-top"
                                            >
                                                <td className="py-2 pr-3 text-ink-900">
                                                    {satu.tempat}
                                                </td>
                                                <td className="py-2 pr-3 text-ink-900">
                                                    {satu.suhu}
                                                </td>
                                                <td className="py-2 text-ink-900">
                                                    {satu.lama}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3">
                                <Daftar item={panduan.asi.catatanPenyimpanan} />
                            </div>
                        </Kartu>
                    </div>
                )}

                {tab === 'bahaya' && (
                    <div
                        {...propsPanel('bahaya')}
                        className="flex flex-col gap-4"
                    >
                        {panduan.tandaBahaya !== null && (
                            <Kartu
                                judul={panduan.tandaBahaya.label}
                                labelSeksi="Tanda bahaya"
                            >
                                <div className="flex flex-col gap-2 py-1">
                                    <Banner varian="bahaya">
                                        Bila ditemukan tanda bahaya, segera
                                        periksa ke bidan, dokter, atau fasilitas
                                        kesehatan.
                                    </Banner>
                                    <Daftar item={panduan.tandaBahaya.daftar} />
                                    <Sumber>
                                        {panduan.tandaBahaya.halaman}
                                    </Sumber>
                                </div>
                            </Kartu>
                        )}

                        <Kartu
                            judul={panduan.pemantauanBulanan.judul}
                            labelSeksi="Pemantauan bulanan"
                        >
                            <div className="flex flex-col gap-2 py-1">
                                <Daftar
                                    item={panduan.pemantauanBulanan.daftar}
                                />
                                <Sumber>
                                    {panduan.pemantauanBulanan.sumber}
                                </Sumber>
                            </div>
                        </Kartu>

                        <Kartu labelSeksi="Tanda bahaya semua kelompok umur">
                            <div className="flex flex-col gap-3 py-1">
                                {panduan.tandaBahayaSemua.map((satu) => (
                                    <div key={satu.label}>
                                        <p className="text-kecil font-bold text-ink-900">
                                            {satu.label}
                                        </p>
                                        <p className="text-teks text-ink-700">
                                            {satu.daftar.join(' · ')}
                                        </p>
                                        <Sumber>{satu.halaman}</Sumber>
                                    </div>
                                ))}
                            </div>
                        </Kartu>
                    </div>
                )}

                {tab === 'tindak-lanjut' && (
                    <div
                        {...propsPanel('tindak-lanjut')}
                        className="flex flex-col gap-4"
                    >
                        <Banner varian="info" judul="Bukan diagnosis">
                            Tindak lanjut di bawah adalah anjuran Buku KIA.
                            Hasil skrining tetap harus dikonfirmasi tenaga
                            kesehatan.
                        </Banner>

                        {panduan.tindakLanjut.map((satu) => (
                            <Kartu
                                key={satu.kode}
                                judul={satu.judul}
                                labelSeksi={LABEL_TINGKAT[satu.tingkat]}
                            >
                                <div className="flex flex-col gap-2 py-1">
                                    <Daftar item={satu.tindakan} />
                                    <Sumber>{satu.sumber}</Sumber>
                                </div>
                            </Kartu>
                        ))}

                        <Kartu labelSeksi="Tindak lanjut LiLA">
                            <div className="flex flex-col gap-3 py-1">
                                {panduan.tindakLanjutLila.map((satu) => (
                                    <div key={satu.label}>
                                        <p className="text-kecil font-bold text-ink-900">
                                            {satu.label}
                                        </p>
                                        <ul className="flex flex-col gap-1 text-teks text-ink-900">
                                            {satu.kategori.map((kategori) => (
                                                <li key={kategori.kode}>
                                                    <span className="font-bold">
                                                        {kategori.label}
                                                    </span>{' '}
                                                    ({kategori.batas}):{' '}
                                                    {kategori.tindakan}
                                                </li>
                                            ))}
                                        </ul>
                                        <Sumber>{satu.halaman}</Sumber>
                                    </div>
                                ))}
                            </div>
                        </Kartu>
                    </div>
                )}

                {tab === 'perawatan' && (
                    <div
                        {...propsPanel('perawatan')}
                        className="flex flex-col gap-4"
                    >
                        {panduan.perawatanSakit.map((satu) => (
                            <Kartu key={satu.kode} judul={satu.judul}>
                                <div className="flex flex-col gap-3 py-1">
                                    <div>
                                        <p className="text-kecil font-bold text-ink-900">
                                            Lakukan di rumah
                                        </p>
                                        <Daftar item={satu.lakukan} />
                                    </div>
                                    <div>
                                        <p className="text-kecil font-bold text-ink-900">
                                            Segera ke fasilitas kesehatan bila
                                        </p>
                                        <Daftar item={satu.segera} />
                                    </div>
                                    <Sumber>{satu.halaman}</Sumber>
                                </div>
                            </Kartu>
                        ))}

                        <Kartu labelSeksi="Kebutuhan cairan">
                            <div className="flex flex-col gap-2 py-1">
                                <ul className="flex flex-col gap-1 text-teks text-ink-900">
                                    {panduan.cairan.daftar.map((satu) => (
                                        <li key={satu.umur}>
                                            <span className="font-bold">
                                                {satu.umur}
                                            </span>
                                            : {satu.jumlah}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-teks text-ink-700">
                                    {panduan.cairan.catatan}
                                </p>
                                <Sumber>{panduan.cairan.sumber}</Sumber>
                            </div>
                        </Kartu>

                        <Kartu labelSeksi="Perawatan gigi">
                            <div className="flex flex-col gap-2 py-1">
                                <ul className="flex flex-col gap-1 text-teks text-ink-900">
                                    {panduan.gigi.daftar.map((satu) => (
                                        <li key={satu.umur}>
                                            <span className="font-bold">
                                                {satu.umur}
                                            </span>
                                            : {satu.cara}
                                        </li>
                                    ))}
                                </ul>
                                <div>
                                    <p className="text-kecil font-bold text-ink-900">
                                        Hindari
                                    </p>
                                    <Daftar item={panduan.gigi.hindari} />
                                </div>
                                <Sumber>{panduan.gigi.sumber}</Sumber>
                            </div>
                        </Kartu>

                        <Kartu labelSeksi="Tidur dan gawai">
                            <div className="flex flex-col gap-2 py-1">
                                <ul className="flex flex-col gap-1 text-teks text-ink-900">
                                    {panduan.tidur.daftar.map((satu) => (
                                        <li key={satu.umur}>
                                            <span className="font-bold">
                                                {satu.umur}
                                            </span>
                                            : {satu.durasi}
                                        </li>
                                    ))}
                                </ul>
                                <Daftar item={panduan.tidur.gawai} />
                                <Sumber>{panduan.tidur.sumber}</Sumber>
                            </div>
                        </Kartu>
                    </div>
                )}
            </div>
        </>
    );
}
