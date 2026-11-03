<?php

namespace App\Http\Controllers;

use App\Anak\TampilanDetailAnak;
use App\Enums\JenisLayanan;
use App\Enums\SumberData;
use App\Http\Requests\SimpanRiwayatBukuKiaRequest;
use App\Models\Anak;
use App\Models\Layanan;
use App\Models\Pengukuran;
use App\Support\Umur;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S17 Tambah Riwayat dari Buku KIA (FR-64 sampai FR-66, DESIGN 5.9):
 * entri disimpan bersumber Buku KIA tanpa kunjungan, sehingga ikut dipakai
 * rekomendasi imunisasi Meja 4 dan grafik pertumbuhan. Batal 5 detik
 * menghapus entri terakhir (DESIGN Prinsip 1).
 */
class RiwayatBukuKiaController extends Controller
{
    private const KUNCI_URUNGAN = 'urunganRiwayat';

    /** Batal 5 detik ditambah toleransi jeda jaringan, sama dengan antrean. */
    private const DETIK_URUNGAN = 7;

    public function create(Anak $anak): Response
    {
        Gate::authorize('update', $anak);

        $sudah = $anak->layanan()
            ->where('jenis', JenisLayanan::Imunisasi)
            ->pluck('tanggal', 'detail');

        /** @var array<string, array{nama: string, umur_bulan: int}> $vaksin */
        $vaksin = config('imunisasi.vaksin');
        /** @var array<string, array{jenis: string, nama: string, umur_min: int, umur_maks: int|null}> $vitaminObat */
        $vitaminObat = config('imunisasi.vitamin_obat');

        return Inertia::render('data-anak/riwayat-buku-kia', [
            'anak' => [
                'id' => $anak->id,
                'nama' => $anak->nama,
                'jenisKelamin' => $anak->jenis_kelamin->value,
                'umurBulan' => Umur::bulanPenuh($anak->tanggal_lahir),
                'tanggalLahir' => $anak->tanggal_lahir->toDateString(),
            ],
            'hariIni' => today()->toDateString(),
            'daftarVaksin' => collect($vaksin)->map(fn (array $satu, string $kode) => [
                'kode' => $kode,
                'nama' => $satu['nama'],
                'umurBulan' => $satu['umur_bulan'],
                'sudahTercatat' => $sudah->has($kode),
            ])->values(),
            'daftarVitaminObat' => collect($vitaminObat)->map(fn (array $satu, string $kode) => [
                'kode' => $kode,
                'nama' => $satu['nama'],
                'umurMin' => $satu['umur_min'],
                'umurMaks' => $satu['umur_maks'],
            ])->values(),
            'layanan' => array_values(array_filter(TampilanDetailAnak::layanan($anak), fn (array $satu) => $satu['dariBukuKia'])),
            'pengukuran' => array_values(array_filter(TampilanDetailAnak::pengukuran($anak), fn (array $satu) => $satu['dariBukuKia'])),
        ]);
    }

    public function store(SimpanRiwayatBukuKiaRequest $request, Anak $anak): RedirectResponse
    {
        $data = $request->validated();

        $entri = match ($data['jenis']) {
            'imunisasi' => $anak->layanan()->create([
                'jenis' => JenisLayanan::Imunisasi,
                'detail' => $data['vaksin'],
                'tanggal' => $data['tanggal'],
                'sumber' => SumberData::BukuKia,
            ]),
            'vitamin_obat' => $anak->layanan()->create([
                'jenis' => config("imunisasi.vitamin_obat.{$data['layanan']}.jenis"),
                'detail' => $data['layanan'],
                'tanggal' => $data['tanggal'],
                'sumber' => SumberData::BukuKia,
            ]),
            default => $anak->pengukuran()->create([
                'tanggal_ukur' => $data['tanggal'],
                'sumber' => SumberData::BukuKia,
                ...collect(SimpanRiwayatBukuKiaRequest::UKUR)->mapWithKeys(fn (string $kolom) => [$kolom => $data[$kolom] ?? null]),
            ]),
        };

        $request->session()->put(self::KUNCI_URUNGAN, [
            'kelas' => $entri::class,
            'id' => $entri->getKey(),
            'batas' => now()->addSeconds(self::DETIK_URUNGAN)->getTimestamp(),
        ]);

        Inertia::flash('toast', [
            'pesan' => 'Riwayat dari Buku KIA tersimpan',
            'batal' => true,
            'urlBatal' => route('riwayat-buku-kia.urungkan'),
        ]);

        return redirect()->route('riwayat-buku-kia', $anak);
    }

    /** Batal: menghapus entri Buku KIA terakhir yang disimpan kader ini. */
    public function urungkan(Request $request): RedirectResponse
    {
        /** @var array{kelas: class-string, id: int, batas: int}|null $data */
        $data = $request->session()->pull(self::KUNCI_URUNGAN);

        if ($data === null || now()->getTimestamp() > $data['batas']
            || ! in_array($data['kelas'], [Layanan::class, Pengukuran::class], true)) {
            throw ValidationException::withMessages(['urungan' => 'Waktu untuk membatalkan sudah habis.']);
        }

        $data['kelas']::query()
            ->whereKey($data['id'])
            ->where('sumber', SumberData::BukuKia)
            ->whereNull('kunjungan_id')
            ->delete();

        Inertia::flash('toast', ['pesan' => 'Entri dibatalkan']);

        return back();
    }
}
