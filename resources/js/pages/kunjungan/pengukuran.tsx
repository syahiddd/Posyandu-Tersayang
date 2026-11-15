import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarClock, Ruler, Scale, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { ChipStatus } from '@/components/dasar/chip-status';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { IsianAngka } from '@/components/dasar/isian-angka';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KontrolSegmen } from '@/components/dasar/kontrol-segmen';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Seksi } from '@/components/dasar/seksi';
import { Tombol } from '@/components/dasar/tombol';
import { useDaftarLayarAnak } from '@/hooks/use-layar-anak';
import { formatDesimal } from '@/lib/desimal';
import { periksaUkur, peringatanPerubahan } from '@/lib/pengukuran';
import type { JenisUkur } from '@/lib/pengukuran';
import { formatUmurBulan } from '@/lib/umur';
import { lepas, pengukuran, tunda } from '@/routes/kunjungan';
import type { HeaderKunjungan } from '@/types';

type CaraUkur = 'telentang' | 'berdiri';

type Nilai = {
    bb: string;
    pb_tb: string;
    cara_ukur: CaraUkur;
    lila: string;
    lk: string;
};

type Props = {
    anak: HeaderKunjungan;
    caraUkurBawaan: CaraUkur;
    nilaiAwal: Partial<Nilai> | null;
    sebelumnya: {
        tanggal: string;
        /** Contoh: "15 Agu 2026" untuk judul kartu riwayat. */
        tanggalLengkap: string;
        sumber: 'posyandu' | 'buku_kia';
        bb: string | null;
        pb_tb: string | null;
        lila: string | null;
        lk: string | null;
    } | null;
};

/**
 * S09 Meja 2 Pengukuran (FR-18 sampai FR-23; DESIGN 5.4, 6.2, Gambar 4).
 *
 * Susunan: kepala anak berwarna jenis kelamin, kartu riwayat kunjungan
 * sebelumnya sebagai pembanding, lalu dua kartu seksi berisi isian ukur.
 * Isian pendek berpasangan dua kolom di tablet agar tidak perlu banyak
 * menggulir; tombol simpan tetap menempel di kaki layar.
 */
export default function Pengukuran({
    anak,
    caraUkurBawaan,
    nilaiAwal,
    sebelumnya,
}: Props) {
    const { errors: galatServer } = usePage().props;
    const form = useForm<Nilai>({
        bb: nilaiAwal?.bb ?? '',
        pb_tb: nilaiAwal?.pb_tb ?? '',
        cara_ukur: nilaiAwal?.cara_ukur ?? caraUkurBawaan,
        lila: nilaiAwal?.lila ?? '',
        lk: nilaiAwal?.lk ?? '',
    });
    // Kolom antrean (bab 9) menanyakan isian ini sebelum pindah anak.
    useDaftarLayarAnak({
        adaPerubahan: () => form.isDirty,
        draf: () => form.data,
    });
    const [galatLokal, setGalatLokal] = useState<
        Partial<Record<keyof Nilai, string | null>>
    >({});
    // Ringkasan galat muncul dan menerima fokus setelah simpan dicoba
    // (DESIGN Tabel 33, bab 10.2), bukan saat isian ditinggalkan.
    const [percobaan, setPercobaan] = useState(0);
    // Nilai saat isian terakhir ditinggalkan: banner "Periksa lagi" tidak
    // muncul dan menggeser isian di tengah mengetik (DESIGN 5.4 langkah 3).
    const [diperiksa, setDiperiksa] = useState({
        bb: form.data.bb,
        pbTb: form.data.pb_tb,
    });

    const labelPbTb =
        form.data.cara_ukur === 'telentang' ? 'Panjang badan' : 'Tinggi badan';
    const isian: { jenis: JenisUkur; label: string; wajib: boolean }[] = [
        { jenis: 'bb', label: 'Berat badan', wajib: true },
        { jenis: 'pb_tb', label: labelPbTb, wajib: true },
        { jenis: 'lila', label: 'Lingkar lengan atas', wajib: false },
        { jenis: 'lk', label: 'Lingkar kepala', wajib: false },
    ];

    function periksa(jenis: JenisUkur) {
        const aturan = isian.find((item) => item.jenis === jenis)!;
        setDiperiksa({ bb: form.data.bb, pbTb: form.data.pb_tb });
        setGalatLokal((lama) => ({
            ...lama,
            [jenis]: periksaUkur(
                jenis,
                form.data[jenis],
                aturan.label,
                aturan.wajib,
            ),
        }));
    }

    const galat = (nama: keyof Nilai): string | undefined =>
        (galatLokal[nama] === undefined
            ? form.errors[nama]
            : galatLokal[nama]) ?? undefined;

    const peringatan = sebelumnya
        ? peringatanPerubahan(diperiksa, {
              bb: sebelumnya.bb,
              pbTb: sebelumnya.pb_tb,
              tanggal: sebelumnya.tanggal,
          })
        : [];

    function nilaiLalu(jenis: JenisUkur, satuan: string): string | undefined {
        const nilai = sebelumnya?.[jenis];

        return nilai
            ? `${formatDesimal(Number(nilai))} ${satuan} (${sebelumnya!.tanggal})`
            : undefined;
    }

    /** Nilai pembanding di kartu riwayat; "—" bila tidak diukur. */
    function nilaiTampil(nilai: string | null, satuan: string): string {
        return nilai === null || nilai === ''
            ? '—'
            : `${formatDesimal(Number(nilai))} ${satuan}`;
    }

    function simpan(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const hasil = Object.fromEntries(
            isian.map(({ jenis, label, wajib }) => [
                jenis,
                periksaUkur(jenis, form.data[jenis], label, wajib),
            ]),
        ) as Record<JenisUkur, string | null>;
        setGalatLokal(hasil);
        setPercobaan((n) => n + 1);

        if (Object.values(hasil).some(Boolean)) {
            return;
        }

        form.put(pengukuran.url(anak.id), {
            onError: () => setPercobaan((n) => n + 1),
        });
    }

    const ringkasan = Object.fromEntries(
        (['bb', 'pb_tb', 'cara_ukur', 'lila', 'lk'] as const).map((nama) => [
            nama,
            galat(nama),
        ]),
    );

    return (
        <>
            <Head title={`Meja 2 · ${anak.nama}`} />
            <form
                noValidate
                onSubmit={simpan}
                className="toast-di-atas-kaki flex min-h-dvh flex-col bg-paper"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`${anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · ${formatUmurBulan(anak.umurBulan)} · Antrean #${String(anak.nomorAntrean).padStart(2, '0')}`}
                    jenisKelamin={anak.jenisKelamin}
                    meja={2}
                    kembali={lepas(anak.id)}
                    selebarPanel
                />

                <div className="@container mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4 pb-2 tablet:px-5 panel:mx-0 panel:max-w-5xl panel:px-6">
                    {galatServer.kunjungan && (
                        <Banner varian="bahaya">{galatServer.kunjungan}</Banner>
                    )}
                    {anak.perluUkurUlang && (
                        <Banner varian="peringatan" judul="Perlu ukur ulang">
                            {anak.alasanKembali ?? 'Dikembalikan dari Meja 3.'}
                        </Banner>
                    )}
                    {percobaan > 0 && (
                        <RingkasanGalat
                            percobaan={percobaan}
                            galat={ringkasan}
                            labelIsian={{
                                bb: 'isian-bb',
                                pb_tb: 'isian-pb_tb',
                                cara_ukur: 'isian-cara_ukur',
                                lila: 'isian-lila',
                                lk: 'isian-lk',
                            }}
                        />
                    )}
                    {peringatan.length > 0 && (
                        <Banner varian="peringatan" judul="Periksa lagi">
                            {peringatan.join(' ')} Tetap boleh disimpan.
                        </Banner>
                    )}

                    <p className="flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-keterangan leading-relaxed text-ink-700">
                        <Scale
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-brand-600"
                        />
                        <span>
                            Ukur anak dengan alat yang sudah dikalibrasi, lalu
                            tulis hasilnya. Berat badan dan{' '}
                            {labelPbTb.toLowerCase()} wajib diisi.
                        </span>
                    </p>

                    <Seksi
                        judul={
                            sebelumnya
                                ? 'Kunjungan sebelumnya'
                                : 'Kunjungan pertama'
                        }
                        ikon={CalendarClock}
                        isiClassName="px-3.5 py-3"
                    >
                        {sebelumnya ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-kecil font-bold text-ink-900">
                                        {sebelumnya.tanggalLengkap}
                                    </p>
                                    <ChipStatus varian="info">
                                        {sebelumnya.sumber === 'buku_kia'
                                            ? 'Buku KIA'
                                            : 'Posyandu'}
                                    </ChipStatus>
                                </div>
                                <dl className="mt-2.5 grid grid-cols-2 gap-2 tablet:grid-cols-4">
                                    {(
                                        [
                                            [
                                                'Berat badan',
                                                sebelumnya.bb,
                                                'kg',
                                            ],
                                            [
                                                'Panjang/tinggi badan',
                                                sebelumnya.pb_tb,
                                                'cm',
                                            ],
                                            [
                                                'Lingkar lengan atas',
                                                sebelumnya.lila,
                                                'cm',
                                            ],
                                            [
                                                'Lingkar kepala',
                                                sebelumnya.lk,
                                                'cm',
                                            ],
                                        ] as const
                                    ).map(([label, nilai, satuan]) => (
                                        <div
                                            key={label}
                                            className="flex flex-col rounded-md border border-brand-100 bg-brand-50/70 px-2.5 py-2"
                                        >
                                            <dt className="text-keterangan leading-snug text-ink-600">
                                                {label}
                                            </dt>
                                            <dd className="text-teks font-bold text-ink-900 tabular-nums">
                                                {nilaiTampil(nilai, satuan)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </>
                        ) : (
                            <p className="text-kecil leading-relaxed text-ink-700">
                                Belum ada nilai pembanding. Hasil ukur hari ini
                                akan menjadi acuan kunjungan berikutnya.
                            </p>
                        )}
                    </Seksi>

                    <div className="grid grid-cols-1 gap-4 panel:grid-cols-2">
                        <Seksi
                            judul="Ukuran utama"
                            ikon={Ruler}
                            isiClassName="px-3.5 py-3.5"
                        >
                            <div className="flex flex-col gap-4">
                                <IsianAngka
                                    id="isian-bb"
                                    name="bb"
                                    label="Berat badan"
                                    satuan="kg"
                                    wajib
                                    nilai={form.data.bb}
                                    onUbah={(nilai) =>
                                        form.setData('bb', nilai)
                                    }
                                    onBlur={() => periksa('bb')}
                                    nilaiLalu={nilaiLalu('bb', 'kg')}
                                    galat={galat('bb')}
                                />

                                <IsianAngka
                                    id="isian-pb_tb"
                                    name="pb_tb"
                                    label={labelPbTb}
                                    satuan="cm"
                                    wajib
                                    nilai={form.data.pb_tb}
                                    onUbah={(nilai) =>
                                        form.setData('pb_tb', nilai)
                                    }
                                    onBlur={() => periksa('pb_tb')}
                                    nilaiLalu={nilaiLalu('pb_tb', 'cm')}
                                    galat={galat('pb_tb')}
                                />

                                <KontrolSegmen
                                    id="isian-cara_ukur"
                                    label="Cara ukur"
                                    nama="cara_ukur"
                                    opsi={[
                                        {
                                            nilai: 'telentang',
                                            label: 'Telentang',
                                        },
                                        {
                                            nilai: 'berdiri',
                                            label: 'Berdiri',
                                        },
                                    ]}
                                    nilai={form.data.cara_ukur}
                                    onUbah={(nilai) =>
                                        form.setData('cara_ukur', nilai)
                                    }
                                    galat={galat('cara_ukur')}
                                />
                            </div>
                        </Seksi>

                        <Seksi
                            judul="Ukuran tambahan"
                            ikon={Stethoscope}
                            isiClassName="px-3.5 py-3.5"
                        >
                            <div className="flex flex-col gap-4">
                                <IsianAngka
                                    id="isian-lila"
                                    name="lila"
                                    label="Lingkar lengan atas"
                                    satuan="cm"
                                    dianjurkan
                                    nilai={form.data.lila}
                                    onUbah={(nilai) =>
                                        form.setData('lila', nilai)
                                    }
                                    onBlur={() => periksa('lila')}
                                    nilaiLalu={nilaiLalu('lila', 'cm')}
                                    galat={galat('lila')}
                                />
                                <IsianAngka
                                    id="isian-lk"
                                    name="lk"
                                    label="Lingkar kepala"
                                    satuan="cm"
                                    dianjurkan
                                    nilai={form.data.lk}
                                    onUbah={(nilai) =>
                                        form.setData('lk', nilai)
                                    }
                                    onBlur={() => periksa('lk')}
                                    nilaiLalu={nilaiLalu('lk', 'cm')}
                                    galat={galat('lk')}
                                />
                                <p className="rounded-md bg-brand-50 px-2.5 py-2 text-keterangan leading-relaxed text-ink-700">
                                    LiLA dan lingkar kepala dianjurkan agar
                                    status gizi lebih akurat.
                                </p>
                            </div>
                        </Seksi>
                    </div>

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
                            Simpan · ke Meja 3
                        </Tombol>
                    </KakiTombol>
                </div>
            </form>
        </>
    );
}
