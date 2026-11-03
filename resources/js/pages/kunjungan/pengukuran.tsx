import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Banner } from '@/components/dasar/banner';
import { HeaderAnak } from '@/components/dasar/header-anak';
import { IsianAngka } from '@/components/dasar/isian-angka';
import { KakiTombol } from '@/components/dasar/kaki-tombol';
import { KontrolSegmen } from '@/components/dasar/kontrol-segmen';
import { RingkasanGalat } from '@/components/dasar/ringkasan-galat';
import { Tombol } from '@/components/dasar/tombol';
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
        sumber: 'posyandu' | 'buku_kia';
        bb: string | null;
        pb_tb: string | null;
        lila: string | null;
        lk: string | null;
    } | null;
};

/**
 * S09 Meja 2 Pengukuran (FR-18 sampai FR-23; DESIGN 5.4, 6.2, Gambar 4).
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
    const [galatLokal, setGalatLokal] = useState<
        Partial<Record<keyof Nilai, string | null>>
    >({});

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
        ? peringatanPerubahan(
              { bb: form.data.bb, pbTb: form.data.pb_tb },
              {
                  bb: sebelumnya.bb,
                  pbTb: sebelumnya.pb_tb,
                  tanggal: sebelumnya.tanggal,
              },
          )
        : [];

    function nilaiLalu(jenis: JenisUkur, satuan: string): string | undefined {
        const nilai = sebelumnya?.[jenis];

        return nilai
            ? `${formatDesimal(Number(nilai))} ${satuan} (${sebelumnya!.tanggal})`
            : undefined;
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

        if (Object.values(hasil).some(Boolean)) {
            return;
        }

        form.put(pengukuran.url(anak.id));
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
                className="flex min-h-dvh flex-col bg-paper [--offset-toast:96px]"
            >
                <HeaderAnak
                    nama={anak.nama}
                    keterangan={`${anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · ${formatUmurBulan(anak.umurBulan)} · Antrean #${String(anak.nomorAntrean).padStart(2, '0')}`}
                    jenisKelamin={anak.jenisKelamin}
                    meja={2}
                    kembali={lepas(anak.id)}
                />

                <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 pt-5 tablet:px-5">
                    {galatServer.kunjungan && (
                        <Banner varian="bahaya">{galatServer.kunjungan}</Banner>
                    )}
                    {anak.perluUkurUlang && (
                        <Banner varian="peringatan" judul="Perlu ukur ulang">
                            {anak.alasanKembali ?? 'Dikembalikan dari Meja 3.'}
                        </Banner>
                    )}
                    <RingkasanGalat
                        galat={ringkasan}
                        labelIsian={{
                            bb: 'isian-bb',
                            pb_tb: 'isian-pb_tb',
                            cara_ukur: 'isian-cara_ukur',
                            lila: 'isian-lila',
                            lk: 'isian-lk',
                        }}
                    />
                    {peringatan.length > 0 && (
                        <Banner varian="peringatan" judul="Periksa lagi">
                            {peringatan.join(' ')} Tetap boleh disimpan.
                        </Banner>
                    )}
                    {!sebelumnya && (
                        <p className="text-kecil text-ink-700">
                            Kunjungan pertama, belum ada nilai pembanding.
                        </p>
                    )}

                    <IsianAngka
                        id="isian-bb"
                        name="bb"
                        label="Berat badan"
                        satuan="kg"
                        wajib
                        nilai={form.data.bb}
                        onUbah={(nilai) => form.setData('bb', nilai)}
                        onBlur={() => periksa('bb')}
                        nilaiLalu={nilaiLalu('bb', 'kg')}
                        galat={galat('bb')}
                    />

                    <div className="flex flex-col gap-3">
                        <IsianAngka
                            id="isian-pb_tb"
                            name="pb_tb"
                            label={labelPbTb}
                            satuan="cm"
                            wajib
                            nilai={form.data.pb_tb}
                            onUbah={(nilai) => form.setData('pb_tb', nilai)}
                            onBlur={() => periksa('pb_tb')}
                            nilaiLalu={nilaiLalu('pb_tb', 'cm')}
                            galat={galat('pb_tb')}
                        />
                        <KontrolSegmen
                            id="isian-cara_ukur"
                            label="Cara ukur"
                            nama="cara_ukur"
                            opsi={[
                                { nilai: 'telentang', label: 'Telentang' },
                                { nilai: 'berdiri', label: 'Berdiri' },
                            ]}
                            nilai={form.data.cara_ukur}
                            onUbah={(nilai) => form.setData('cara_ukur', nilai)}
                            galat={galat('cara_ukur')}
                        />
                    </div>

                    <IsianAngka
                        id="isian-lila"
                        name="lila"
                        label="Lingkar lengan atas"
                        satuan="cm"
                        dianjurkan
                        nilai={form.data.lila}
                        onUbah={(nilai) => form.setData('lila', nilai)}
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
                        onUbah={(nilai) => form.setData('lk', nilai)}
                        onBlur={() => periksa('lk')}
                        nilaiLalu={nilaiLalu('lk', 'cm')}
                        galat={galat('lk')}
                    />

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
                </main>
            </form>
        </>
    );
}
