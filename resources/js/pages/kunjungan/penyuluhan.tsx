import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipStatus } from '@/components/dasar/chip-status';
import type { VarianChip } from '@/components/dasar/chip-status';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { AreaTeks, IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { Kartu } from '@/components/dasar/kartu';
import { KotakCentangLayanan } from '@/components/dasar/kotak-centang-layanan';
import { SheetBawah } from '@/components/dasar/sheet-bawah';
import { Tab } from '@/components/dasar/tab';
import { Tombol } from '@/components/dasar/tombol';
import { DetailDuaKolom } from '@/components/detail-dua-kolom';
import { GrafikPertumbuhan } from '@/components/grafik-pertumbuhan';
import { useDaftarLayarAnak } from '@/hooks/use-layar-anak';
import { formatSatuDesimal, formatZ } from '@/lib/grafik';
import type { DataGrafik, IndeksGrafik } from '@/lib/grafik';
import { teksKbm } from '@/lib/perbandingan';
import { formatUmurBulan } from '@/lib/umur';
import { lepas, selesai, tunda } from '@/routes/kunjungan';
import type { HeaderKunjungan, RiwayatLayanan } from '@/types';

type StatusGizi = {
    indeks: string;
    label: string;
    kode: string;
    kategori: string;
    varian: VarianChip;
    tingkat: number;
    zScore: number | null;
    nilai: number | null;
    satuan: string;
};

type Opsi = { kode: string; label: string };

type Materi = { kode: string; nama: string; kondisi: string };

type Isian = {
    pengamatan_fisik: string[];
    pengamatan_motorik: string[];
    materi: string[];
    catatan_tindak_lanjut: string;
};

type Props = {
    anak: HeaderKunjungan;
    ringkasan: {
        bb: number | null;
        pbTb: number | null;
        caraUkur: 'telentang' | 'berdiri' | null;
        lila: number | null;
        lk: number | null;
        imt: number | null;
    } | null;
    perluUkurUlang: boolean;
    statusGizi: StatusGizi[];
    penimbangan: {
        status: 'N' | 'T' | 'tidak_ditimbang' | null;
        kenaikanGram: number | null;
        kbmGram: number | null;
    } | null;
    rujukanKms: string[];
    stunting: {
        hasil:
            | 'normal'
            | 'berisiko_stunting'
            | 'stunting'
            | 'diprediksi_berisiko';
        judul: string;
        alasan: string | null;
        tindakan: string;
    };
    banner: {
        varian: 'bahaya' | 'peringatan';
        judul: string;
        isi: string;
    } | null;
    grafik: {
        jenisKelamin: 'L' | 'P';
        tabAwal: IndeksGrafik;
        pakaiPanjang: boolean;
        jumlahTitik: number;
        daftar: Record<IndeksGrafik, DataGrafik>;
    } | null;
    layanan: RiwayatLayanan[];
    imunisasiTertunda: { kode: string; nama: string; alasan: string }[];
    isiPiringku: {
        otomatis: boolean;
        porsi: { bahan: string; porsi: string; contoh: string }[];
    };
    materi: {
        daftar: Materi[];
        rekomendasi: string[];
        pemicuPengamatan: { fisik: string; motorik: string };
    };
    pengamatan: { fisik: Opsi[]; motorik: Opsi[] };
    catatanMeja4: string | null;
    alasanWajib: string[];
    nilaiAwal: Partial<Isian> | null;
};

const STATUS_NT: Record<string, { teks: string; varian: VarianChip }> = {
    N: { teks: 'N · Naik', varian: 'normal' },
    T: { teks: 'T · Tidak naik', varian: 'bahaya' },
    tidak_ditimbang: { teks: 'Tidak ditimbang bulan lalu', varian: 'info' },
};

const VARIAN_STUNTING: Record<Props['stunting']['hasil'], VarianChip> = {
    normal: 'normal',
    berisiko_stunting: 'waspada',
    diprediksi_berisiko: 'waspada',
    stunting: 'bahaya',
};

function tambahSekaliSaja(daftar: string[], nilai: string): string[] {
    return daftar.includes(nilai) ? daftar : [...daftar, nilai];
}

/**
 * S12 Meja 5 Penyuluhan (FR-37 sampai FR-46; DESIGN 5.7, 6.4, Gambar 6
 * dan 10): banner risiko, status gizi per indeks, grafik, status N/T,
 * layanan, deteksi stunting, materi, Isi Piringku, catatan tindak lanjut.
 */
export default function Penyuluhan(props: Props) {
    const {
        anak,
        ringkasan,
        perluUkurUlang,
        statusGizi,
        penimbangan,
        rujukanKms,
        stunting,
        banner,
        grafik,
        layanan,
        imunisasiTertunda,
        isiPiringku,
        materi,
        pengamatan,
        catatanMeja4,
        alasanWajib,
        nilaiAwal,
    } = props;
    const { errors } = usePage().props;
    const form = useForm<Isian>({
        pengamatan_fisik: nilaiAwal?.pengamatan_fisik ?? [],
        pengamatan_motorik: nilaiAwal?.pengamatan_motorik ?? [],
        materi: nilaiAwal?.materi ?? materi.rekomendasi,
        catatan_tindak_lanjut: nilaiAwal?.catatan_tindak_lanjut ?? '',
    });
    const [tab, setTab] = useState<IndeksGrafik>(grafik?.tabAwal ?? 'kms');
    const [materiBaru, setMateriBaru] = useState('');
    const [tampilkanPiringku, setTampilkanPiringku] = useState(
        isiPiringku.otomatis,
    );
    const [sheetLayanan, setSheetLayanan] = useState(false);
    const [sheetMateriLain, setSheetMateriLain] = useState(false);

    useDaftarLayarAnak({
        adaPerubahan: () => form.isDirty,
        draf: () => form.data,
    });

    const wajib = alasanWajib.length > 0;
    const catatanKosong = form.data.catatan_tindak_lanjut.trim() === '';
    const belumBolehSelesai = wajib && catatanKosong;

    const keterangan = [
        anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        formatUmurBulan(anak.umurBulan),
        `Antrean #${String(anak.nomorAntrean).padStart(2, '0')}`,
    ].join(' · ');

    // Materi direkomendasikan = hasil kunjungan + pemicu pengamatan kader.
    const rekomendasi = new Set(materi.rekomendasi);

    if (form.data.pengamatan_fisik.length > 0) {
        rekomendasi.add(materi.pemicuPengamatan.fisik);
    }

    if (form.data.pengamatan_motorik.length > 0) {
        rekomendasi.add(materi.pemicuPengamatan.motorik);
    }

    const kodeStandar = new Set(materi.daftar.map((satu) => satu.kode));
    const materiDirekomendasikan = materi.daftar.filter((satu) =>
        rekomendasi.has(satu.kode),
    );
    const materiLainDipilih = materi.daftar.filter(
        (satu) =>
            !rekomendasi.has(satu.kode) && form.data.materi.includes(satu.kode),
    );
    const materiLainTersedia = materi.daftar.filter(
        (satu) =>
            !rekomendasi.has(satu.kode) &&
            !form.data.materi.includes(satu.kode),
    );
    const materiTambahan = form.data.materi.filter(
        (satu) => !kodeStandar.has(satu),
    );

    function ubahMateri(kode: string, dicentang: boolean) {
        form.setData(
            'materi',
            dicentang
                ? tambahSekaliSaja(form.data.materi, kode)
                : form.data.materi.filter((satu) => satu !== kode),
        );
    }

    function ubahPengamatan(
        jenis: 'fisik' | 'motorik',
        kode: string,
        dicentang: boolean,
    ) {
        const kunci =
            jenis === 'fisik' ? 'pengamatan_fisik' : 'pengamatan_motorik';
        const sekarang = form.data[kunci];
        const berikutnya = dicentang
            ? tambahSekaliSaja(sekarang, kode)
            : sekarang.filter((satu) => satu !== kode);

        // Pengamatan pertama ikut mencentang materinya (PRD Tabel 32).
        const materiBerikutnya =
            dicentang && sekarang.length === 0
                ? tambahSekaliSaja(
                      form.data.materi,
                      materi.pemicuPengamatan[jenis],
                  )
                : form.data.materi;

        form.setData({
            ...form.data,
            [kunci]: berikutnya,
            materi: materiBerikutnya,
        });
    }

    function tambahMateri() {
        const teks = materiBaru.trim();

        if (teks === '') {
            return;
        }

        form.setData('materi', tambahSekaliSaja(form.data.materi, teks));
        setMateriBaru('');
    }

    function kirim(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (belumBolehSelesai) {
            document
                .querySelector<HTMLTextAreaElement>(
                    '[name="catatan_tindak_lanjut"]',
                )
                ?.focus();

            return;
        }

        form.post(selesai.url(anak.id));
    }

    const status = penimbangan?.status ? STATUS_NT[penimbangan.status] : null;
    const layananHariIni = layanan.filter(
        (satu) => satu.tanggal === layanan[0]?.tanggal && !satu.dariBukuKia,
    );
    const galatMateri = Object.entries(
        form.errors as Record<string, string | undefined>,
    ).find(
        ([kunci]) =>
            kunci.startsWith('materi') || kunci.startsWith('pengamatan'),
    )?.[1];

    const tabGrafik: { id: IndeksGrafik; label: string }[] = [
        { id: 'kms', label: 'KMS' },
        { id: 'bb_u', label: 'BB/U' },
        { id: 'pb_tb_u', label: grafik?.pakaiPanjang ? 'PB/U' : 'TB/U' },
        { id: 'bb_pb_tb', label: grafik?.pakaiPanjang ? 'BB/PB' : 'BB/TB' },
        { id: 'imt_u', label: 'IMT/U' },
        { id: 'lk_u', label: 'LK' },
    ];

    return (
        <>
            <Head title={`Meja 5 · ${anak.nama}`} />
            <form
                noValidate
                onSubmit={kirim}
                className="flex min-h-dvh flex-col bg-paper [--offset-toast:96px]"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={keterangan}
                    jenisKelamin={anak.jenisKelamin}
                    meja={5}
                    kembali={lepas(anak.id)}
                    selebarPanel
                />

                <div className="@container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-5 tablet:px-5 panel:mx-0 panel:max-w-6xl panel:px-6">
                    {errors.kunjungan && (
                        <Banner varian="bahaya">{errors.kunjungan}</Banner>
                    )}
                    {galatMateri && (
                        <Banner varian="bahaya">{galatMateri}</Banner>
                    )}

                    {/* Banner risiko paling serius di atas (DESIGN 5.7 langkah 1). */}
                    {banner && (
                        <Banner varian={banner.varian} judul={banner.judul}>
                            {banner.isi}
                        </Banner>
                    )}

                    <DetailDuaKolom
                        kiriLebar
                        className="gap-4"
                        kiri={
                            <>
                                {ringkasan === null ? (
                                    <Banner
                                        varian="info"
                                        judul="Belum ada hasil ukur hari ini"
                                    >
                                        Status gizi dan grafik tampil setelah
                                        anak diukur di Meja 2.
                                    </Banner>
                                ) : (
                                    <Kartu labelSeksi="Hasil ukur hari ini">
                                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 py-1 tablet:grid-cols-3">
                                            {[
                                                [
                                                    'Berat badan',
                                                    ringkasan.bb,
                                                    'kg',
                                                ],
                                                [
                                                    ringkasan.caraUkur ===
                                                    'telentang'
                                                        ? 'Panjang badan'
                                                        : ringkasan.caraUkur ===
                                                            'berdiri'
                                                          ? 'Tinggi badan'
                                                          : 'PB/TB',
                                                    ringkasan.pbTb,
                                                    'cm',
                                                ],
                                                ['IMT', ringkasan.imt, 'kg/m²'],
                                                ['LiLA', ringkasan.lila, 'cm'],
                                                [
                                                    'Lingkar kepala',
                                                    ringkasan.lk,
                                                    'cm',
                                                ],
                                            ].map(([label, nilai, satuan]) => (
                                                <div
                                                    key={label as string}
                                                    className="flex flex-col"
                                                >
                                                    <dt className="text-kecil text-ink-700">
                                                        {label}
                                                    </dt>
                                                    <dd className="text-judul-2 text-ink-900 tabular-nums">
                                                        {nilai === null ? (
                                                            <>
                                                                <span aria-hidden="true">
                                                                    —
                                                                </span>
                                                                <span className="sr-only">
                                                                    tidak diukur
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {formatSatuDesimal(
                                                                    nilai as number,
                                                                )}{' '}
                                                                <span className="text-kecil font-bold">
                                                                    {satuan}
                                                                </span>
                                                            </>
                                                        )}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </Kartu>
                                )}

                                {statusGizi.length > 0 && (
                                    <Kartu aria-label="Status gizi">
                                        <ul className="divide-y divide-ink-200">
                                            {statusGizi.map((satu) => (
                                                <li
                                                    key={satu.indeks}
                                                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3"
                                                >
                                                    <span className="text-teks text-ink-900">
                                                        {satu.label}
                                                    </span>
                                                    <ChipStatus
                                                        varian={satu.varian}
                                                    >
                                                        {satu.kategori}
                                                        {satu.zScore !== null &&
                                                            ` · z ${formatZ(satu.zScore)}`}
                                                        {satu.indeks ===
                                                            'lila' &&
                                                            satu.nilai !==
                                                                null &&
                                                            ` · ${formatSatuDesimal(satu.nilai)} cm`}
                                                    </ChipStatus>
                                                </li>
                                            ))}
                                        </ul>
                                    </Kartu>
                                )}

                                {grafik && !perluUkurUlang && (
                                    <Kartu
                                        aria-label="Grafik pertumbuhan"
                                        className="flex flex-col gap-3"
                                    >
                                        <Tab
                                            label="Jenis grafik"
                                            item={tabGrafik}
                                            aktif={tab}
                                            onUbah={setTab}
                                            className="-mx-4"
                                        />
                                        <div
                                            id={`panel-${tab}`}
                                            role="tabpanel"
                                            aria-labelledby={`tab-${tab}`}
                                        >
                                            <p className="mb-2 text-kecil font-bold text-ink-900">
                                                {grafik.daftar[tab].judul}
                                            </p>
                                            <GrafikPertumbuhan
                                                data={grafik.daftar[tab]}
                                                indeks={tab}
                                                jenisKelamin={
                                                    grafik.jenisKelamin
                                                }
                                            />
                                        </div>
                                    </Kartu>
                                )}

                                <Kartu labelSeksi="Status penimbangan (KMS)">
                                    {status ? (
                                        <div className="flex flex-wrap items-center gap-3 py-1">
                                            <ChipStatus varian={status.varian}>
                                                {status.teks}
                                            </ChipStatus>
                                            {penimbangan?.kenaikanGram !=
                                                null &&
                                                penimbangan.kbmGram != null && (
                                                    <span className="text-teks text-ink-900">
                                                        {teksKbm(
                                                            penimbangan.kenaikanGram,
                                                            penimbangan.kbmGram,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    ) : (
                                        <p className="py-1 text-teks text-ink-700">
                                            Belum ada penimbangan hari ini.
                                        </p>
                                    )}
                                    {rujukanKms.length > 0 && (
                                        <p className="pt-2 text-teks font-bold text-status-bahaya-teks">
                                            Rujuk:{' '}
                                            {rujukanKms
                                                .join(', ')
                                                .toLowerCase()}
                                            .
                                        </p>
                                    )}
                                    <p className="pt-2 text-keterangan text-ink-600">
                                        Buku KIA: rujuk bila berat badan tidak
                                        naik (T), di bawah garis merah, atau di
                                        atas garis oranye.
                                    </p>
                                </Kartu>

                                <Kartu labelSeksi="Deteksi risiko stunting">
                                    <div className="flex flex-col gap-2 py-1">
                                        <div>
                                            <ChipStatus
                                                varian={
                                                    VARIAN_STUNTING[
                                                        stunting.hasil
                                                    ]
                                                }
                                            >
                                                {stunting.judul}
                                            </ChipStatus>
                                        </div>
                                        {stunting.alasan && (
                                            <p className="text-teks text-ink-900">
                                                {stunting.alasan}.
                                            </p>
                                        )}
                                        <p className="text-teks text-ink-900">
                                            <span className="font-bold">
                                                Tindakan:
                                            </span>{' '}
                                            {stunting.tindakan}.
                                        </p>
                                        <p className="text-keterangan text-ink-600">
                                            Hasil skrining, bukan diagnosis.
                                            Konfirmasi oleh tenaga kesehatan.
                                        </p>
                                    </div>
                                </Kartu>

                                <Kartu labelSeksi="Layanan">
                                    <div className="flex flex-col gap-3 py-1">
                                        <div>
                                            <p className="text-kecil font-bold text-ink-900">
                                                Imunisasi yang masih harus
                                                dikejar
                                            </p>
                                            {imunisasiTertunda.length === 0 ? (
                                                <p className="text-teks text-ink-700">
                                                    Tidak ada.
                                                </p>
                                            ) : (
                                                <ul className="flex flex-col gap-1">
                                                    {imunisasiTertunda.map(
                                                        (satu) => (
                                                            <li
                                                                key={satu.kode}
                                                                className="text-teks text-ink-900"
                                                            >
                                                                <span className="font-bold">
                                                                    {satu.nama}
                                                                </span>
                                                                <span className="text-ink-700">
                                                                    {' '}
                                                                    ·{' '}
                                                                    {
                                                                        satu.alasan
                                                                    }
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-kecil font-bold text-ink-900">
                                                Sudah diterima
                                            </p>
                                            {layanan.length === 0 ? (
                                                <p className="text-teks text-ink-700">
                                                    Belum ada layanan tercatat.
                                                </p>
                                            ) : (
                                                <ul className="flex flex-col gap-1">
                                                    {(layananHariIni.length > 0
                                                        ? layananHariIni
                                                        : layanan.slice(0, 3)
                                                    ).map((satu) => (
                                                        <li
                                                            key={satu.id}
                                                            className="text-teks text-ink-900"
                                                        >
                                                            <span className="font-bold">
                                                                {satu.detail}
                                                            </span>
                                                            <span className="text-ink-700">
                                                                {' '}
                                                                · {
                                                                    satu.jenis
                                                                } ·{' '}
                                                                {satu.tanggal}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {layanan.length > 0 && (
                                                <Tombol
                                                    varian="tersier"
                                                    className="-ml-2"
                                                    onClick={() =>
                                                        setSheetLayanan(true)
                                                    }
                                                >
                                                    Semua layanan (
                                                    {layanan.length})
                                                </Tombol>
                                            )}
                                        </div>
                                    </div>
                                </Kartu>
                            </>
                        }
                        kanan={
                            <>
                                <fieldset className="flex flex-col gap-3">
                                    <legend className="mb-3 text-label-seksi text-ink-600 uppercase">
                                        Pengamatan kader
                                    </legend>
                                    {pengamatan.fisik.map((satu) => (
                                        <KotakCentangLayanan
                                            key={`fisik-${satu.kode}`}
                                            nama={`fisik-${satu.kode}`}
                                            label={satu.label}
                                            alasan="Kondisi fisik"
                                            dicentang={form.data.pengamatan_fisik.includes(
                                                satu.kode,
                                            )}
                                            onUbah={(dicentang) =>
                                                ubahPengamatan(
                                                    'fisik',
                                                    satu.kode,
                                                    dicentang,
                                                )
                                            }
                                        />
                                    ))}
                                    {pengamatan.motorik.map((satu) => (
                                        <KotakCentangLayanan
                                            key={`motorik-${satu.kode}`}
                                            nama={`motorik-${satu.kode}`}
                                            label={satu.label}
                                            alasan="Perkembangan motorik"
                                            dicentang={form.data.pengamatan_motorik.includes(
                                                satu.kode,
                                            )}
                                            onUbah={(dicentang) =>
                                                ubahPengamatan(
                                                    'motorik',
                                                    satu.kode,
                                                    dicentang,
                                                )
                                            }
                                        />
                                    ))}
                                </fieldset>

                                <fieldset className="flex flex-col gap-3">
                                    <legend className="mb-3 text-label-seksi text-ink-600 uppercase">
                                        Materi penyuluhan
                                    </legend>
                                    {materiDirekomendasikan.length === 0 && (
                                        <p className="text-teks text-ink-700">
                                            Tidak ada materi khusus. Pilih atau
                                            tambah materi bila perlu.
                                        </p>
                                    )}
                                    {[
                                        ...materiDirekomendasikan,
                                        ...materiLainDipilih,
                                    ].map((satu) => (
                                        <KotakCentangLayanan
                                            key={satu.kode}
                                            nama={`materi-${satu.kode}`}
                                            label={satu.nama}
                                            alasan={
                                                rekomendasi.has(satu.kode)
                                                    ? `Direkomendasikan · ${satu.kondisi}`
                                                    : satu.kondisi
                                            }
                                            dicentang={form.data.materi.includes(
                                                satu.kode,
                                            )}
                                            onUbah={(dicentang) =>
                                                ubahMateri(satu.kode, dicentang)
                                            }
                                        />
                                    ))}
                                    {materiTambahan.map((teks) => (
                                        <KotakCentangLayanan
                                            key={`lain-${teks}`}
                                            nama={`materi-lain-${teks}`}
                                            label={teks}
                                            alasan="Ditambahkan kader"
                                            dicentang
                                            onUbah={() =>
                                                ubahMateri(teks, false)
                                            }
                                        />
                                    ))}
                                    {materiLainTersedia.length > 0 && (
                                        <div>
                                            <Tombol
                                                varian="tersier"
                                                className="-ml-2"
                                                onClick={() =>
                                                    setSheetMateriLain(true)
                                                }
                                            >
                                                Pilih materi lain
                                            </Tombol>
                                        </div>
                                    )}
                                    <div className="flex items-end gap-2">
                                        <IsianTeks
                                            label="Tambah materi"
                                            name="materi_baru"
                                            maxLength={150}
                                            autoComplete="off"
                                            value={materiBaru}
                                            onChange={(event) =>
                                                setMateriBaru(
                                                    event.target.value,
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    tambahMateri();
                                                }
                                            }}
                                            className="min-w-0 flex-1"
                                        />
                                        <Tombol
                                            varian="sekunder"
                                            className="shrink-0"
                                            disabled={materiBaru.trim() === ''}
                                            onClick={tambahMateri}
                                        >
                                            Tambah
                                        </Tombol>
                                    </div>
                                </fieldset>

                                <Kartu labelSeksi="Isi Piringku ibu menyusui">
                                    {tampilkanPiringku ? (
                                        <>
                                            <p className="py-1 text-kecil text-ink-700">
                                                Porsi makan ibu menyusui (0–12
                                                bulan) untuk sehari, sesuai Buku
                                                KIA.
                                            </p>
                                            <div className="-mx-4 overflow-x-auto">
                                                <table className="w-full min-w-[420px] text-left text-kecil">
                                                    <caption className="sr-only">
                                                        Isi Piringku ibu
                                                        menyusui
                                                    </caption>
                                                    <thead>
                                                        <tr className="border-b border-ink-200 text-ink-700">
                                                            <th
                                                                scope="col"
                                                                className="px-4 py-2"
                                                            >
                                                                Bahan makanan
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-2 py-2 text-right"
                                                            >
                                                                Porsi
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-4 py-2"
                                                            >
                                                                Contoh satu
                                                                porsi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {isiPiringku.porsi.map(
                                                            (satu) => (
                                                                <tr
                                                                    key={
                                                                        satu.bahan
                                                                    }
                                                                    className="border-b border-ink-200 align-top text-ink-900"
                                                                >
                                                                    <th
                                                                        scope="row"
                                                                        className="px-4 py-2 font-bold"
                                                                    >
                                                                        {
                                                                            satu.bahan
                                                                        }
                                                                    </th>
                                                                    <td className="px-2 py-2 text-right tabular-nums">
                                                                        {
                                                                            satu.porsi
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {
                                                                            satu.contoh
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {!isiPiringku.otomatis && (
                                                <Tombol
                                                    varian="tersier"
                                                    className="-ml-2"
                                                    onClick={() =>
                                                        setTampilkanPiringku(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Sembunyikan
                                                </Tombol>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-1 py-1">
                                            <p className="text-teks text-ink-700">
                                                Tampil otomatis untuk anak di
                                                bawah 24 bulan.
                                            </p>
                                            <div>
                                                <Tombol
                                                    varian="tersier"
                                                    className="-ml-2"
                                                    onClick={() =>
                                                        setTampilkanPiringku(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    Tampilkan untuk ibu yang
                                                    masih menyusui
                                                </Tombol>
                                            </div>
                                        </div>
                                    )}
                                </Kartu>

                                <Kartu labelSeksi="Catatan untuk penyuluhan dari Meja 4">
                                    <p className="py-1 text-teks whitespace-pre-line text-ink-900">
                                        {catatanMeja4 ?? 'Tidak ada catatan.'}
                                    </p>
                                </Kartu>

                                <AreaTeks
                                    label="Catatan tindak lanjut"
                                    wajib={wajib}
                                    rows={3}
                                    name="catatan_tindak_lanjut"
                                    maxLength={500}
                                    value={form.data.catatan_tindak_lanjut}
                                    onChange={(event) =>
                                        form.setData(
                                            'catatan_tindak_lanjut',
                                            event.target.value,
                                        )
                                    }
                                    petunjuk={
                                        wajib
                                            ? `Wajib karena: ${alasanWajib.join('; ')}.`
                                            : 'Opsional.'
                                    }
                                    galat={form.errors.catatan_tindak_lanjut}
                                    placeholder="Contoh: rujuk ke puskesmas, kontrol ulang bulan depan"
                                />

                                {/* Petunjuk ikut menempel bersama tombol, dan
                                    tombol tetap bisa difokus (aria-disabled)
                                    agar alasannya terbaca (DESIGN 5.7). */}
                                <KakiTombol
                                    denganNavigasi={false}
                                    petunjuk={
                                        belumBolehSelesai && (
                                            <p
                                                id="petunjuk-selesai"
                                                className="pb-2 text-keterangan font-bold text-status-bahaya-teks"
                                            >
                                                Isi catatan tindak lanjut dulu
                                                sebelum menekan Selesai.
                                            </p>
                                        )
                                    }
                                >
                                    <Tombol
                                        varian="sekunder"
                                        className="shrink-0"
                                        onClick={() =>
                                            router.post(tunda.url(anak.id), {
                                                draf: form.data,
                                            })
                                        }
                                    >
                                        Tunda
                                    </Tombol>
                                    <Tombol
                                        type="submit"
                                        lebarPenuh
                                        memuat={form.processing}
                                        aria-disabled={
                                            belumBolehSelesai || undefined
                                        }
                                        aria-describedby={
                                            belumBolehSelesai
                                                ? 'petunjuk-selesai'
                                                : undefined
                                        }
                                        className="aria-disabled:cursor-not-allowed aria-disabled:bg-ink-200 aria-disabled:text-ink-500"
                                    >
                                        Selesai
                                    </Tombol>
                                </KakiTombol>
                            </>
                        }
                    />
                </div>
            </form>

            <SheetBawah
                terbuka={sheetLayanan}
                onTutup={() => setSheetLayanan(false)}
                judul="Semua layanan"
            >
                <ul className="flex flex-col divide-y divide-ink-200">
                    {layanan.map((satu) => (
                        <li
                            key={satu.id}
                            className="flex flex-col py-3 text-teks text-ink-900"
                        >
                            <span className="font-bold">{satu.detail}</span>
                            <span className="text-kecil text-ink-700">
                                {satu.jenis} · {satu.tanggal}
                                {satu.nomorBatch &&
                                    ` · batch ${satu.nomorBatch}`}
                                {satu.dariBukuKia && ' · dari Buku KIA'}
                            </span>
                        </li>
                    ))}
                </ul>
            </SheetBawah>

            <SheetBawah
                terbuka={sheetMateriLain}
                onTutup={() => setSheetMateriLain(false)}
                judul="Pilih materi lain"
            >
                <ul className="flex flex-col gap-3">
                    {materiLainTersedia.map((satu) => (
                        <li key={satu.kode}>
                            <Tombol
                                varian="sekunder"
                                lebarPenuh
                                className="h-auto min-h-control-h py-3 text-left"
                                onClick={() => {
                                    ubahMateri(satu.kode, true);
                                    setSheetMateriLain(false);
                                }}
                            >
                                {satu.nama}
                            </Tombol>
                        </li>
                    ))}
                </ul>
            </SheetBawah>
        </>
    );
}
