import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    ClipboardList,
    History,
    Pill,
    Syringe,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipStatus } from '@/components/dasar/chip-status';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { AreaTeks, IsianTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KotakCentangLayanan } from '@/components/dasar/kotak-centang-layanan';
import { Seksi } from '@/components/dasar/seksi';
import { Tombol } from '@/components/dasar/tombol';
import { DetailDuaKolom } from '@/components/detail-dua-kolom';
import { useDaftarLayarAnak } from '@/hooks/use-layar-anak';
import { formatUmurBulan } from '@/lib/umur';
import { lepas, pelayanan, tunda } from '@/routes/kunjungan';
import type { HeaderKunjungan } from '@/types';

type Imunisasi = {
    kode: string;
    nama: string;
    alasan: string;
    terlambat: boolean;
    tercentang: boolean;
};

type RiwayatImunisasi = { tanggal: string; vaksin: string };

type Isian = {
    tanggal: string;
    imunisasi: { kode: string; batch: string }[];
    vitamin_a: string;
    obat_cacing: boolean;
    catatan_pelayanan: string;
};

type Props = {
    anak: HeaderKunjungan;
    hariIni: string;
    tanggalLahir: string;
    jatuhTempo: Imunisasi[];
    vitaminA: {
        pilihan: { kode: string; nama: string; keterangan: string } | null;
        info: string | null;
    } | null;
    obatCacing: {
        boleh: boolean;
        kode: string;
        nama: string;
        keterangan: string;
    } | null;
    /** Satu kunjungan imunisasi sebelumnya saja (FR-31). */
    riwayatTerakhir: RiwayatImunisasi[];
    nilaiAwal: Partial<Isian> | null;
};

/**
 * Isian awal: layanan jatuh tempo tercentang (DESIGN 5.6 langkah 1), atau
 * isian yang sudah ada dari draf Tunda. Layanan di draf yang tidak lagi
 * ditawarkan dibuang.
 */
function isianAwal({
    hariIni,
    jatuhTempo,
    vitaminA,
    obatCacing,
    nilaiAwal,
}: Props): Isian {
    const kodeBoleh = new Set(jatuhTempo.map((satu) => satu.kode));
    const kodeVitaminA = vitaminA?.pilihan?.kode ?? '';

    if (nilaiAwal) {
        return {
            tanggal: nilaiAwal.tanggal || hariIni,
            imunisasi: (nilaiAwal.imunisasi ?? [])
                .filter((satu) => kodeBoleh.has(satu.kode))
                .map((satu) => ({ kode: satu.kode, batch: satu.batch ?? '' })),
            vitamin_a: nilaiAwal.vitamin_a === kodeVitaminA ? kodeVitaminA : '',
            obat_cacing:
                Boolean(obatCacing?.boleh) && Boolean(nilaiAwal.obat_cacing),
            catatan_pelayanan: nilaiAwal.catatan_pelayanan ?? '',
        };
    }

    return {
        tanggal: hariIni,
        imunisasi: jatuhTempo
            .filter((satu) => satu.tercentang)
            .map((satu) => ({ kode: satu.kode, batch: '' })),
        vitamin_a: kodeVitaminA,
        obat_cacing: false,
        catatan_pelayanan: '',
    };
}

/**
 * S11 Meja 4 Pelayanan (FR-30 sampai FR-36; DESIGN 5.6, 6.3, Gambar 5):
 * layanan jatuh tempo sudah tercentang, kader menghapus centang yang tidak
 * jadi diberikan lalu menyimpan ke Meja 5. Layar hanya mencatat pelayanan —
 * tidak ada lagi pencatatan penyuluhan.
 *
 * Susunan: kepala anak, kolom kiri berisi kartu layanan yang dapat
 * dicentang, kolom kanan berisi ringkasan "anak mendapat hari ini",
 * riwayat imunisasi, dan catatan. Semua teks memakai skala baca biasa
 * (bukan judul besar) agar mudah dipindai.
 */
export default function Pelayanan(props: Props) {
    const {
        anak,
        hariIni,
        tanggalLahir,
        jatuhTempo,
        vitaminA,
        obatCacing,
        riwayatTerakhir,
    } = props;
    const { errors } = usePage().props;
    const form = useForm<Isian>(isianAwal(props));

    // Kolom antrean (bab 9) menanyakan isian ini sebelum pindah anak.
    useDaftarLayarAnak({
        adaPerubahan: () => form.isDirty,
        draf: () => form.data,
    });

    const galat = form.errors as Record<string, string | undefined>;
    const galatLayanan =
        Object.entries(galat).find(
            ([kunci]) =>
                kunci.startsWith('imunisasi') ||
                kunci === 'vitamin_a' ||
                kunci === 'obat_cacing',
        )?.[1] ?? null;

    const keterangan = [
        anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        formatUmurBulan(anak.umurBulan),
        `Antrean #${String(anak.nomorAntrean).padStart(2, '0')}`,
    ].join(' · ');

    function ubahImunisasi(kode: string, dicentang: boolean) {
        form.setData(
            'imunisasi',
            dicentang
                ? // Urutan mengikuti jadwal, bukan urutan ketukan.
                  jatuhTempo
                      .filter(
                          (satu) =>
                              satu.kode === kode ||
                              form.data.imunisasi.some(
                                  (pilih) => pilih.kode === satu.kode,
                              ),
                      )
                      .map(
                          (satu) =>
                              form.data.imunisasi.find(
                                  (pilih) => pilih.kode === satu.kode,
                              ) ?? { kode: satu.kode, batch: '' },
                      )
                : form.data.imunisasi.filter((pilih) => pilih.kode !== kode),
        );
    }

    function ubahBatch(kode: string, batch: string) {
        form.setData(
            'imunisasi',
            form.data.imunisasi.map((pilih) =>
                pilih.kode === kode ? { ...pilih, batch } : pilih,
            ),
        );
    }

    function simpan(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(pelayanan.url(anak.id));
    }

    const adaLayananLain = vitaminA !== null || obatCacing !== null;

    // "Anak mendapat apa hari ini": dibaca langsung dari centang kader.
    const imunisasiDipilih = jatuhTempo.filter((satu) =>
        form.data.imunisasi.some((pilih) => pilih.kode === satu.kode),
    );
    const obatCacingDipilih =
        obatCacing !== null && obatCacing.boleh && form.data.obat_cacing;
    const vitaminADipilih =
        vitaminA?.pilihan != null && form.data.vitamin_a !== ''
            ? vitaminA.pilihan.nama
            : null;
    const daftarDidapat = [
        ...imunisasiDipilih.map((satu) => satu.nama),
        ...(vitaminADipilih ? [vitaminADipilih] : []),
        ...(obatCacingDipilih ? [obatCacing.nama] : []),
    ];

    // Belum dicentang: alasan mengapa layanan belum bisa diberikan hari ini.
    const belumDiberikan = jatuhTempo.filter(
        (satu) =>
            !form.data.imunisasi.some((pilih) => pilih.kode === satu.kode),
    );

    return (
        <>
            <Head title={`Meja 4 · ${anak.nama}`} />
            <form
                noValidate
                onSubmit={simpan}
                className="toast-di-atas-kaki flex min-h-dvh flex-col bg-paper"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={keterangan}
                    jenisKelamin={anak.jenisKelamin}
                    meja={4}
                    kembali={lepas(anak.id)}
                    selebarPanel
                />

                <div className="@container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 tablet:px-5 panel:mx-0 panel:max-w-5xl panel:px-6">
                    {errors.kunjungan && (
                        <Banner varian="bahaya">{errors.kunjungan}</Banner>
                    )}
                    {galatLayanan && (
                        <Banner varian="bahaya">{galatLayanan}</Banner>
                    )}

                    <p className="flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-keterangan leading-relaxed text-ink-700">
                        <Syringe
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-brand-600"
                        />
                        <span>
                            Layanan yang jatuh tempo sudah tercentang. Hapus
                            centang bila layanan tidak jadi diberikan hari ini,
                            lalu tulis alasannya di catatan.
                        </span>
                    </p>

                    <DetailDuaKolom
                        className="gap-4"
                        kiri={
                            <>
                                <Seksi
                                    judul="Jatuh tempo hari ini"
                                    ikon={Syringe}
                                    isiClassName="flex flex-col gap-2.5 px-3.5 py-3.5"
                                >
                                    {jatuhTempo.length === 0 && (
                                        <p className="text-kecil leading-relaxed text-ink-700">
                                            Tidak ada imunisasi yang jatuh tempo
                                            hari ini.
                                        </p>
                                    )}
                                    {jatuhTempo.map((satu) => {
                                        const pilih = form.data.imunisasi.find(
                                            (item) => item.kode === satu.kode,
                                        );

                                        return (
                                            <KotakCentangLayanan
                                                key={satu.kode}
                                                nama={`imunisasi-${satu.kode}`}
                                                label={satu.nama}
                                                alasan={satu.alasan}
                                                dicentang={pilih !== undefined}
                                                onUbah={(dicentang) =>
                                                    ubahImunisasi(
                                                        satu.kode,
                                                        dicentang,
                                                    )
                                                }
                                            >
                                                <IsianTeks
                                                    label={`No. batch ${satu.kode} (opsional)`}
                                                    name={`batch-${satu.kode}`}
                                                    maxLength={50}
                                                    autoComplete="off"
                                                    value={pilih?.batch ?? ''}
                                                    onChange={(event) =>
                                                        ubahBatch(
                                                            satu.kode,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </KotakCentangLayanan>
                                        );
                                    })}
                                </Seksi>

                                {adaLayananLain && (
                                    <Seksi
                                        judul="Vitamin A dan obat cacing"
                                        ikon={Pill}
                                        isiClassName="flex flex-col gap-2.5 px-3.5 py-3.5"
                                    >
                                        {obatCacing && (
                                            <KotakCentangLayanan
                                                nama="obat_cacing"
                                                label={obatCacing.nama}
                                                alasan={obatCacing.keterangan}
                                                dicentang={
                                                    form.data.obat_cacing
                                                }
                                                nonaktif={!obatCacing.boleh}
                                                onUbah={(dicentang) =>
                                                    form.setData(
                                                        'obat_cacing',
                                                        dicentang,
                                                    )
                                                }
                                            />
                                        )}
                                        {vitaminA?.pilihan && (
                                            <KotakCentangLayanan
                                                nama="vitamin_a"
                                                label={vitaminA.pilihan.nama}
                                                alasan={
                                                    vitaminA.pilihan.keterangan
                                                }
                                                dicentang={
                                                    form.data.vitamin_a !== ''
                                                }
                                                onUbah={(dicentang) =>
                                                    form.setData(
                                                        'vitamin_a',
                                                        dicentang
                                                            ? (vitaminA.pilihan
                                                                  ?.kode ?? '')
                                                            : '',
                                                    )
                                                }
                                            />
                                        )}
                                        {vitaminA?.info && (
                                            <p className="flex items-start gap-2 rounded-md bg-status-info-latar px-2.5 py-2 text-keterangan leading-relaxed text-status-info-teks">
                                                <ChipStatus varian="info">
                                                    Vit. A
                                                </ChipStatus>
                                                <span className="min-w-0 flex-1">
                                                    {vitaminA.info}
                                                </span>
                                            </p>
                                        )}
                                    </Seksi>
                                )}

                                <Seksi
                                    judul="Tanggal pemberian"
                                    ikon={CalendarCheck}
                                    isiClassName="px-3.5 py-3.5"
                                >
                                    <IsianTeks
                                        jenis="tanggal"
                                        label="Tanggal pemberian"
                                        wajib
                                        name="tanggal"
                                        min={tanggalLahir}
                                        max={hariIni}
                                        value={form.data.tanggal}
                                        onChange={(event) =>
                                            form.setData(
                                                'tanggal',
                                                event.target.value,
                                            )
                                        }
                                        petunjuk="Otomatis hari ini. Ubah bila layanan diberikan pada hari lain."
                                        galat={form.errors.tanggal}
                                    />
                                </Seksi>
                            </>
                        }
                        kanan={
                            <>
                                <Seksi
                                    judul="Anak mendapat hari ini"
                                    ikon={ClipboardList}
                                    isiClassName="px-3.5 py-3"
                                >
                                    <div
                                        className="flex flex-col gap-2.5"
                                        aria-live="polite"
                                    >
                                        {daftarDidapat.length === 0 ? (
                                            <p className="text-kecil leading-relaxed text-ink-700">
                                                Belum ada layanan dicentang.
                                                Centang layanan di kolom
                                                sebelah.
                                            </p>
                                        ) : (
                                            <ul className="flex flex-col gap-1.5">
                                                {daftarDidapat.map((satu) => (
                                                    <li
                                                        key={satu}
                                                        className="flex items-center gap-2 text-kecil text-ink-900"
                                                    >
                                                        <ChipStatus varian="normal">
                                                            Diberikan
                                                        </ChipStatus>
                                                        <span className="min-w-0 flex-1 font-bold">
                                                            {satu}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {belumDiberikan.length > 0 && (
                                            <div className="border-t border-brand-100 pt-2.5">
                                                <p className="text-label-seksi tracking-[0.08em] text-ink-600 uppercase">
                                                    Belum diberikan / perlu
                                                    dikejar
                                                </p>
                                                <ul className="mt-1 flex flex-col gap-1">
                                                    {belumDiberikan.map(
                                                        (satu) => (
                                                            <li
                                                                key={satu.kode}
                                                                className="text-kecil leading-snug text-ink-700"
                                                            >
                                                                <span className="font-bold text-ink-900">
                                                                    {satu.nama}
                                                                </span>
                                                                {' · '}
                                                                {satu.alasan}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </Seksi>

                                <Seksi
                                    judul="Riwayat imunisasi"
                                    ikon={History}
                                    isiClassName="px-3.5 py-3"
                                >
                                    {riwayatTerakhir.length === 0 ? (
                                        <p className="text-kecil leading-relaxed text-ink-700">
                                            Belum ada imunisasi tercatat pada
                                            kunjungan sebelumnya.
                                        </p>
                                    ) : (
                                        <ul className="flex flex-col gap-1.5">
                                            {riwayatTerakhir.map((satu) => (
                                                <li
                                                    key={satu.tanggal}
                                                    className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-md border border-brand-100 bg-brand-50/60 px-2.5 py-1.5"
                                                >
                                                    <span className="text-kecil font-bold text-ink-900">
                                                        {satu.vaksin}
                                                    </span>
                                                    <span className="text-keterangan text-ink-600 tabular-nums">
                                                        {satu.tanggal}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Seksi>

                                <Seksi
                                    judul="Catatan pelayanan"
                                    ikon={ClipboardList}
                                    isiClassName="px-3.5 py-3.5"
                                >
                                    <AreaTeks
                                        label="Catatan pelayanan"
                                        rows={3}
                                        name="catatan_pelayanan"
                                        maxLength={500}
                                        value={form.data.catatan_pelayanan}
                                        onChange={(event) =>
                                            form.setData(
                                                'catatan_pelayanan',
                                                event.target.value,
                                            )
                                        }
                                        petunjuk="Tulis alasan bila ada imunisasi yang belum diberikan, contoh: anak demam."
                                        placeholder="Contoh: anak demam, imunisasi ditunda bulan depan"
                                        galat={form.errors.catatan_pelayanan}
                                    />
                                </Seksi>

                                <KakiTombol denganNavigasi={false}>
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
                                    >
                                        Simpan · ke Meja 5
                                    </Tombol>
                                </KakiTombol>
                            </>
                        }
                    />
                </div>
            </form>
        </>
    );
}
