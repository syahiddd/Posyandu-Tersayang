import { Head } from '@inertiajs/react';

type Anak = {
    nama?: string | null;
    namaAnak?: string | null;
    umur?: string | null;
    usia?: string | null;
    jenisKelamin?: string | null;
    tanggalLahir?: string | null;
    [key: string]: unknown;
};

type Props = {
    anak: Anak;
    tahap: string;
    pengukuran?: Record<string, unknown> | null;
    pendataan?: Record<string, unknown> | null;
    antreanMeja?: unknown[];
    kunjunganAktif?: number;
};

const kolomInternal = new Set(['id', 'kunjungan_id', 'anak_id', 'created_at', 'updated_at', 'deleted_at']);

function labelKolom(kunci: string) {
    return kunci
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (huruf) => huruf.toLocaleUpperCase());
}

function nilaiTampil(nilai: unknown): string {
    if (nilai === null || nilai === undefined || nilai === '') return 'Belum diisi';
    if (typeof nilai === 'boolean') return nilai ? 'Ya' : 'Tidak';
    if (typeof nilai === 'string' || typeof nilai === 'number') return String(nilai);
    if (Array.isArray(nilai)) return nilai.map(nilaiTampil).join(', ');
    return JSON.stringify(nilai);
}

function RingkasanMejaSebelumnya({ judul, data }: { judul: string; data?: Record<string, unknown> | null }) {
    const entri = Object.entries(data ?? {}).filter(([kunci]) => !kolomInternal.has(kunci));

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{judul}</h3>
            {entri.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Belum ada catatan pada kunjungan ini.</p>
            ) : (
                <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {entri.map(([kunci, nilai]) => (
                        <div key={kunci} className="min-w-0">
                            <dt className="text-sm text-slate-500">{labelKolom(kunci)}</dt>
                            <dd className="mt-1 break-words font-medium text-slate-900">{nilaiTampil(nilai)}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    );
}

export default function Pelayanan({ anak, tahap, pengukuran, pendataan }: Props) {
    const nama = anak.nama ?? anak.namaAnak ?? 'Data anak';
    const umur = anak.umur ?? anak.usia;

    return (
        <>
            <Head title="Meja 4 · Pelayanan" />
            <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
                <header className="rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
                        {tahap || 'Meja 4'}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                        Pelayanan kesehatan anak
                    </h1>
                    <p className="mt-2 text-sm text-slate-700">
                        Tinjau catatan pada Buku KIA dan pastikan pelayanan yang diberikan tercatat dengan jelas.
                    </p>
                </header>

                <section aria-labelledby="identitas-anak" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 id="identitas-anak" className="text-lg font-semibold text-slate-900">
                        Anak yang sedang dilayani
                    </h2>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm text-slate-500">Nama</dt>
                            <dd className="mt-1 font-semibold text-slate-900">{nama}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500">Usia</dt>
                            <dd className="mt-1 font-semibold text-slate-900">{umur || 'Belum tersedia'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500">Jenis kelamin</dt>
                            <dd className="mt-1 font-semibold text-slate-900">{anak.jenisKelamin || 'Belum tersedia'}</dd>
                        </div>
                    </dl>
                </section>

                <section aria-labelledby="catatan-sebelumnya" className="space-y-4">
                    <h2 id="catatan-sebelumnya" className="text-lg font-semibold text-slate-900">
                        Catatan anak dari meja sebelumnya
                    </h2>
                    <RingkasanMejaSebelumnya judul="Hasil pengukuran" data={pengukuran} />
                    <RingkasanMejaSebelumnya judul="Hasil pendataan" data={pendataan} />
                </section>

                <section aria-labelledby="langkah-pelayanan" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 id="langkah-pelayanan" className="text-lg font-semibold text-slate-900">
                        Langkah pelayanan
                    </h2>
                    <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                        <li className="flex gap-3">
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 font-semibold text-sky-800">1</span>
                            <span>Periksa Buku KIA dan riwayat pelayanan anak bersama ibu atau pengasuh.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 font-semibold text-sky-800">2</span>
                            <span>Catat imunisasi, vitamin A, atau obat cacing yang benar-benar diberikan pada kunjungan ini.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 font-semibold text-sky-800">3</span>
                            <span>Sampaikan catatan pelayanan kepada kader Meja 5 untuk bahan penyuluhan.</span>
                        </li>
                    </ol>
                    <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                        Form pencatatan layanan belum tersedia pada halaman ini. Gunakan Buku KIA sebagai catatan utama sampai formulir digital pelayanan tersambung.
                    </p>
                </section>
            </main>
        </>
    );
}
