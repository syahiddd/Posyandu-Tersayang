import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, House, LayoutGrid, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    NavigasiBawah,
    NavigasiRel,
    Sidebar,
} from '@/components/dasar/navigasi';
import type { ItemNavigasi } from '@/components/dasar/navigasi';
import {
    beranda,
    dataAnak,
    dataPosyandu,
    gantiSandi,
    lainnya,
    logout,
    meja,
    pengaturanAkun,
    pilihMeja,
    rekapImunisasi,
} from '@/routes';

/**
 * Tata letak setelah masuk (DESIGN bab 9, PRD 8.2): navigasi bawah di
 * ponsel, rel samping di tablet, sidebar 232 px di desktop. Margin tepi
 * 16/24/32 px. Tautan "Lewati ke konten" pertama kali difokus (bab 10.3).
 */
export default function TataLetakAplikasi({
    children,
}: {
    children: ReactNode;
}) {
    const { url, props } = usePage();
    const { mejaAktif, namaPosyandu, bolehKelolaAkun, name } = props;
    const path = url.split('?')[0];
    const aktif = (href: string) => path === href;
    // Layar turunan (detail, ubah) tetap menandai menu induknya.
    const diBawah = (href: string) =>
        aktif(href) || path.startsWith(`${href}/`);

    const urlMeja = mejaAktif ? meja(mejaAktif.nomor).url : pilihMeja().url;
    const diMeja = path.startsWith('/meja/');
    const diLainnya = [
        lainnya(),
        rekapImunisasi(),
        dataPosyandu(),
        pengaturanAkun(),
        gantiSandi(),
    ]
        .map((rute) => rute.url)
        .some(diBawah);

    const itemUtama: ItemNavigasi[] = [
        {
            label: 'Beranda',
            href: beranda().url,
            ikon: House,
            aktif: aktif(beranda().url),
        },
        { label: 'Meja', href: urlMeja, ikon: ClipboardList, aktif: diMeja },
        {
            label: 'Data Anak',
            href: dataAnak().url,
            ikon: Users,
            aktif: diBawah(dataAnak().url),
        },
        {
            label: 'Lainnya',
            href: lainnya().url,
            ikon: LayoutGrid,
            aktif: diLainnya,
        },
    ];

    const itemSidebar = [
        { label: 'Beranda', href: beranda().url, aktif: aktif(beranda().url) },
        {
            label: mejaAktif
                ? `Meja ${mejaAktif.nomor} · ${mejaAktif.tahap}`
                : 'Meja',
            href: urlMeja,
            aktif: diMeja,
        },
        {
            label: 'Data Anak',
            href: dataAnak().url,
            aktif: diBawah(dataAnak().url),
        },
        {
            label: 'Rekap Imunisasi',
            href: rekapImunisasi().url,
            aktif: aktif(rekapImunisasi().url),
        },
        {
            label: 'Data Posyandu',
            href: dataPosyandu().url,
            aktif: diBawah(dataPosyandu().url),
        },
        ...(bolehKelolaAkun
            ? [
                  {
                      label: 'Pengaturan Akun',
                      href: pengaturanAkun().url,
                      aktif: diBawah(pengaturanAkun().url),
                  },
              ]
            : []),
    ];

    const kelasAksiSidebar =
        'flex min-h-target-min w-full cursor-pointer items-center rounded-md px-3 text-left text-teks text-ink-700 hover:bg-ink-100';

    return (
        <div className="min-h-dvh bg-paper [--offset-toast:168px] tablet:[--offset-toast:92px] desktop:[--offset-toast:24px]">
            <a
                href="#konten"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-teks focus:font-bold"
            >
                Lewati ke konten
            </a>

            <Sidebar
                judul={namaPosyandu ?? name}
                item={itemSidebar}
                kaki={
                    <>
                        <Link href={pilihMeja()} className={kelasAksiSidebar}>
                            Ganti meja
                        </Link>
                        <Link
                            href={logout()}
                            as="button"
                            className={kelasAksiSidebar}
                        >
                            Keluar
                        </Link>
                    </>
                }
            />
            <NavigasiRel item={itemUtama} />
            <NavigasiBawah item={itemUtama} />

            <main
                id="konten"
                className="flex min-h-dvh flex-col px-4 pt-5 pb-19 tablet:pr-5 tablet:pb-0 tablet:pl-30 desktop:pt-6 desktop:pr-6 desktop:pb-6 desktop:pl-66"
            >
                {children}
            </main>
        </div>
    );
}
