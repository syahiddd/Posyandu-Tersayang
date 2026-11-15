import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Baby,
    BookOpen,
    CalendarDays,
    ClipboardList,
    Eye,
    History,
    LineChart,
    ListChecks,
    MessageSquareText,
    Ruler,
    ShieldAlert,
    Sparkles,
    Stethoscope,
    Syringe,
    TrendingUp,
    Utensils,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipStatus } from '@/components/dasar/chip-status';
import type { VarianChip } from '@/components/dasar/chip-status';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { AreaTeks, IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KotakCentangLayanan } from '@/components/dasar/kotak-centang-layanan';
import { Seksi } from '@/components/dasar/seksi';
import { SheetBawah } from '@/components/dasar/sheet-bawah';
import { Tab } from '@/components/dasar/tab';
import { Tombol, TombolTautan } from '@/components/dasar/tombol';
import { DetailDuaKolom } from '@/components/detail-dua-kolom';
import { GrafikPertumbuhan } from '@/components/grafik-pertumbuhan';
import { useDaftarLayarAnak } from '@/hooks/use-layar-anak';
import { formatSatuDesimal, formatZ } from '@/lib/grafik';
import type { DataGrafik, IndeksGrafik } from '@/lib/grafik';
import { teksKbm } from '@/lib/perbandingan';
import { formatUmurBulan } from '@/lib/umur';
import { lepas, selesai, tunda } from '@/routes/kunjungan';
import { panduanKia } from '@/routes';
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

/** Tindak lanjut satu kategori status gizi, digabung anjuran sesuai umur. */
type TindakLanjut = {
    indeks: string;
    label: string;
    kode: string;
    kategori: string;
    varian: VarianChip;
    tingkat: 'rujuk' | 'tindak_lanjut' | 'pantau';
    tindakan: string[];
    sumber: string;
    anjuran: string[];
    halamanAnjuran: string | null;
};

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
    /** Tanggal kunjungan yang sedang dilayani, contoh "14 Nov 2026". */
    hariIni: string;
    /** Catatan Meja 4, termasuk alasan imunisasi tidak diberikan. */
    catatanPelayanan: string | null;
    /** Tiga penimbangan sebelum hari ini, terbaru lebih dulu. */
    riwayatPenimbangan: {
        tanggal: string;
        umurBulan: number;
        bb: number | null;
        pbTb: number | null;
        lila: number | null;
        lk: number | null;
        dariBukuKia: boolean;
    }[];
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
    tindakLanjut: TindakLanjut[];
    anjuranUmur: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        anjuran: string[];
    } | null;
    tandaBahaya: {
        dari: number;
        sampai: number;
        label: string;
        halaman: string;
        daftar: string[];
    } | null;
    asiEksklusif: {
        relevan: boolean;
        hariIni: boolean | null;
        terakhir: { nilai: boolean; tanggal: string } | null;
        judul: string;
        halaman: string;
    };
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
    alasanWajib: string[];
    nilaiAwal: Partial<Isian> | null;
};

const STATUS_NT: Record<string, { teks: string; varian: VarianChip }> = {
    N: { teks: 'N · Naik', varian: 'normal' },
    T: { teks: 'T · Tidak naik', varian: 'bahaya' },
    tidak_ditimbang: { teks: 'Tidak ditimbang bulan lalu', varian: 'info' },
};

/** Label tingkat tindak lanjut dari config/kia.php. */
const LABEL_TINGKAT: Record<TindakLanjut['tingkat'], string> = {
    rujuk: 'Rujuk ke puskesmas',
    tindak_lanjut: 'Tindak lanjut di Posyandu',
    pantau: 'Pantau bulan depan',
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
 *
 * Susunan: banner risiko di paling atas, kartu ringkasan sekali lihat, lalu
 * dua kolom. Kolom kiri memuat hasil hitung dan rujukan Buku KIA (lebar lebih
 * besar untuk grafik), kolom kanan memuat isian kader: pengamatan, materi,
 * Isi Piringku, dan catatan tindak lanjut. Semua paragraf panjang dibuat
 * rata kanan-kiri (justify) agar mudah dibaca, dan seluruh ukuran teks
 * memakai skala baca biasa — tidak ada judul raksasa.
 */
export default function Penyuluhan(props: Props) {
    const {
        anak,
        ringkasan,
        hariIni,
        catatanPelayanan,
        riwayatPenimbangan,
        perluUkurUlang,
        statusGizi,
        penimbangan,
        rujukanKms,
        stunting,
        banner,
        tindakLanjut,
        anjuranUmur,
        tandaBahaya,
        asiEksklusif,
        grafik,
        layanan,
        imunisasiTertunda,
        isiPiringku,
        materi,
        pengamatan,
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
        (satu) => satu.tanggal === hariIni && !satu.dariBukuKia,
    );
    const imunisasiHariIni = layananHariIni.filter(
        (satu) => satu.jenis === 'Imunisasi',
    );
    const jenisKelaminTeks =
        anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan';
    const sudahDiukur =
        ringkasan === null
            ? []
            : [
                  ringkasan.bb !== null && 'Berat badan',
                  ringkasan.pbTb !== null &&
                      (ringkasan.caraUkur === 'telentang'
                          ? 'Panjang badan'
                          : ringkasan.caraUkur === 'berdiri'
                            ? 'Tinggi badan'
                            : 'PB/TB'),
                  ringkasan.lila !== null && 'LiLA',
                  ringkasan.lk !== null && 'Lingkar kepala',
              ].filter((satu): satu is string => Boolean(satu));
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
                className="toast-di-atas-kaki flex min-h-dvh flex-col bg-paper"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={keterangan}
                    jenisKelamin={anak.jenisKelamin}
                    meja={5}
                    kembali={lepas(anak.id)}
                    selebarPanel
                />

                <div className="@container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 tablet:px-5 panel:mx-0 panel:max-w-6xl panel:px-6">
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

                    <p className="flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-keterangan leading-relaxed text-ink-700">
                        <Stethoscope
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-brand-600"
                        />
                        <span className="text-justify">
                            Baca hasil hitung dan rujukan Buku KIA di kolom
                            kiri, lalu catat pengamatan dan materi yang
                            disampaikan ke ibu di kolom kanan. Tekan Selesai
                            untuk menutup kunjungan.
                        </span>
                    </p>

                    {/* Ringkasan sekali lihat: hasil hitung, yang sudah
                        dilakukan, dan imunisasi yang didapat hari ini. */}
                    <Seksi
                        judul="Ringkasan hasil kunjungan"
                        ikon={ClipboardList}
                        isiClassName="px-3.5 py-3"
                    >
                        <div className="grid gap-3 tablet:grid-cols-3">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                    Umur & jenis kelamin
                                </p>
                                <p className="text-teks font-bold text-ink-900">
                                    {formatUmurBulan(anak.umurBulan)}
                                </p>
                                <p className="text-kecil text-ink-700">
                                    {jenisKelaminTeks}
                                </p>
                                <p className="text-justify text-keterangan leading-relaxed text-ink-600">
                                    Acuan status gizi dan grafik: standar WHO
                                    sesuai umur dan jenis kelamin (Buku KIA).
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5 border-t border-brand-100 pt-3 tablet:border-t-0 tablet:border-l tablet:pt-0 tablet:pl-3.5">
                                <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                    Hasil perhitungan
                                </p>
                                {statusGizi.length === 0 ? (
                                    <p className="text-kecil leading-relaxed text-ink-700">
                                        {perluUkurUlang
                                            ? 'Perlu ukur ulang, status gizi belum dihitung.'
                                            : ringkasan === null
                                              ? 'Belum ada hasil ukur hari ini.'
                                              : 'Belum ada status gizi.'}
                                    </p>
                                ) : (
                                    <ul className="flex flex-wrap gap-1.5">
                                        {statusGizi.map((satu) => (
                                            <li key={satu.indeks}>
                                                <ChipStatus
                                                    varian={satu.varian}
                                                >
                                                    {satu.label} ·{' '}
                                                    {satu.kategori}
                                                </ChipStatus>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5 border-t border-brand-100 pt-3 tablet:border-t-0 tablet:border-l tablet:pt-0 tablet:pl-3.5">
                                <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                    Sudah dilakukan hari ini
                                </p>
                                <p className="text-kecil leading-relaxed text-ink-700">
                                    <span className="font-bold text-ink-900">
                                        Diukur:{' '}
                                    </span>
                                    {sudahDiukur.length > 0
                                        ? sudahDiukur.join(', ')
                                        : 'belum ada'}
                                </p>
                                <p className="text-kecil leading-relaxed text-ink-700">
                                    <span className="font-bold text-ink-900">
                                        Layanan:{' '}
                                    </span>
                                    {layananHariIni.length > 0
                                        ? layananHariIni
                                              .map((satu) => satu.detail)
                                              .join(', ')
                                        : 'belum ada'}
                                </p>
                                <p className="text-kecil leading-relaxed text-ink-700">
                                    <span className="font-bold text-ink-900">
                                        Imunisasi didapat:{' '}
                                    </span>
                                    {imunisasiHariIni.length > 0
                                        ? imunisasiHariIni
                                              .map((satu) => satu.detail)
                                              .join(', ')
                                        : 'belum ada'}
                                </p>
                                {catatanPelayanan && (
                                    <p className="text-justify text-kecil leading-relaxed text-ink-700">
                                        <span className="font-bold text-ink-900">
                                            Catatan pelayanan:{' '}
                                        </span>
                                        {catatanPelayanan}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Seksi>

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
                                    <Seksi
                                        judul="Hasil ukur hari ini"
                                        ikon={Ruler}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <dl className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                                            {(
                                                [
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
                                                    [
                                                        'IMT',
                                                        ringkasan.imt,
                                                        'kg/m²',
                                                    ],
                                                    [
                                                        'LiLA',
                                                        ringkasan.lila,
                                                        'cm',
                                                    ],
                                                    [
                                                        'Lingkar kepala',
                                                        ringkasan.lk,
                                                        'cm',
                                                    ],
                                                ] as const
                                            ).map(([label, nilai, satuan]) => (
                                                <div
                                                    key={label}
                                                    className="flex flex-col rounded-md border border-brand-100 bg-brand-50/60 px-2.5 py-2"
                                                >
                                                    <dt className="text-keterangan leading-snug text-ink-600">
                                                        {label}
                                                    </dt>
                                                    <dd className="text-teks font-bold text-ink-900 tabular-nums">
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
                                                                <span className="text-keterangan font-bold">
                                                                    {satuan}
                                                                </span>
                                                            </>
                                                        )}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </Seksi>
                                )}

                                {statusGizi.length > 0 && (
                                    <Seksi
                                        judul="Status gizi per indeks"
                                        ikon={Activity}
                                        isiClassName="px-3.5 py-0.5"
                                    >
                                        <ul className="divide-y divide-brand-100">
                                            {statusGizi.map((satu) => (
                                                <li
                                                    key={satu.indeks}
                                                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5"
                                                >
                                                    <span className="text-kecil font-bold text-ink-900">
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
                                    </Seksi>
                                )}

                                {grafik && !perluUkurUlang && (
                                    <Seksi
                                        judul="Grafik pertumbuhan"
                                        ikon={LineChart}
                                        isiClassName="flex flex-col gap-2.5 px-3.5 py-3"
                                    >
                                        <Tab
                                            label="Jenis grafik"
                                            item={tabGrafik}
                                            aktif={tab}
                                            onUbah={setTab}
                                            varian="pil"
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
                                    </Seksi>
                                )}

                                {riwayatPenimbangan.length > 0 && (
                                    <Seksi
                                        judul="Riwayat penimbangan"
                                        ikon={History}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                                            {riwayatPenimbangan.map((satu) => (
                                                <li
                                                    key={`${satu.tanggal}-${satu.umurBulan}`}
                                                    className="min-w-40 shrink-0 rounded-md border border-brand-100 bg-brand-50/60 px-2.5 py-2"
                                                >
                                                    <p className="text-keterangan text-ink-600 tabular-nums">
                                                        {satu.tanggal} ·{' '}
                                                        {satu.umurBulan} bln
                                                    </p>
                                                    <p className="text-kecil font-bold text-ink-900 tabular-nums">
                                                        BB{' '}
                                                        {formatSatuDesimal(
                                                            satu.bb,
                                                        )}{' '}
                                                        kg · PB/TB{' '}
                                                        {formatSatuDesimal(
                                                            satu.pbTb,
                                                        )}{' '}
                                                        cm
                                                    </p>
                                                    <p className="text-keterangan text-ink-600 tabular-nums">
                                                        LiLA{' '}
                                                        {formatSatuDesimal(
                                                            satu.lila,
                                                        )}{' '}
                                                        cm · LK{' '}
                                                        {formatSatuDesimal(
                                                            satu.lk,
                                                        )}{' '}
                                                        cm
                                                    </p>
                                                    {satu.dariBukuKia && (
                                                        <p className="text-keterangan text-brand-700">
                                                            Dari Buku KIA
                                                        </p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </Seksi>
                                )}

                                <Seksi
                                    judul="Status penimbangan (KMS)"
                                    ikon={TrendingUp}
                                    isiClassName="px-3.5 py-3"
                                >
                                    {status ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <ChipStatus varian={status.varian}>
                                                {status.teks}
                                            </ChipStatus>
                                            {penimbangan?.kenaikanGram !=
                                                null &&
                                                penimbangan.kbmGram != null && (
                                                    <span className="text-kecil leading-snug text-ink-700">
                                                        {teksKbm(
                                                            penimbangan.kenaikanGram,
                                                            penimbangan.kbmGram,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    ) : (
                                        <p className="text-kecil text-ink-700">
                                            Belum ada penimbangan hari ini.
                                        </p>
                                    )}
                                    {rujukanKms.length > 0 && (
                                        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-status-bahaya-latar px-2.5 py-2 text-kecil leading-relaxed font-bold text-status-bahaya-teks">
                                            <AlertTriangle
                                                aria-hidden="true"
                                                className="mt-0.5 size-3.5 shrink-0"
                                            />
                                            <span>
                                                Rujuk:{' '}
                                                {rujukanKms
                                                    .join(', ')
                                                    .toLowerCase()}
                                                .
                                            </span>
                                        </p>
                                    )}
                                    <p className="mt-2 text-justify text-keterangan leading-relaxed text-ink-600">
                                        Buku KIA: rujuk bila berat badan tidak
                                        naik (T), di bawah garis merah, atau di
                                        atas garis oranye.
                                    </p>
                                </Seksi>

                                <Seksi
                                    judul="Deteksi risiko stunting"
                                    ikon={ShieldAlert}
                                    isiClassName="px-3.5 py-3"
                                >
                                    <div className="flex flex-col gap-2">
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
                                            <p className="text-justify text-kecil leading-relaxed text-ink-900">
                                                {stunting.alasan}.
                                            </p>
                                        )}
                                        <p className="text-justify text-kecil leading-relaxed text-ink-900">
                                            <span className="font-bold">
                                                Tindakan:{' '}
                                            </span>
                                            {stunting.tindakan}.
                                        </p>
                                        <p className="text-justify text-keterangan leading-relaxed text-ink-600">
                                            Hasil skrining, bukan diagnosis.
                                            Konfirmasi oleh tenaga kesehatan.
                                        </p>
                                    </div>
                                </Seksi>

                                {tindakLanjut.length > 0 && (
                                    <Seksi
                                        judul="Tindak lanjut Buku KIA"
                                        ikon={ListChecks}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <div className="flex flex-col gap-3.5">
                                            {tindakLanjut.map((satu) => (
                                                <div
                                                    key={satu.kode}
                                                    className="flex flex-col gap-1.5"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <ChipStatus
                                                            varian={satu.varian}
                                                        >
                                                            {satu.label} ·{' '}
                                                            {satu.kategori}
                                                        </ChipStatus>
                                                        <span className="text-kecil font-bold text-ink-900">
                                                            {
                                                                LABEL_TINGKAT[
                                                                    satu.tingkat
                                                                ]
                                                            }
                                                        </span>
                                                    </div>
                                                    <ul className="flex list-disc flex-col gap-1 pl-5 text-justify text-kecil leading-relaxed text-ink-900">
                                                        {satu.tindakan.map(
                                                            (tindakan) => (
                                                                <li
                                                                    key={
                                                                        tindakan
                                                                    }
                                                                >
                                                                    {tindakan}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                    {satu.anjuran.length >
                                                        0 && (
                                                        <div>
                                                            <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                                                Anjuran sesuai
                                                                umur
                                                            </p>
                                                            <ul className="flex list-disc flex-col gap-1 pl-5 text-justify text-kecil leading-relaxed text-ink-900">
                                                                {satu.anjuran.map(
                                                                    (
                                                                        anjuran,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                anjuran
                                                                            }
                                                                        >
                                                                            {
                                                                                anjuran
                                                                            }
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <p className="text-keterangan leading-relaxed text-ink-600">
                                                        {satu.sumber}
                                                        {satu.halamanAnjuran &&
                                                            ` · ${satu.halamanAnjuran}`}
                                                    </p>
                                                </div>
                                            ))}
                                            <p className="border-t border-brand-100 pt-2.5 text-justify text-keterangan leading-relaxed text-ink-600">
                                                Anjuran Buku KIA, bukan
                                                diagnosis. Konfirmasi tenaga
                                                kesehatan untuk tata laksana.
                                            </p>
                                        </div>
                                    </Seksi>
                                )}

                                <Seksi
                                    judul="Materi untuk ibu"
                                    ikon={BookOpen}
                                    isiClassName="px-3.5 py-3"
                                >
                                    <div className="flex flex-col gap-2.5">
                                        <p className="text-justify text-kecil leading-relaxed text-ink-700">
                                            Buka materi Buku KIA lengkap sesuai
                                            umur anak: ASI dan MPASI, tanda
                                            bahaya, serta perawatan di rumah.
                                        </p>
                                        <TombolTautan
                                            varian="sekunder"
                                            lebarPenuh
                                            href={panduanKia.url({
                                                query: {
                                                    umur: anak.umurBulan,
                                                },
                                            })}
                                        >
                                            Buka Panduan KIA
                                        </TombolTautan>
                                    </div>
                                </Seksi>

                                {asiEksklusif.relevan && (
                                    <Seksi
                                        judul="ASI eksklusif"
                                        ikon={Baby}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-kecil font-bold text-ink-900">
                                                {asiEksklusif.judul}
                                            </p>
                                            <p className="text-justify text-kecil leading-relaxed text-ink-900">
                                                {asiEksklusif.hariIni === null
                                                    ? asiEksklusif.terakhir ===
                                                      null
                                                        ? 'Belum tercatat di Meja 3.'
                                                        : `Tercatat ${
                                                              asiEksklusif
                                                                  .terakhir
                                                                  .nilai
                                                                  ? 'ya'
                                                                  : 'tidak'
                                                          } pada ${
                                                              asiEksklusif
                                                                  .terakhir
                                                                  .tanggal
                                                          }.`
                                                    : `Hari ini tercatat ${
                                                          asiEksklusif.hariIni
                                                              ? 'ya'
                                                              : 'tidak'
                                                      }.`}
                                            </p>
                                            <p className="text-justify text-kecil leading-relaxed text-ink-700">
                                                Beri hanya ASI saja sampai usia
                                                6 bulan, tanpa air putih,
                                                makanan, atau minuman lain.
                                                Lanjutkan ASI sampai usia 2
                                                tahun atau lebih.
                                            </p>
                                            <p className="text-keterangan leading-relaxed text-ink-600">
                                                {asiEksklusif.halaman}
                                            </p>
                                        </div>
                                    </Seksi>
                                )}

                                {anjuranUmur !== null && (
                                    <Seksi
                                        judul={`Anjuran sesuai umur · ${anjuranUmur.label}`}
                                        ikon={Sparkles}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <ul className="flex list-disc flex-col gap-1 pl-5 text-justify text-kecil leading-relaxed text-ink-900">
                                                {anjuranUmur.anjuran.map(
                                                    (satu) => (
                                                        <li key={satu}>
                                                            {satu}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                            <p className="text-keterangan leading-relaxed text-ink-600">
                                                {anjuranUmur.halaman}
                                            </p>
                                        </div>
                                    </Seksi>
                                )}

                                {tandaBahaya !== null && (
                                    <Seksi
                                        judul={`Tanda bahaya · ${tandaBahaya.label}`}
                                        ikon={AlertTriangle}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-justify text-kecil leading-relaxed text-ink-900">
                                                {tandaBahaya.daftar.join(' · ')}
                                                .
                                            </p>
                                            <p className="rounded-md bg-status-bahaya-latar px-2.5 py-2 text-justify text-kecil leading-relaxed font-bold text-status-bahaya-teks">
                                                Segera periksa ke bidan, dokter,
                                                atau fasilitas kesehatan bila
                                                ditemukan.
                                            </p>
                                            <p className="text-keterangan leading-relaxed text-ink-600">
                                                {tandaBahaya.halaman}
                                            </p>
                                        </div>
                                    </Seksi>
                                )}

                                <Seksi
                                    judul="Layanan"
                                    ikon={Syringe}
                                    isiClassName="px-3.5 py-3"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                                Imunisasi yang masih harus
                                                dikejar
                                            </p>
                                            {imunisasiTertunda.length === 0 ? (
                                                <p className="text-kecil text-ink-700">
                                                    Tidak ada.
                                                </p>
                                            ) : (
                                                <ul className="flex flex-col gap-1">
                                                    {imunisasiTertunda.map(
                                                        (satu) => (
                                                            <li
                                                                key={satu.kode}
                                                                className="text-justify text-kecil leading-relaxed text-ink-900"
                                                            >
                                                                <span className="font-bold">
                                                                    {satu.nama}
                                                                </span>
                                                                {' · '}
                                                                <span className="text-ink-700">
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
                                        <div className="border-t border-brand-100 pt-2.5">
                                            <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                                {layananHariIni.length > 0
                                                    ? 'Sudah diterima hari ini'
                                                    : 'Layanan terakhir'}
                                            </p>
                                            {layanan.length === 0 ? (
                                                <p className="text-kecil text-ink-700">
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
                                                            className="text-kecil leading-relaxed text-ink-900"
                                                        >
                                                            <span className="font-bold">
                                                                {satu.detail}
                                                            </span>
                                                            <span className="text-ink-700">
                                                                {' · '}
                                                                {
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
                                                    className="mt-1 justify-start"
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
                                </Seksi>
                            </>
                        }
                        kanan={
                            <>
                                <Seksi
                                    judul="Pengamatan kader"
                                    ikon={Eye}
                                    isiClassName="flex flex-col gap-2.5 px-3.5 py-3.5"
                                >
                                    <p className="text-justify text-keterangan leading-relaxed text-ink-600">
                                        Centang bila ditemukan kondisi di bawah.
                                        Pengamatan pertama otomatis memilih
                                        materi penyuluhannya.
                                    </p>
                                    <fieldset className="flex flex-col gap-2.5">
                                        <legend className="mb-1 text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                            Kondisi fisik
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
                                    </fieldset>
                                    <fieldset className="flex flex-col gap-2.5">
                                        <legend className="mb-1 text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                            Perkembangan motorik
                                        </legend>
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
                                </Seksi>

                                <Seksi
                                    judul="Materi penyuluhan"
                                    ikon={MessageSquareText}
                                    isiClassName="flex flex-col gap-2.5 px-3.5 py-3.5"
                                >
                                    <p className="text-justify text-keterangan leading-relaxed text-ink-600">
                                        Materi yang direkomendasikan sudah
                                        tercentang. Hapus centang bila tidak
                                        disampaikan.
                                    </p>
                                    {materiDirekomendasikan.length === 0 && (
                                        <p className="text-kecil leading-relaxed text-ink-700">
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
                                        <Tombol
                                            varian="tersier"
                                            className="justify-start"
                                            onClick={() =>
                                                setSheetMateriLain(true)
                                            }
                                        >
                                            Pilih materi lain
                                        </Tombol>
                                    )}
                                    <div className="flex items-end gap-2 border-t border-brand-100 pt-3">
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
                                </Seksi>

                                <Seksi
                                    judul="Isi Piringku ibu menyusui"
                                    ikon={Utensils}
                                    isiClassName="px-3.5 py-3"
                                >
                                    {tampilkanPiringku ? (
                                        <>
                                            <p className="text-justify text-keterangan leading-relaxed text-ink-600">
                                                Porsi makan ibu menyusui (0–12
                                                bulan) untuk sehari, sesuai Buku
                                                KIA.
                                            </p>
                                            <div className="-mx-3.5 mt-2 overflow-x-auto">
                                                <table className="w-full text-left text-kecil">
                                                    <caption className="sr-only">
                                                        Isi Piringku ibu
                                                        menyusui
                                                    </caption>
                                                    <thead>
                                                        <tr className="border-b border-brand-100 bg-brand-50/60 text-label-seksi tracking-[0.06em] text-brand-700 uppercase">
                                                            <th
                                                                scope="col"
                                                                className="px-3.5 py-2"
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
                                                                className="px-3.5 py-2"
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
                                                                    className="border-b border-brand-100 align-top text-ink-900"
                                                                >
                                                                    <th
                                                                        scope="row"
                                                                        className="px-3.5 py-2 font-bold"
                                                                    >
                                                                        {
                                                                            satu.bahan
                                                                        }
                                                                    </th>
                                                                    <td className="px-2 py-2 text-right text-ink-700 tabular-nums">
                                                                        {
                                                                            satu.porsi
                                                                        }
                                                                    </td>
                                                                    <td className="px-3.5 py-2 text-ink-700">
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
                                                    className="mt-1 justify-start"
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
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-justify text-kecil leading-relaxed text-ink-700">
                                                Tampil otomatis untuk anak di
                                                bawah 24 bulan.
                                            </p>
                                            <Tombol
                                                varian="tersier"
                                                className="justify-start"
                                                onClick={() =>
                                                    setTampilkanPiringku(true)
                                                }
                                            >
                                                Tampilkan untuk ibu yang masih
                                                menyusui
                                            </Tombol>
                                        </div>
                                    )}
                                </Seksi>

                                <Seksi
                                    judul="Catatan tindak lanjut"
                                    ikon={CalendarDays}
                                    isiClassName="px-3.5 py-3.5"
                                >
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
                                        galat={
                                            form.errors.catatan_tindak_lanjut
                                        }
                                        placeholder="Contoh: rujuk ke puskesmas, kontrol ulang bulan depan"
                                    />
                                </Seksi>

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
                <ul className="flex flex-col divide-y divide-brand-100">
                    {layanan.map((satu) => (
                        <li
                            key={satu.id}
                            className="flex flex-col py-2.5 text-kecil text-ink-900"
                        >
                            <span className="font-bold">{satu.detail}</span>
                            <span className="text-keterangan text-ink-600">
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
                <ul className="flex flex-col gap-2.5">
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
