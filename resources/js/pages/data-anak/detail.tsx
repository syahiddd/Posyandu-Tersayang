import { Head, useForm } from '@inertiajs/react';
import { clsx } from 'clsx';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Banner } from '@/components/dasar/banner';
import { Dialog } from '@/components/dasar/dialog';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Kartu } from '@/components/dasar/kartu';
import { propsPanel, Tab } from '@/components/dasar/tab';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { GrafikPertumbuhan } from '@/components/grafik-pertumbuhan';
import { formatDesimal } from '@/lib/desimal';
import type { DataGrafik, IndeksGrafik } from '@/lib/grafik';
import { formatUmurTahunBulan } from '@/lib/umur';
import { dataAnak, riwayatBukuKia } from '@/routes';
import { hapus as hapusAnak, ubah } from '@/routes/data-anak';
import type {
    DetailAnak,
    RiwayatKunjungan,
    RiwayatLayanan,
    RiwayatPengukuran,
} from '@/types';

type Props = {
    anak: DetailAnak;
    pengukuran: RiwayatPengukuran[];
    kunjungan: RiwayatKunjungan[];
    layanan: RiwayatLayanan[];
    perubahanTerakhir: { oleh: string; pada: string } | null;
    bolehHapus: boolean;
    /** Null bila anak belum punya pengukuran. */
    grafik: {
        tabAwal: IndeksGrafik;
        pakaiPanjang: boolean;
        daftar: Record<IndeksGrafik, DataGrafik>;
    } | null;
};

type IdTab = 'ringkasan' | 'grafik' | 'riwayat';

const KOSONG = '—';

function Baris({ label, nilai }: { label: string; nilai: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 py-3 tablet:flex-row tablet:justify-between tablet:gap-4">
            <dt className="text-kecil text-ink-700">{label}</dt>
            <dd className="text-teks font-bold break-words text-ink-900 tablet:text-right">
                {nilai === null || nilai === '' ? KOSONG : nilai}
            </dd>
        </div>
    );
}

function nilaiUkur(nilai: string | null, satuan: string): string {
    return nilai === null
        ? KOSONG
        : `${formatDesimal(Number(nilai))} ${satuan}`;
}

function TandaBukuKia() {
    return (
        <span className="ml-2 inline-flex rounded-pill border border-ink-400 px-2 text-keterangan font-bold whitespace-nowrap text-ink-700">
            Dari Buku KIA
        </span>
    );
}

/**
 * S15 Detail Anak (FR-51, DESIGN 6.5): header anak berwarna sesuai jenis
 * kelamin (FR-67); tab Ringkasan (identitas, orang tua, alamat), Grafik, dan
 * Riwayat (kunjungan dan layanan). NIK tampil lengkap hanya di sini (NFR-05).
 */
export default function DetailDataAnak({
    anak,
    pengukuran,
    kunjungan,
    layanan,
    perubahanTerakhir,
    bolehHapus,
    grafik,
}: Props) {
    const [tab, setTab] = useState<IdTab>('ringkasan');
    const [tabGrafik, setTabGrafik] = useState<IndeksGrafik>(
        grafik?.tabAwal ?? 'kms',
    );
    const [dialogHapus, setDialogHapus] = useState(false);
    const hapus = useForm({ konfirmasi: '' });
    // FR-53 langkah kedua: tombol Hapus aktif setelah nama anak diketik.
    const namaCocok =
        hapus.data.konfirmasi.trim().toLocaleLowerCase('id') ===
        anak.nama.trim().toLocaleLowerCase('id');

    function tutupDialog() {
        setDialogHapus(false);
        hapus.reset();
        hapus.clearErrors();
    }
    const laki = anak.jenisKelamin === 'L';
    const alamat = [
        anak.alamat,
        anak.rt !== null && `RT ${anak.rt}`,
        anak.rw !== null && `RW ${anak.rw}`,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <>
            <Head title={anak.nama} />
            <div className="flex min-h-dvh flex-col bg-paper">
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`${laki ? 'Laki-laki' : 'Perempuan'} · ${formatUmurTahunBulan(anak.umurBulan)}`}
                    jenisKelamin={anak.jenisKelamin}
                    kembali={dataAnak()}
                    kembaliLewatPost={false}
                />

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 tablet:px-5">
                    <Tab<IdTab>
                        label="Bagian detail anak"
                        aktif={tab}
                        onUbah={setTab}
                        item={[
                            { id: 'ringkasan', label: 'Ringkasan' },
                            { id: 'grafik', label: 'Grafik' },
                            { id: 'riwayat', label: 'Riwayat' },
                        ]}
                    />

                    {tab === 'ringkasan' && (
                        <div
                            {...propsPanel('ringkasan')}
                            className="flex flex-col gap-4"
                        >
                            <Kartu labelSeksi="Identitas anak">
                                <dl className="divide-y divide-ink-200">
                                    <Baris label="Nama" nilai={anak.nama} />
                                    <Baris
                                        label="Jenis kelamin"
                                        nilai={laki ? 'Laki-laki' : 'Perempuan'}
                                    />
                                    <Baris
                                        label="Tempat, tanggal lahir"
                                        nilai={[
                                            anak.tempatLahir,
                                            anak.tanggalLahir,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    />
                                    <Baris
                                        label="Umur"
                                        nilai={formatUmurTahunBulan(
                                            anak.umurBulan,
                                        )}
                                    />
                                    <Baris
                                        label="NIK"
                                        nilai={
                                            anak.nik && (
                                                <span className="tabular-nums">
                                                    {anak.nik}
                                                </span>
                                            )
                                        }
                                    />
                                    <Baris
                                        label="Punya Buku KIA"
                                        nilai={
                                            anak.punyaBukuKia === null
                                                ? 'Belum diisi'
                                                : anak.punyaBukuKia
                                                  ? 'Ya'
                                                  : 'Tidak'
                                        }
                                    />
                                </dl>
                            </Kartu>
                            <Kartu labelSeksi="Orang tua">
                                <dl className="divide-y divide-ink-200">
                                    <Baris
                                        label="Nama ibu"
                                        nilai={anak.namaIbu}
                                    />
                                    <Baris
                                        label="NIK ibu"
                                        nilai={anak.nikIbu}
                                    />
                                    <Baris
                                        label="Nama ayah"
                                        nilai={anak.namaAyah}
                                    />
                                    <Baris
                                        label="NIK ayah"
                                        nilai={anak.nikAyah}
                                    />
                                    <Baris label="Nomor HP" nilai={anak.noHp} />
                                </dl>
                            </Kartu>
                            <Kartu labelSeksi="Alamat">
                                <dl className="divide-y divide-ink-200">
                                    <Baris label="Alamat" nilai={alamat} />
                                    <Baris label="Dusun" nilai={anak.dusun} />
                                </dl>
                            </Kartu>
                            {perubahanTerakhir && (
                                <p className="text-kecil text-ink-700">
                                    Diubah terakhir oleh{' '}
                                    {perubahanTerakhir.oleh},{' '}
                                    {perubahanTerakhir.pada}
                                </p>
                            )}
                            {bolehHapus && (
                                <Tombol
                                    varian="bahaya"
                                    className="self-start"
                                    onClick={() => setDialogHapus(true)}
                                >
                                    Hapus data anak
                                </Tombol>
                            )}
                        </div>
                    )}

                    <Dialog
                        terbuka={dialogHapus}
                        onTutup={tutupDialog}
                        judul={`Hapus data ${anak.nama}?`}
                        labelBahaya="Hapus"
                        bolehKonfirmasi={namaCocok}
                        memuat={hapus.processing}
                        onKonfirmasi={() =>
                            hapus.delete(hapusAnak.url(anak.id), {
                                preserveScroll: true,
                            })
                        }
                    >
                        <p>
                            Data dan seluruh riwayatnya dapat dipulihkan Ketua
                            Kader dalam 30 hari. Setelah itu terhapus permanen.
                        </p>
                        <IsianTeks
                            id="isian-konfirmasi"
                            label={`Ketik nama anak untuk memastikan: ${anak.nama}`}
                            autoComplete="off"
                            value={hapus.data.konfirmasi}
                            onChange={(event) =>
                                hapus.setData('konfirmasi', event.target.value)
                            }
                            galat={hapus.errors.konfirmasi}
                        />
                    </Dialog>

                    {tab === 'grafik' && (
                        <div
                            {...propsPanel('grafik')}
                            className="flex flex-col gap-4"
                        >
                            {grafik === null ? (
                                <Banner
                                    varian="info"
                                    judul="Belum ada pengukuran"
                                >
                                    Grafik tampil setelah anak diukur di Meja 2
                                    atau riwayat dari Buku KIA dimasukkan.
                                </Banner>
                            ) : (
                                // Kepala kartu DESIGN 7.1: garis atas 6 px warna
                                // jenis kelamin, nama, indeks, lencana.
                                <Kartu
                                    aria-label="Grafik pertumbuhan"
                                    className={clsx(
                                        'flex flex-col gap-3 border-t-6',
                                        laki
                                            ? 'border-t-boy-700'
                                            : 'border-t-girl-700',
                                    )}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-judul-2 text-ink-900">
                                                {anak.nama}
                                            </p>
                                            <p className="text-kecil text-ink-700">
                                                {grafik.daftar[tabGrafik].judul}
                                            </p>
                                        </div>
                                        <span
                                            className={clsx(
                                                'rounded-pill px-3 py-1 text-kecil font-bold whitespace-nowrap',
                                                laki
                                                    ? 'bg-boy-100 text-boy-700'
                                                    : 'bg-girl-100 text-girl-700',
                                            )}
                                        >
                                            {laki ? 'Laki-laki' : 'Perempuan'}
                                        </span>
                                    </div>
                                    <Tab<IndeksGrafik>
                                        label="Jenis grafik"
                                        aktif={tabGrafik}
                                        onUbah={setTabGrafik}
                                        varian="pil"
                                        item={[
                                            { id: 'kms', label: 'KMS' },
                                            { id: 'bb_u', label: 'BB/U' },
                                            {
                                                id: 'pb_tb_u',
                                                label: grafik.pakaiPanjang
                                                    ? 'PB/U'
                                                    : 'TB/U',
                                            },
                                            {
                                                id: 'bb_pb_tb',
                                                label: grafik.pakaiPanjang
                                                    ? 'BB/PB'
                                                    : 'BB/TB',
                                            },
                                            { id: 'imt_u', label: 'IMT/U' },
                                            { id: 'lk_u', label: 'LK' },
                                        ]}
                                    />
                                    <div
                                        id={`panel-${tabGrafik}`}
                                        role="tabpanel"
                                        aria-labelledby={`tab-${tabGrafik}`}
                                    >
                                        <GrafikPertumbuhan
                                            data={grafik.daftar[tabGrafik]}
                                            indeks={tabGrafik}
                                            jenisKelamin={anak.jenisKelamin}
                                        />
                                    </div>
                                </Kartu>
                            )}
                            <Kartu labelSeksi="Hasil ukur">
                                {pengukuran.length === 0 ? (
                                    <p className="py-2 text-teks text-ink-700">
                                        Belum ada pengukuran.
                                    </p>
                                ) : (
                                    <div className="-mx-4 overflow-x-auto">
                                        <table className="w-full min-w-[560px] text-left text-kecil">
                                            <caption className="sr-only">
                                                Hasil ukur {anak.nama}, terbaru
                                                di atas
                                            </caption>
                                            <thead>
                                                <tr className="border-b border-ink-200 text-ink-700">
                                                    <th
                                                        scope="col"
                                                        className="sticky left-0 bg-white px-4 py-2"
                                                    >
                                                        Tanggal
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2"
                                                    >
                                                        Umur
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-right"
                                                    >
                                                        BB
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-right"
                                                    >
                                                        PB/TB
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-right"
                                                    >
                                                        LiLA
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-2 py-2 text-right"
                                                    >
                                                        LK
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-4 py-2"
                                                    >
                                                        N/T
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-ink-200 text-ink-900 tabular-nums">
                                                {pengukuran.map((ukur) => (
                                                    <tr key={ukur.id}>
                                                        <th
                                                            scope="row"
                                                            className="sticky left-0 bg-white px-4 py-3 font-bold"
                                                        >
                                                            {ukur.tanggal}
                                                            {ukur.dariBukuKia && (
                                                                <TandaBukuKia />
                                                            )}
                                                        </th>
                                                        <td className="px-2 py-3">
                                                            {ukur.umurBulan} bln
                                                        </td>
                                                        <td className="px-2 py-3 text-right">
                                                            {nilaiUkur(
                                                                ukur.bb,
                                                                'kg',
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-3 text-right">
                                                            {nilaiUkur(
                                                                ukur.pbTb,
                                                                'cm',
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-3 text-right">
                                                            {nilaiUkur(
                                                                ukur.lila,
                                                                'cm',
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-3 text-right">
                                                            {nilaiUkur(
                                                                ukur.lk,
                                                                'cm',
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {ukur.statusNt ===
                                                                'N' ||
                                                            ukur.statusNt ===
                                                                'T'
                                                                ? ukur.statusNt
                                                                : KOSONG}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Kartu>
                        </div>
                    )}

                    {tab === 'riwayat' && (
                        <div
                            {...propsPanel('riwayat')}
                            className="flex flex-col gap-4"
                        >
                            <TombolTautan
                                href={riwayatBukuKia(anak.id)}
                                varian="sekunder"
                                lebarPenuh
                            >
                                + Tambah dari Buku KIA
                            </TombolTautan>
                            <Kartu labelSeksi="Layanan">
                                {layanan.length === 0 ? (
                                    <p className="py-2 text-teks text-ink-700">
                                        Belum ada imunisasi, vitamin A, atau
                                        obat cacing tercatat.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-ink-200">
                                        {layanan.map((satu) => (
                                            <li
                                                key={satu.id}
                                                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                                            >
                                                <span className="text-teks text-ink-900">
                                                    <span className="font-bold">
                                                        {satu.jenis}
                                                    </span>{' '}
                                                    · {satu.detail}
                                                    {satu.dariBukuKia && (
                                                        <TandaBukuKia />
                                                    )}
                                                </span>
                                                <span className="text-kecil text-ink-700">
                                                    {satu.tanggal}
                                                    {satu.nomorBatch &&
                                                        ` · Batch ${satu.nomorBatch}`}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Kartu>
                            <Kartu labelSeksi="Kunjungan">
                                {kunjungan.length === 0 ? (
                                    <p className="py-2 text-teks text-ink-700">
                                        Belum pernah datang ke posyandu.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-ink-200">
                                        {kunjungan.map((satu) => (
                                            <li
                                                key={satu.id}
                                                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                                            >
                                                <span className="text-teks font-bold text-ink-900">
                                                    {satu.tanggal}
                                                </span>
                                                <span className="text-kecil text-ink-700">
                                                    #
                                                    {String(
                                                        satu.nomorAntrean,
                                                    ).padStart(2, '0')}{' '}
                                                    · {satu.keadaan}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Kartu>
                        </div>
                    )}

                    <KakiTombol denganNavigasi={false}>
                        <TombolTautan href={ubah(anak.id)} lebarPenuh>
                            Ubah data
                        </TombolTautan>
                    </KakiTombol>
                </main>
            </div>
        </>
    );
}
