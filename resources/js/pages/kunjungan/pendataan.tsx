import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Baby, ClipboardCheck, RotateCcw, Scale } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { BarisNilai } from '@/components/dasar/baris-nilai';
import { ChipStatus } from '@/components/dasar/chip-status';
import type { VarianChip } from '@/components/dasar/chip-status';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { AreaTeks } from '@/components/dasar/isian-teks';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KontrolSegmen } from '@/components/dasar/kontrol-segmen';
import { Seksi } from '@/components/dasar/seksi';
import { SheetBawah } from '@/components/dasar/sheet-bawah';
import { Tombol } from '@/components/dasar/tombol';
import { DetailDuaKolom } from '@/components/detail-dua-kolom';
import { useDaftarLayarAnak } from '@/hooks/use-layar-anak';
import { perubahan, teksKbm, teksPerubahan } from '@/lib/perbandingan';
import { formatUmurBulan } from '@/lib/umur';
import { kembalikan, lepas, pendataan, tunda } from '@/routes/kunjungan';
import type { HeaderKunjungan } from '@/types';

type Ukur = {
    bb: string | null;
    pb_tb: string | null;
    lila: string | null;
    lk: string | null;
};

type Props = {
    anak: HeaderKunjungan;
    sekarang: (Ukur & { cara_ukur: 'telentang' | 'berdiri' | null }) | null;
    sebelumnya: (Ukur & { tanggal: string }) | null;
    penimbangan: {
        status: 'N' | 'T' | 'tidak_ditimbang' | null;
        kenaikanGram: number | null;
        kbmGram: number | null;
    } | null;
    asi: {
        isian: boolean;
        nilai: boolean | null;
        terakhir: { nilai: boolean; tanggal: string } | null;
    };
};

const STATUS_NT: Record<string, { teks: string; varian: VarianChip }> = {
    N: { teks: 'N · Naik', varian: 'normal' },
    T: { teks: 'T · Tidak naik', varian: 'bahaya' },
    tidak_ditimbang: { teks: 'Tidak ditimbang bulan lalu', varian: 'info' },
};

/**
 * S10 Meja 3 Pendataan (FR-24 sampai FR-29; DESIGN 5.5, 6.3, Gambar 5):
 * nilai ukur hanya dibaca untuk disalin ke Buku KIA.
 *
 * Susunan: kepala anak, kartu hasil ukur hari ini (angka 24 px agar mudah
 * dibaca saat menyalin), kartu status penimbangan dan ASI eksklusif, lalu
 * tombol simpan menempel di kaki layar.
 */
export default function Pendataan({
    anak,
    sekarang,
    sebelumnya,
    penimbangan,
    asi,
}: Props) {
    const { errors } = usePage().props;
    const form = useForm<{ asi_eksklusif: 'ya' | 'tidak' | '' }>({
        asi_eksklusif: asi.nilai === null ? '' : asi.nilai ? 'ya' : 'tidak',
    });
    // Kolom antrean (bab 9) menanyakan isian ini sebelum pindah anak.
    useDaftarLayarAnak({
        adaPerubahan: () => form.isDirty,
        draf: () => form.data,
    });
    const formKembali = useForm({ alasan: '' });
    const [sheetKembali, setSheetKembali] = useState(false);

    const keterangan = [
        anak.nikSamar ? `NIK ${anak.nikSamar}` : null,
        formatUmurBulan(anak.umurBulan),
        `Antrean #${String(anak.nomorAntrean).padStart(2, '0')}`,
    ]
        .filter(Boolean)
        .join(' · ');

    const labelPbTb =
        sekarang?.cara_ukur === 'telentang'
            ? 'Panjang badan · telentang'
            : sekarang?.cara_ukur === 'berdiri'
              ? 'Tinggi badan · berdiri'
              : 'Panjang/tinggi badan';

    const baris: {
        kunci: keyof Ukur;
        label: string;
        satuan: string;
        namaSatuan: string;
    }[] = [
        {
            kunci: 'bb',
            label: 'Berat badan',
            satuan: 'kg',
            namaSatuan: 'kilogram',
        },
        {
            kunci: 'pb_tb',
            label: labelPbTb,
            satuan: 'cm',
            namaSatuan: 'sentimeter',
        },
        {
            kunci: 'lila',
            label: 'LiLA',
            satuan: 'cm',
            namaSatuan: 'sentimeter',
        },
        {
            kunci: 'lk',
            label: 'Lingkar kepala',
            satuan: 'cm',
            namaSatuan: 'sentimeter',
        },
    ];

    function salin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(pendataan.url(anak.id));
    }

    function kirimKembali(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        formKembali.post(kembalikan.url(anak.id), {
            onSuccess: () => setSheetKembali(false),
        });
    }

    const status = penimbangan?.status ? STATUS_NT[penimbangan.status] : null;

    return (
        <>
            <Head title={`Meja 3 · ${anak.nama}`} />
            <form
                noValidate
                onSubmit={salin}
                className="toast-di-atas-kaki flex min-h-dvh flex-col bg-paper"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={keterangan}
                    jenisKelamin={anak.jenisKelamin}
                    meja={3}
                    kembali={lepas(anak.id)}
                    selebarPanel
                />

                <div className="@container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 tablet:px-5 panel:mx-0 panel:max-w-5xl panel:px-6">
                    {errors.kunjungan && (
                        <Banner varian="bahaya">{errors.kunjungan}</Banner>
                    )}

                    <p className="flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-keterangan leading-relaxed text-ink-700">
                        <ClipboardCheck
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-brand-600"
                        />
                        <span>
                            Hanya untuk dibaca. Salin angka di bawah ke Buku
                            KIA, lalu tekan{' '}
                            <span className="font-bold text-ink-900">
                                Sudah disalin ke KIA
                            </span>
                            .
                        </span>
                    </p>

                    <DetailDuaKolom
                        className="gap-4"
                        kiri={
                            <Seksi
                                judul="Hasil ukur hari ini"
                                ikon={Scale}
                                isiClassName="px-3.5 py-1"
                            >
                                <dl className="divide-y divide-brand-100">
                                    {baris.map(
                                        ({
                                            kunci,
                                            label,
                                            satuan,
                                            namaSatuan,
                                        }) => {
                                            const hasil = perubahan(
                                                sekarang?.[kunci] ?? null,
                                                sebelumnya?.[kunci] ?? null,
                                            );
                                            const teks =
                                                hasil && sebelumnya
                                                    ? teksPerubahan(
                                                          hasil,
                                                          satuan,
                                                          sebelumnya.tanggal,
                                                      )
                                                    : undefined;

                                            return (
                                                <BarisNilai
                                                    key={kunci}
                                                    label={label}
                                                    nilai={
                                                        sekarang?.[kunci] ??
                                                        null
                                                    }
                                                    satuan={satuan}
                                                    namaSatuan={namaSatuan}
                                                    perubahan={teks}
                                                    perubahanSr={
                                                        hasil && sebelumnya
                                                            ? hasil.arah ===
                                                              'tetap'
                                                                ? `tetap sejak ${sebelumnya.tanggal}`
                                                                : `${hasil.arah} ${String(hasil.selisih).replace('.', ',')} ${namaSatuan} dari ${sebelumnya.tanggal}`
                                                            : undefined
                                                    }
                                                />
                                            );
                                        },
                                    )}
                                </dl>
                                {!sebelumnya && (
                                    <p className="border-t border-brand-100 py-2.5 text-keterangan leading-relaxed text-ink-600">
                                        Kunjungan pertama, belum ada
                                        perbandingan dengan bulan lalu.
                                    </p>
                                )}
                            </Seksi>
                        }
                        kanan={
                            <>
                                {status && penimbangan && (
                                    <Seksi
                                        judul="Status penimbangan"
                                        ikon={ClipboardCheck}
                                        isiClassName="px-3.5 py-3"
                                    >
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <ChipStatus varian={status.varian}>
                                                {status.teks}
                                            </ChipStatus>
                                            {penimbangan.kenaikanGram !==
                                                null &&
                                                penimbangan.kbmGram !==
                                                    null && (
                                                    <span className="text-kecil leading-snug text-ink-700">
                                                        {teksKbm(
                                                            penimbangan.kenaikanGram,
                                                            penimbangan.kbmGram,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    </Seksi>
                                )}

                                <Seksi
                                    judul="ASI eksklusif"
                                    ikon={Baby}
                                    isiClassName="px-3.5 py-3"
                                >
                                    {asi.isian ? (
                                        <KontrolSegmen
                                            label="ASI eksklusif"
                                            nama="asi_eksklusif"
                                            opsi={[
                                                { nilai: 'ya', label: 'Ya' },
                                                {
                                                    nilai: 'tidak',
                                                    label: 'Tidak',
                                                },
                                            ]}
                                            nilai={
                                                form.data.asi_eksklusif || null
                                            }
                                            onUbah={(nilai) =>
                                                form.setData(
                                                    'asi_eksklusif',
                                                    nilai,
                                                )
                                            }
                                            galat={form.errors.asi_eksklusif}
                                        />
                                    ) : (
                                        <p className="text-kecil leading-relaxed text-ink-700">
                                            <span className="font-bold text-ink-900">
                                                Tercatat:{' '}
                                            </span>
                                            {asi.terakhir
                                                ? `${asi.terakhir.nilai ? 'Ya' : 'Tidak'} (${asi.terakhir.tanggal}, saat 0–6 bulan)`
                                                : 'Belum tercatat'}
                                        </p>
                                    )}
                                </Seksi>

                                <Tombol
                                    varian="tersier"
                                    className="justify-start gap-1.5"
                                    onClick={() => setSheetKembali(true)}
                                >
                                    <RotateCcw
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    Data keliru? Kembalikan ke Meja 2
                                </Tombol>

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
                                        Sudah disalin ke KIA
                                    </Tombol>
                                </KakiTombol>
                            </>
                        }
                    />
                </div>
            </form>

            <SheetBawah
                terbuka={sheetKembali}
                onTutup={() => setSheetKembali(false)}
                judul="Kembalikan ke Meja 2"
            >
                <form
                    noValidate
                    onSubmit={kirimKembali}
                    className="flex flex-col gap-4"
                >
                    <p className="text-kecil leading-relaxed text-ink-700">
                        Anak masuk lagi ke antrean Meja 2 dengan tanda "Perlu
                        ukur ulang".
                    </p>
                    <AreaTeks
                        label="Alasan singkat"
                        wajib
                        rows={2}
                        name="alasan"
                        value={formKembali.data.alasan}
                        onChange={(event) =>
                            formKembali.setData('alasan', event.target.value)
                        }
                        galat={formKembali.errors.alasan}
                        placeholder="Contoh: BB tertukar dengan anak lain"
                    />
                    <Tombol
                        type="submit"
                        lebarPenuh
                        memuat={formKembali.processing}
                        teksMemuat="Mengembalikan…"
                    >
                        Kembalikan ke Meja 2
                    </Tombol>
                </form>
            </SheetBawah>
        </>
    );
}
