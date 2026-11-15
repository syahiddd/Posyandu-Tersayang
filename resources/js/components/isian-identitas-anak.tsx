import { Baby, Home, MapPin, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IsianAngka } from '@/components/dasar/isian-angka';
import { AreaTeks, IsianTeks } from '@/components/dasar/isian-teks';
import { KontrolSegmen } from '@/components/dasar/kontrol-segmen';
import type { JenisKelamin } from '@/types';

/** Isian identitas, orang tua, dan alamat anak (PRD Tabel 10). */
export type DataIdentitasAnak = {
    nama: string;
    jenis_kelamin: JenisKelamin | '';
    tempat_lahir: string;
    tanggal_lahir: string;
    nik: string;
    /** "1" = Ya, "0" = Tidak, "" = belum dipilih (huruf K SKDN, FR-61). */
    punya_buku_kia: string;
    nama_ibu: string;
    nik_ibu: string;
    nama_ayah: string;
    nik_ayah: string;
    no_hp: string;
    alamat: string;
    rt: string;
    rw: string;
    dusun: string;
};

export const IDENTITAS_KOSONG: DataIdentitasAnak = {
    nama: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    nik: '',
    punya_buku_kia: '',
    nama_ibu: '',
    nik_ibu: '',
    nama_ayah: '',
    nik_ayah: '',
    no_hp: '',
    alamat: '',
    rt: '',
    rw: '',
    dusun: '',
};

/**
 * Kartu seksi formulir identitas: kepala bergradien blush dengan ikon di tile
 * plum dan keterangan singkat, lalu isi berjarak lega. Dipakai Tambah Anak
 * dan Ubah Data Anak agar keduanya seragam dengan kartu di layar lain.
 */
function KartuIsian({
    judul,
    keterangan,
    ikon: Ikon,
    children,
}: {
    judul: string;
    keterangan: string;
    ikon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-1">
            <div className="flex items-center gap-2.5 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-3.5 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-1">
                    <Ikon
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2.4}
                    />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-label-seksi tracking-[0.12em] text-brand-700 uppercase">
                        {judul}
                    </h2>
                    <p className="text-keterangan leading-snug text-ink-600">
                        {keterangan}
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-4 px-3.5 py-3.5">{children}</div>
        </section>
    );
}

/**
 * Tiga seksi isian anak yang dipakai Tambah Anak (FR-10) dan Ubah Data Anak
 * (FR-52): identitas anak, orang tua, dan alamat. Id isian berbentuk
 * "isian-<nama>" agar ringkasan galat dapat memindahkan fokus.
 *
 * Isian pendek berpasangan dua kolom di tablet (tempat & tanggal lahir, RT &
 * RW, nama & NIK orang tua) sehingga halaman tidak terlalu panjang digulir.
 */
export function IsianIdentitasAnak({
    data,
    ubah,
    galat,
    hariIni,
    daftarDusun,
}: {
    data: DataIdentitasAnak;
    ubah: (nama: keyof DataIdentitasAnak, nilai: string) => void;
    galat: Partial<Record<keyof DataIdentitasAnak, string>>;
    hariIni: string;
    daftarDusun: string[];
}) {
    const teks = (nama: keyof DataIdentitasAnak) => ({
        id: `isian-${nama}`,
        name: nama,
        value: data[nama],
        onChange: (event: { target: { value: string } }) =>
            ubah(nama, event.target.value),
        galat: galat[nama],
    });

    const angka = (nama: keyof DataIdentitasAnak) => ({
        id: `isian-${nama}`,
        name: nama,
        nilai: data[nama],
        onUbah: (nilai: string) => ubah(nama, nilai),
        galat: galat[nama],
    });

    return (
        <>
            <KartuIsian
                judul="Identitas anak"
                keterangan="Data diri anak sesuai Buku KIA."
                ikon={Baby}
            >
                <IsianTeks
                    label="Nama lengkap anak"
                    wajib
                    autoComplete="off"
                    {...teks('nama')}
                />

                <KontrolSegmen
                    id="isian-jenis_kelamin"
                    label="Jenis kelamin"
                    nama="jenis_kelamin"
                    wajib
                    opsi={[
                        { nilai: 'L', label: 'Laki-laki' },
                        { nilai: 'P', label: 'Perempuan' },
                    ]}
                    nilai={data.jenis_kelamin || null}
                    onUbah={(nilai) => ubah('jenis_kelamin', nilai)}
                    galat={galat.jenis_kelamin}
                    kelasTerpilih={(nilai) =>
                        nilai === 'L' ? 'bg-boy-700' : 'bg-girl-700'
                    }
                />

                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    <IsianTeks
                        label="Tempat lahir"
                        autoComplete="off"
                        {...teks('tempat_lahir')}
                    />
                    <IsianTeks
                        jenis="tanggal"
                        label="Tanggal lahir"
                        wajib
                        max={hariIni}
                        {...teks('tanggal_lahir')}
                    />
                </div>

                <IsianAngka
                    jenis="digit"
                    label="NIK anak"
                    petunjuk="16 digit, boleh dikosongkan"
                    maxLength={16}
                    {...angka('nik')}
                />

                <KontrolSegmen
                    id="isian-punya_buku_kia"
                    label="Punya Buku KIA"
                    nama="punya_buku_kia"
                    wajib
                    opsi={[
                        { nilai: '1', label: 'Ya' },
                        { nilai: '0', label: 'Tidak' },
                    ]}
                    nilai={(data.punya_buku_kia || null) as '1' | '0' | null}
                    onUbah={(nilai) => ubah('punya_buku_kia', nilai)}
                    galat={galat.punya_buku_kia}
                />
            </KartuIsian>

            <KartuIsian
                judul="Orang tua"
                keterangan="Nama ibu wajib; NIK dan nama ayah boleh dikosongkan."
                ikon={Users}
            >
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    <IsianTeks
                        label="Nama ibu"
                        wajib
                        autoComplete="off"
                        {...teks('nama_ibu')}
                    />
                    <IsianAngka
                        jenis="digit"
                        label="NIK ibu"
                        petunjuk="16 digit, boleh dikosongkan"
                        maxLength={16}
                        {...angka('nik_ibu')}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    <IsianTeks
                        label="Nama ayah"
                        autoComplete="off"
                        {...teks('nama_ayah')}
                    />
                    <IsianAngka
                        jenis="digit"
                        label="NIK ayah"
                        petunjuk="16 digit, boleh dikosongkan"
                        maxLength={16}
                        {...angka('nik_ayah')}
                    />
                </div>

                <IsianTeks
                    jenis="telepon"
                    label="Nomor HP orang tua"
                    petunjuk="Diawali 08 atau +62"
                    inputMode="tel"
                    autoComplete="tel"
                    {...teks('no_hp')}
                />
            </KartuIsian>

            <KartuIsian
                judul="Alamat"
                keterangan="Alamat rumah dan dusun tempat posyandu melayani."
                ikon={Home}
            >
                <AreaTeks
                    label="Alamat lengkap"
                    wajib
                    rows={2}
                    autoComplete="off"
                    {...teks('alamat')}
                />

                <div className="grid grid-cols-2 gap-4">
                    <IsianAngka
                        jenis="digit"
                        label="RT"
                        maxLength={3}
                        {...angka('rt')}
                    />
                    <IsianAngka
                        jenis="digit"
                        label="RW"
                        maxLength={3}
                        {...angka('rw')}
                    />
                </div>

                <IsianTeks
                    label="Dusun"
                    wajib
                    list="daftar-dusun"
                    autoComplete="off"
                    {...teks('dusun')}
                />
                <datalist id="daftar-dusun">
                    {daftarDusun.map((dusun) => (
                        <option key={dusun} value={dusun} />
                    ))}
                </datalist>

                <p className="flex items-start gap-2 rounded-md bg-brand-50 px-2.5 py-2 text-keterangan leading-relaxed text-ink-700">
                    <MapPin
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                    />
                    Dusun dipakai untuk penyaring Data Anak dan Rekap Imunisasi,
                    jadi tulis nama dusun yang sama setiap kali.
                </p>
            </KartuIsian>
        </>
    );
}
