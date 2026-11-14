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

export function Seksi({
    judul,
    children,
}: {
    judul: string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-label-seksi text-ink-600 uppercase">{judul}</h2>
            {children}
        </section>
    );
}

/**
 * Tiga seksi isian anak yang dipakai Tambah Anak (FR-10) dan Ubah Data Anak
 * (FR-52): identitas anak, orang tua, dan alamat. Id isian berbentuk
 * "isian-<nama>" agar ringkasan galat dapat memindahkan fokus.
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
            <Seksi judul="Identitas anak">
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
                <IsianTeks label="Tempat lahir" {...teks('tempat_lahir')} />
                <IsianTeks
                    jenis="tanggal"
                    label="Tanggal lahir"
                    wajib
                    max={hariIni}
                    {...teks('tanggal_lahir')}
                />
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
            </Seksi>

            <Seksi judul="Orang tua">
                <IsianTeks label="Nama ibu" wajib {...teks('nama_ibu')} />
                <IsianAngka
                    jenis="digit"
                    label="NIK ibu"
                    petunjuk="16 digit, boleh dikosongkan"
                    maxLength={16}
                    {...angka('nik_ibu')}
                />
                <IsianTeks label="Nama ayah" {...teks('nama_ayah')} />
                <IsianAngka
                    jenis="digit"
                    label="NIK ayah"
                    petunjuk="16 digit, boleh dikosongkan"
                    maxLength={16}
                    {...angka('nik_ayah')}
                />
                <IsianTeks
                    jenis="telepon"
                    label="Nomor HP orang tua"
                    petunjuk="Diawali 08 atau +62"
                    inputMode="tel"
                    {...teks('no_hp')}
                />
            </Seksi>

            <Seksi judul="Alamat">
                <AreaTeks
                    label="Alamat lengkap"
                    wajib
                    rows={2}
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
                    {...teks('dusun')}
                />
                <datalist id="daftar-dusun">
                    {daftarDusun.map((dusun) => (
                        <option key={dusun} value={dusun} />
                    ))}
                </datalist>
            </Seksi>
        </>
    );
}
