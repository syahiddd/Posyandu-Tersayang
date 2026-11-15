import { clsx } from 'clsx';
import { CalendarDays, Ruler, Scale, Sprout } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { ChipStatus } from '@/components/dasar/chip-status';
import { Tombol } from '@/components/dasar/tombol';
import {
    formatSatuDesimal,
    formatZ,
    labelGaris,
    nilaiGaris,
    tebalGaris,
    tick,
    titikDalamRentang,
    warnaGaris,
    zonaIndeks,
} from '@/lib/grafik';
import type {
    DataGrafik,
    IndeksGrafik,
    TitikAnak,
    WarnaZona,
} from '@/lib/grafik';
import { formatUmurLengkap } from '@/lib/umur';
import type { VarianChip } from '@/components/dasar/chip-status';
import type { JenisKelamin } from '@/types';

const WARNA_ZONA: Record<WarnaZona, string> = {
    aman: 'var(--color-zona-aman-lembut)',
    'tidak-aman': 'var(--color-zona-tidak-aman-lembut)',
};

const KELAS_ZONA: Record<WarnaZona, string> = {
    aman: 'bg-zona-aman',
    'tidak-aman': 'bg-zona-tidak-aman',
};

/** Legenda sederhana: hijau = aman, merah = tidak aman. */
const LEGENDA_ZONA: { warna: WarnaZona; label: string }[] = [
    { warna: 'aman', label: 'Aman' },
    { warna: 'tidak-aman', label: 'Tidak aman' },
];

/** Ruang di sekitar area plot: label sumbu kiri dan bawah, pil garis kanan. */
const TEPI = { kiri: 40, kanan: 40, atas: 22, bawah: 40 };

const BULAN = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agt',
    'Sep',
    'Okt',
    'Nov',
    'Des',
];

/** Contoh: "10 Agt 2026", sama dengan format tanggal server (Tanggal::singkat). */
function tanggalPendek(tanggal: string): string {
    const [tahun, bulan, hari] = tanggal.split('-').map(Number);

    return `${hari} ${BULAN[bulan - 1]} ${tahun}`;
}

/** Warna chip kategori agar ibu langsung paham aman/tidak. */
function varianKategori(kategori: string): VarianChip {
    const teks = kategori.toLowerCase();

    if (
        teks.includes('normal') ||
        teks.includes('baik') ||
        teks.includes('tinggi')
    ) {
        return 'normal';
    }

    if (teks.includes('lebih') || teks.includes('risiko')) {
        return 'waspada';
    }

    return 'bahaya';
}

/** Label manusiawi untuk nilai sumbu Y per jenis grafik. */
function labelNilai(indeks: IndeksGrafik, data: DataGrafik): string {
    switch (indeks) {
        case 'bb_u':
        case 'kms':
            return 'Berat badan';
        case 'pb_tb_u':
            return 'Panjang/tinggi';
        case 'bb_pb_tb':
            return 'Berat';
        case 'imt_u':
            return 'IMT';
        case 'lk_u':
            return 'Lingkar kepala';
        default:
            return data.sumbuY;
    }
}

function satuanNilai(data: DataGrafik): string {
    return data.sumbuY;
}

/** Teks satu titik untuk keterangan dan pembaca layar. */
function teksTitik(data: DataGrafik, titik: TitikAnak, indeks: IndeksGrafik) {
    const waktu = titik.hariIni ? 'Hari ini' : tanggalPendek(titik.tanggal);
    const nilai =
        indeks === 'bb_pb_tb'
            ? `${formatSatuDesimal(titik.y)} kg pada ${formatSatuDesimal(titik.x)} cm`
            : `${formatSatuDesimal(titik.y)} ${satuanNilai(data)}`;
    const z = titik.zScore === null ? null : `z ${formatZ(titik.zScore)}`;
    const umur = formatUmurLengkap(titik.umurBulan);

    return {
        baris1: `${waktu} · ${umur}`,
        baris2: [nilai, z].filter(Boolean).join(' · '),
        baris3: `${titik.kategori}${titik.dariBukuKia ? ' · dari Buku KIA' : ''}`,
        waktu,
        umur,
        nilai,
        z,
        kategori: titik.kategori,
        dariBukuKia: titik.dariBukuKia,
    };
}

/**
 * Grafik pertumbuhan (DESIGN 7.1, Gambar 8; PRD 5.7): digambar ulang dari
 * tabel standar WHO dengan zona warna di belakang garis z-score, latar
 * sesuai jenis kelamin, titik kunjungan dihubungkan garis, keterangan
 * titik, legenda, dan alternatif tabel.
 */
export function GrafikPertumbuhan({
    data,
    indeks,
    jenisKelamin,
}: {
    data: DataGrafik;
    indeks: IndeksGrafik;
    jenisKelamin: JenisKelamin;
}) {
    const refWadah = useRef<HTMLDivElement>(null);
    const [lebar, setLebar] = useState(0);
    const [tabel, setTabel] = useState(false);
    const titik = titikDalamRentang(data);
    const titikHariIni = titik.find((satu) => satu.hariIni) ?? null;
    const [dipilih, setDipilih] = useState<number | null>(
        titikHariIni?.id ?? null,
    );
    const idTabel = useId();

    useEffect(() => {
        const wadah = refWadah.current;

        if (!wadah) {
            return;
        }

        const amati = new ResizeObserver(([entri]) => {
            setLebar(Math.floor(entri.contentRect.width));
        });
        amati.observe(wadah);

        return () => amati.disconnect();
    }, []);

    // Grafik lain (tab baru): kembali menyorot titik hari ini.
    useEffect(() => {
        setDipilih(titikHariIni?.id ?? null);
    }, [indeks, titikHariIni?.id]);

    // DESIGN bab 9: tinggi 230 px di ponsel, 300 px mulai tablet.
    const tinggi = lebar < 600 ? 230 : 300;
    const lebarPlot = Math.max(lebar - TEPI.kiri - TEPI.kanan, 1);
    const tinggiPlot = tinggi - TEPI.atas - TEPI.bawah;

    const skalaX = (x: number) =>
        TEPI.kiri +
        ((x - data.dariX) / (data.sampaiX - data.dariX)) * lebarPlot;
    const skalaY = (y: number) =>
        TEPI.atas +
        (1 - (y - data.minimumY) / (data.maksimumY - data.minimumY)) *
            tinggiPlot;

    const xAcuan = data.garis[0]?.titik.map((satu) => satu.x) ?? [];
    const zona = zonaIndeks(indeks);
    const warnaAnak =
        jenisKelamin === 'L' ? 'var(--color-boy-700)' : 'var(--color-girl-700)';
    const idKlip = `${idTabel}-klip`;

    function polygonZona(bawah: number | null, atas: number | null): string {
        const garisBawah = nilaiGaris(data.garis, bawah);
        const garisAtas = nilaiGaris(data.garis, atas);
        const titikAtas: string[] = [];
        const titikBawah: string[] = [];

        for (const x of xAcuan) {
            const yAtas = garisAtas ? garisAtas.get(x) : data.maksimumY + 100;
            const yBawah = garisBawah ? garisBawah.get(x) : data.minimumY - 100;

            if (yAtas === undefined || yBawah === undefined) {
                continue;
            }

            titikAtas.push(`${skalaX(x)},${skalaY(yAtas)}`);
            titikBawah.unshift(`${skalaX(x)},${skalaY(yBawah)}`);
        }

        return [...titikAtas, ...titikBawah].join(' ');
    }

    const pilihan = titik.find((satu) => satu.id === dipilih) ?? null;
    const keterangan = pilihan ? teksTitik(data, pilihan, indeks) : null;
    const posisiKeterangan = pilihan
        ? { x: skalaX(pilihan.x), y: skalaY(pilihan.y) }
        : null;

    const ticksX = tick(data.dariX, data.sampaiX, data.intervalX);
    const ticksY = tick(data.minimumY, data.maksimumY, data.intervalY);
    const garisTerlihat = data.garis.filter((satu) => satu.terlihat);

    return (
        <div className="flex flex-col gap-3">
            <div
                ref={refWadah}
                className="relative w-full"
                style={{ height: tinggi }}
            >
                {lebar > 0 ? (
                    <svg width={lebar} height={tinggi} className="block">
                        <g
                            role="img"
                            aria-label={`${data.judul}. ${
                                titikHariIni
                                    ? (() => {
                                          const teks = teksTitik(
                                              data,
                                              titikHariIni,
                                              indeks,
                                          );

                                          return `${teks.baris1}, ${teks.baris2}, ${teks.baris3}.`;
                                      })()
                                    : 'Belum ada titik pengukuran pada rentang grafik ini.'
                            } Rincian ada di Lihat sebagai tabel.`}
                        >
                            <defs>
                                <clipPath id={idKlip}>
                                    <rect
                                        x={TEPI.kiri}
                                        y={TEPI.atas}
                                        width={lebarPlot}
                                        height={tinggiPlot}
                                    />
                                </clipPath>
                            </defs>

                            {/* Latar netral hangat agar warna zona tetap lembut. */}
                            <rect
                                x={TEPI.kiri}
                                y={TEPI.atas}
                                width={lebarPlot}
                                height={tinggiPlot}
                                fill="var(--color-white)"
                            />

                            <g clipPath={`url(#${idKlip})`}>
                                {zona.map((satu) => (
                                    <polygon
                                        key={`${satu.bawah}-${satu.atas}`}
                                        points={polygonZona(
                                            satu.bawah,
                                            satu.atas,
                                        )}
                                        fill={WARNA_ZONA[satu.warna]}
                                        fillOpacity={1}
                                    />
                                ))}

                                {ticksX.map((x) => (
                                    <line
                                        key={`gx-${x}`}
                                        x1={skalaX(x)}
                                        x2={skalaX(x)}
                                        y1={TEPI.atas}
                                        y2={TEPI.atas + tinggiPlot}
                                        stroke="var(--color-ink-200)"
                                        strokeWidth={1}
                                    />
                                ))}
                                {ticksY.map((y) => (
                                    <line
                                        key={`gy-${y}`}
                                        x1={TEPI.kiri}
                                        x2={TEPI.kiri + lebarPlot}
                                        y1={skalaY(y)}
                                        y2={skalaY(y)}
                                        stroke="var(--color-ink-200)"
                                        strokeWidth={1}
                                    />
                                ))}

                                {garisTerlihat.map((satu) => (
                                    <polyline
                                        key={`z-${satu.z}`}
                                        points={satu.titik
                                            .map(
                                                (t) =>
                                                    `${skalaX(t.x)},${skalaY(t.y)}`,
                                            )
                                            .join(' ')}
                                        fill="none"
                                        stroke={warnaGaris(satu.z)}
                                        strokeWidth={tebalGaris(satu.z)}
                                    />
                                ))}

                                {titik.length > 1 && (
                                    <polyline
                                        points={titik
                                            .map(
                                                (t) =>
                                                    `${skalaX(t.x)},${skalaY(t.y)}`,
                                            )
                                            .join(' ')}
                                        fill="none"
                                        stroke={warnaAnak}
                                        strokeWidth={2}
                                    />
                                )}
                            </g>

                            <rect
                                x={TEPI.kiri}
                                y={TEPI.atas}
                                width={lebarPlot}
                                height={tinggiPlot}
                                fill="none"
                                stroke="var(--color-ink-400)"
                                strokeWidth={1}
                            />

                            {/* Sumbu: label minimal 12 px, satuan di atas sumbu Y. */}
                            {ticksX.map((x) => (
                                <text
                                    key={`tx-${x}`}
                                    x={skalaX(x)}
                                    y={TEPI.atas + tinggiPlot + 16}
                                    textAnchor="middle"
                                    fontSize={12}
                                    fill="var(--color-ink-600)"
                                >
                                    {x}
                                </text>
                            ))}
                            {ticksY.map((y) => (
                                <text
                                    key={`ty-${y}`}
                                    x={TEPI.kiri - 6}
                                    y={skalaY(y) + 4}
                                    textAnchor="end"
                                    fontSize={12}
                                    fill="var(--color-ink-600)"
                                >
                                    {y}
                                </text>
                            ))}
                            <text
                                x={TEPI.kiri - 6}
                                y={12}
                                textAnchor="end"
                                fontSize={12}
                                fontWeight={700}
                                fill="var(--color-ink-900)"
                            >
                                {data.sumbuY}
                            </text>
                            <text
                                x={TEPI.kiri + lebarPlot / 2}
                                y={tinggi - 4}
                                textAnchor="middle"
                                fontSize={12}
                                fill="var(--color-ink-600)"
                            >
                                {data.sumbuX}
                            </text>

                            {/* Label garis: pil kecil di ujung kanan. */}
                            {garisTerlihat.map((satu) => {
                                const akhir = satu.titik[satu.titik.length - 1];

                                if (
                                    !akhir ||
                                    akhir.y < data.minimumY ||
                                    akhir.y > data.maksimumY
                                ) {
                                    return null;
                                }

                                const y = skalaY(akhir.y);

                                return (
                                    <g key={`pil-${satu.z}`} aria-hidden="true">
                                        <rect
                                            x={TEPI.kiri + lebarPlot + 4}
                                            y={y - 8}
                                            width={30}
                                            height={16}
                                            rx={8}
                                            fill={warnaGaris(satu.z)}
                                        />
                                        <text
                                            x={TEPI.kiri + lebarPlot + 19}
                                            y={y + 4}
                                            textAnchor="middle"
                                            fontSize={12}
                                            fontWeight={700}
                                            fill="var(--color-white)"
                                        >
                                            {labelGaris(satu.z)}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>

                        {/* Titik anak: lalu = lingkaran putih bergaris; hari ini = penuh
                            dengan halo. Di luar role="img" agar tombolnya terbaca. */}
                        {titik.map((satu) => {
                            const x = skalaX(satu.x);
                            const y = skalaY(satu.y);
                            const teks = teksTitik(data, satu, indeks);

                            return (
                                <g
                                    key={satu.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${teks.baris1}, ${teks.baris2}, ${teks.baris3}`}
                                    aria-pressed={dipilih === satu.id}
                                    onClick={() => setDipilih(satu.id)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            setDipilih(satu.id);
                                        }
                                    }}
                                    className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-ink-900"
                                >
                                    {/* Area sentuh 24 px; garis fokus tampil saat dipilih keyboard. */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={12}
                                        fill="transparent"
                                        stroke="transparent"
                                        strokeWidth={3}
                                    />
                                    {satu.hariIni && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={9}
                                            fill={warnaAnak}
                                            fillOpacity={0.2}
                                        />
                                    )}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={satu.hariIni ? 5.5 : 4.5}
                                        fill={
                                            satu.hariIni
                                                ? warnaAnak
                                                : 'var(--color-white)'
                                        }
                                        stroke={warnaAnak}
                                        strokeWidth={2}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    // DESIGN Tabel 33: kerangka grafik selama ukuran belum diketahui.
                    <div className="h-full w-full animate-pulse rounded-md bg-ink-100" />
                )}

                {keterangan && posisiKeterangan && lebar > 0 && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute z-10 w-56 overflow-hidden rounded-md border border-brand-200 bg-white text-ink-900 shadow-2"
                        style={{
                            left: Math.min(
                                Math.max(posisiKeterangan.x + 12, 4),
                                Math.max(lebar - 228, 4),
                            ),
                            top:
                                posisiKeterangan.y > tinggi / 2
                                    ? Math.max(posisiKeterangan.y - 132, 0)
                                    : Math.min(
                                          posisiKeterangan.y + 12,
                                          tinggi - 132,
                                      ),
                        }}
                    >
                        <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-3 py-1.5 text-white">
                            <p className="text-kecil leading-tight font-bold">
                                {keterangan.waktu}
                            </p>
                            <p className="text-keterangan leading-tight text-brand-100">
                                Umur {keterangan.umur}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-keterangan text-ink-600">
                                    <Scale
                                        aria-hidden="true"
                                        className="size-3.5 shrink-0 text-brand-700"
                                    />
                                    Hasil ukur
                                </span>
                                <span className="text-kecil font-bold text-ink-900 tabular-nums">
                                    {keterangan.nilai}
                                </span>
                            </div>
                            {keterangan.z && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-keterangan text-ink-600">
                                        <Ruler
                                            aria-hidden="true"
                                            className="size-3.5 shrink-0 text-brand-700"
                                        />
                                        z-score
                                    </span>
                                    <span className="text-kecil font-bold text-ink-900 tabular-nums">
                                        {keterangan.z}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 border-t border-brand-100 bg-brand-50/60 px-3 py-1.5">
                            <ChipStatus
                                varian={varianKategori(keterangan.kategori)}
                            >
                                {keterangan.kategori}
                            </ChipStatus>
                            {keterangan.dariBukuKia && (
                                <span className="text-keterangan text-ink-600">
                                    Buku KIA
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {titik.length <= 1 && (
                <p className="text-kecil text-ink-700">
                    {titik.length === 0
                        ? 'Belum ada titik pengukuran pada rentang grafik ini.'
                        : 'Kunjungan pertama, belum ada perbandingan.'}
                </p>
            )}

            {/* Ringkasan titik terpilih: mudah dibaca tanpa harus menebak warna. */}
            {pilihan && (
                <div className="rounded-md border border-brand-100 bg-gradient-to-br from-white via-brand-50/60 to-brand-100 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span
                                aria-hidden="true"
                                className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1"
                            >
                                <CalendarDays className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-kecil font-bold text-ink-900">
                                    {pilihan.hariIni
                                        ? 'Pengukuran hari ini'
                                        : tanggalPendek(pilihan.tanggal)}
                                </p>
                                <p className="text-keterangan text-ink-600">
                                    Umur {formatUmurLengkap(pilihan.umurBulan)}
                                </p>
                            </div>
                        </div>
                        <ChipStatus varian={varianKategori(pilihan.kategori)}>
                            {pilihan.kategori}
                        </ChipStatus>
                    </div>

                    <dl className="mt-2.5 grid grid-cols-2 gap-2">
                        <div className="rounded-sm border border-brand-100 bg-white/80 px-2.5 py-1.5">
                            <dt className="flex items-center gap-1 text-keterangan text-ink-500">
                                <Scale
                                    aria-hidden="true"
                                    className="size-3.5 text-brand-700"
                                />
                                {indeks === 'bb_pb_tb'
                                    ? 'Berat'
                                    : labelNilai(indeks, data)}
                            </dt>
                            <dd className="text-teks font-bold text-ink-900 tabular-nums">
                                {indeks === 'bb_pb_tb'
                                    ? `${formatSatuDesimal(pilihan.y)} kg`
                                    : `${formatSatuDesimal(pilihan.y)} ${data.sumbuY}`}
                            </dd>
                        </div>
                        <div className="rounded-sm border border-brand-100 bg-white/80 px-2.5 py-1.5">
                            <dt className="flex items-center gap-1 text-keterangan text-ink-500">
                                <Ruler
                                    aria-hidden="true"
                                    className="size-3.5 text-brand-700"
                                />
                                {indeks === 'bb_pb_tb' ? 'Panjang' : 'z-score'}
                            </dt>
                            <dd className="text-teks font-bold text-ink-900 tabular-nums">
                                {indeks === 'bb_pb_tb'
                                    ? `${formatSatuDesimal(pilihan.x)} cm`
                                    : pilihan.zScore === null
                                      ? '—'
                                      : formatZ(pilihan.zScore)}
                            </dd>
                        </div>
                    </dl>

                    {pilihan.dariBukuKia && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-keterangan text-ink-600">
                            <Sprout
                                aria-hidden="true"
                                className="size-3.5 text-brand-700"
                            />
                            Dicatat dari Buku KIA
                        </p>
                    )}
                </div>
            )}

            {/* Legenda zona (DESIGN 7.1): dua warna saja agar cepat dibaca. */}
            <div className="rounded-md border border-brand-100 bg-white/70 px-3 py-2">
                <p className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                    Keterangan warna
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-kecil text-ink-900">
                    {LEGENDA_ZONA.map((satu) => (
                        <li
                            key={satu.warna}
                            className="flex items-center gap-2"
                        >
                            <span
                                aria-hidden="true"
                                className={clsx(
                                    'size-3.5 rounded-sm border border-ink-300',
                                    KELAS_ZONA[satu.warna],
                                )}
                            />
                            <span className="font-bold">
                                {satu.warna === 'aman' ? 'Aman' : 'Tidak aman'}
                            </span>
                            <span className="text-keterangan text-ink-600">
                                {satu.warna === 'aman'
                                    ? 'sesuai umur'
                                    : 'perlu perhatian'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <p className="text-keterangan text-ink-600">
                Batas kategori mengikuti Buku KIA; sumber standar WHO, Permenkes
                Nomor 2 Tahun 2020.
            </p>

            <div>
                <Tombol
                    varian="tersier"
                    className="-ml-2"
                    aria-expanded={tabel}
                    aria-controls={idTabel}
                    onClick={() => setTabel((nilai) => !nilai)}
                >
                    {tabel ? 'Tutup tabel' : 'Lihat sebagai tabel'}
                </Tombol>
            </div>

            {tabel && (
                <div id={idTabel} className="-mx-4 overflow-x-auto">
                    <table className="w-full text-left text-kecil">
                        <caption className="sr-only">
                            {data.judul}, semua kunjungan
                        </caption>
                        <thead>
                            <tr className="border-b border-ink-200 text-ink-700">
                                <th scope="col" className="px-4 py-2">
                                    Tanggal
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    Umur
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    Nilai
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    z-score
                                </th>
                                <th scope="col" className="px-4 py-2">
                                    Kategori
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...data.titik]
                                .sort((a, b) =>
                                    b.tanggal.localeCompare(a.tanggal),
                                )
                                .map((satu) => (
                                    <tr
                                        key={satu.id}
                                        className="border-b border-ink-200 text-ink-900"
                                    >
                                        <td className="px-4 py-2">
                                            {tanggalPendek(satu.tanggal)}
                                            {satu.hariIni && (
                                                <span className="font-bold">
                                                    {' '}
                                                    · hari ini
                                                </span>
                                            )}
                                            {satu.dariBukuKia && (
                                                <span className="text-ink-700">
                                                    {' '}
                                                    · Buku KIA
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 text-right tabular-nums">
                                            {satu.umurBulan} bln
                                        </td>
                                        <td className="px-2 py-2 text-right tabular-nums">
                                            {indeks === 'bb_pb_tb'
                                                ? `${formatSatuDesimal(satu.y)} kg · ${formatSatuDesimal(satu.x)} cm`
                                                : `${formatSatuDesimal(satu.y)} ${data.sumbuY}`}
                                        </td>
                                        <td className="px-2 py-2 text-right tabular-nums">
                                            {satu.zScore === null
                                                ? '—'
                                                : formatZ(satu.zScore)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {satu.kategori}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
