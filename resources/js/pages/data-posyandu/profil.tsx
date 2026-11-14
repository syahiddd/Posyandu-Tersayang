import { Head } from '@inertiajs/react';
import { Banner } from '@/components/dasar/banner';
import { Kartu } from '@/components/dasar/kartu';
import { TombolTautan } from '@/components/dasar/tombol';
import { TombolUnduhCsv } from '@/components/tombol-unduh-csv';
import { dataPosyandu } from '@/routes';
import { ubah, unduh } from '@/routes/data-posyandu';

export type ProfilPosyandu = {
    nama: string | null;
    desa_kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    puskesmas_pembina: string | null;
    alamat: string | null;
    jadwal_kegiatan: string | null;
};

/** Rekap satu bulan (FR-61, FR-62); persen sudah berkoma dari server. */
type RekapBulanan = {
    bulan: string;
    label: string;
    sebelumnya: string;
    berikutnya: string | null;
    s: number;
    k: number;
    d: number;
    n: number;
    persenDS: string | null;
    persenND: string | null;
    imunisasi: number;
    vitaminABiru: number;
    vitaminAMerah: number;
    obatCacing: number;
};

type Props = {
    profil: ProfilPosyandu;
    rekap: RekapBulanan;
    bolehUbah: boolean;
    kader: {
        id: number;
        nama: string;
        peran: string;
        noHp: string | null;
        mejaBiasa: string | null;
    }[];
};

const BARIS_PROFIL: { kunci: keyof ProfilPosyandu; label: string }[] = [
    { kunci: 'desa_kelurahan', label: 'Desa/kelurahan' },
    { kunci: 'kecamatan', label: 'Kecamatan' },
    { kunci: 'kabupaten_kota', label: 'Kabupaten/kota' },
    { kunci: 'puskesmas_pembina', label: 'Puskesmas pembina' },
    { kunci: 'alamat', label: 'Alamat' },
    { kunci: 'jadwal_kegiatan', label: 'Jadwal kegiatan' },
];

/** Satu baris nilai: label kiri, angka kanan. */
function BarisAngka({
    label,
    nilai,
    tebal = false,
}: {
    label: string;
    nilai: string | number;
    tebal?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-kecil text-ink-700">{label}</dt>
            <dd
                className={
                    tebal
                        ? 'text-angka text-ink-900 tabular-nums'
                        : 'text-teks font-bold text-ink-900 tabular-nums'
                }
            >
                {nilai}
            </dd>
        </div>
    );
}

function persen(nilai: string | null): string {
    return nilai === null ? '—' : nilai + '%';
}

/**
 * S19 Data Posyandu (DESIGN 6.5): kartu profil (FR-59); rekap SKDN bulan
 * berjalan dengan persentase D/S dan N/D (FR-61); jumlah layanan per bulan
 * dan tempat jumlah per status gizi (FR-62); daftar kader dengan nomor HP
 * dan meja yang biasa dipegang (FR-60). Profil diubah oleh Ketua Kader.
 * Unduh CSV berisi rekap setiap bulan pada tahun yang ditampilkan (FR-63).
 */
export default function DataPosyandu({
    profil,
    rekap,
    bolehUbah,
    kader,
}: Props) {
    return (
        <>
            <Head title="Data Posyandu" />
            <div className="flex flex-col gap-4 desktop:max-w-3xl">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-judul-1 text-ink-900">Data Posyandu</h1>
                    <div className="flex flex-col items-start gap-1">
                        <TombolUnduhCsv
                            url={unduh.url({
                                query: { tahun: rekap.bulan.slice(0, 4) },
                            })}
                        />
                        <p className="text-keterangan text-ink-700">
                            Rekap setiap bulan tahun {rekap.bulan.slice(0, 4)}
                        </p>
                    </div>
                </header>

                <Kartu judul={profil.nama ?? 'Profil posyandu belum diisi'}>
                    <dl className="divide-y divide-ink-200">
                        {BARIS_PROFIL.map(({ kunci, label }) => (
                            <div
                                key={kunci}
                                className="flex flex-col gap-0.5 py-3 tablet:flex-row tablet:justify-between tablet:gap-4"
                            >
                                <dt className="text-kecil text-ink-700">
                                    {label}
                                </dt>
                                <dd className="text-teks font-bold text-ink-900 tablet:text-right">
                                    {profil[kunci] || '—'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    {bolehUbah && (
                        <TombolTautan
                            href={ubah()}
                            varian="sekunder"
                            className="mt-2"
                        >
                            Ubah profil
                        </TombolTautan>
                    )}
                </Kartu>

                <section
                    aria-labelledby="judul-rekap"
                    className="flex flex-col gap-3"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2
                            id="judul-rekap"
                            className="text-judul-2 text-ink-900"
                        >
                            Rekap {rekap.label}
                        </h2>
                        <nav
                            aria-label="Pilih bulan rekap"
                            className="flex flex-wrap gap-2"
                        >
                            <TombolTautan
                                href={dataPosyandu({
                                    query: { bulan: rekap.sebelumnya },
                                })}
                                varian="sekunder"
                                preserveScroll
                            >
                                ‹ Bulan sebelumnya
                            </TombolTautan>
                            {rekap.berikutnya !== null && (
                                <TombolTautan
                                    href={dataPosyandu({
                                        query: { bulan: rekap.berikutnya },
                                    })}
                                    varian="sekunder"
                                    preserveScroll
                                >
                                    Bulan berikutnya ›
                                </TombolTautan>
                            )}
                        </nav>
                    </div>

                    <Kartu labelSeksi="SKDN">
                        <dl className="divide-y divide-ink-200">
                            <BarisAngka
                                label="S · Balita sasaran (0–59 bulan)"
                                nilai={rekap.s}
                            />
                            <BarisAngka
                                label="K · Balita punya Buku KIA"
                                nilai={rekap.k}
                            />
                            <BarisAngka
                                label="D · Balita ditimbang"
                                nilai={rekap.d}
                            />
                            <BarisAngka
                                label="N · Berat badan naik"
                                nilai={rekap.n}
                            />
                            <BarisAngka
                                label="D/S · Partisipasi penimbangan"
                                nilai={persen(rekap.persenDS)}
                                tebal
                            />
                            <BarisAngka
                                label="N/D · Naik dari yang ditimbang"
                                nilai={persen(rekap.persenND)}
                                tebal
                            />
                        </dl>
                    </Kartu>

                    <Kartu labelSeksi="Layanan bulan ini">
                        <dl className="divide-y divide-ink-200">
                            <BarisAngka
                                label="Imunisasi (dosis)"
                                nilai={rekap.imunisasi}
                            />
                            <BarisAngka
                                label="Vitamin A kapsul biru"
                                nilai={rekap.vitaminABiru}
                            />
                            <BarisAngka
                                label="Vitamin A kapsul merah"
                                nilai={rekap.vitaminAMerah}
                            />
                            <BarisAngka
                                label="Obat cacing"
                                nilai={rekap.obatCacing}
                            />
                        </dl>
                    </Kartu>

                    <Kartu labelSeksi="Status gizi dan risiko stunting">
                        <Banner varian="info" judul="Belum tersedia">
                            Jumlah anak per status gizi dan risiko stunting
                            belum dihitung di versi ini. Status gizi tiap anak
                            tampil di Meja 5 dan di Detail Anak.
                        </Banner>
                    </Kartu>
                </section>

                <Kartu labelSeksi={`Kader (${kader.length})`}>
                    <ul className="divide-y divide-ink-200">
                        {kader.map((satu) => (
                            <li
                                key={satu.id}
                                className="flex flex-col gap-0.5 py-3"
                            >
                                <span className="text-teks font-bold text-ink-900">
                                    {satu.nama}
                                    {satu.peran !== 'Kader' && (
                                        <span className="font-normal text-ink-700">
                                            {' '}
                                            · {satu.peran}
                                        </span>
                                    )}
                                </span>
                                <span className="text-kecil text-ink-700">
                                    {satu.noHp ? (
                                        <a
                                            href={`tel:${satu.noHp}`}
                                            className="underline underline-offset-4"
                                        >
                                            {satu.noHp}
                                        </a>
                                    ) : (
                                        'Nomor HP belum diisi'
                                    )}
                                    {satu.mejaBiasa &&
                                        ` · Biasa di ${satu.mejaBiasa}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Kartu>
            </div>
        </>
    );
}
