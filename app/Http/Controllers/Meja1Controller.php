<?php

namespace App\Http\Controllers;

use App\Antrean\LayananAntrean;
use App\Antrean\TampilanAnak;
use App\Antrean\Urungan;
use App\Enums\SumberData;
use App\Http\Requests\SimpanAnakRequest;
use App\Models\Anak;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Meja 1 Pendaftaran (PRD 4.3): cari anak terdaftar, tambah anak baru,
 * lalu buka kunjungan hari ini ke antrean Meja 2 (FR-10 sampai FR-17).
 */
class Meja1Controller extends Controller
{
    /** Minimal huruf untuk mencari sebagian nama (PRD 4.3). */
    public const MIN_HURUF = 3;

    /** Minimal angka untuk mencari sebagian NIK. */
    public const MIN_ANGKA = 4;

    private const MAKS_HASIL = 20;

    public function __construct(private LayananAntrean $antrean) {}

    /** S04/S06: layar awal Meja 1 dengan pencarian (FR-14, FR-15). */
    public function index(Request $request): Response
    {
        $cari = trim((string) $request->query('cari', ''));
        $kata = $this->kataCari($cari);

        $hasil = $kata === [] ? [] : $this->cariAnak($kata)
            ->map(fn (Anak $anak) => TampilanAnak::ringkas($anak))
            ->all();

        return Inertia::render('meja/pendaftaran', [
            'cari' => $cari,
            'cukupUntukMencari' => $kata !== [],
            'hasil' => $hasil,
        ]);
    }

    /** S05: formulir Tambah Anak (FR-10). */
    public function create(Request $request): Response
    {
        return Inertia::render('meja1/tambah-anak', [
            'hariIni' => today()->toDateString(),
            'daftarDusun' => Anak::query()->distinct()->orderBy('dusun')->pluck('dusun'),
            'anakSamaNik' => $request->session()->get('anakSamaNik'),
            'kemiripan' => $request->session()->get('kemiripan', []),
        ]);
    }

    public function store(SimpanAnakRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // FR-12: peringatkan data yang mungkin ganda, kecuali kader memilih
        // tetap menyimpan data baru.
        if (! $request->boolean('abaikan_kemiripan')) {
            $mirip = Anak::query()
                ->whereRaw('LOWER(nama) = ?', [mb_strtolower(trim($data['nama']))])
                ->whereDate('tanggal_lahir', $data['tanggal_lahir'])
                ->whereRaw('LOWER(nama_ibu) = ?', [mb_strtolower(trim($data['nama_ibu']))])
                ->get();

            if ($mirip->isNotEmpty()) {
                return back()->with('kemiripan', $mirip->map(fn (Anak $anak) => TampilanAnak::ringkas($anak))->all());
            }
        }

        $anak = DB::transaction(function () use ($data) {
            $anak = Anak::query()->create(collect($data)->only([
                'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'nik',
                'nama_ibu', 'nik_ibu', 'nama_ayah', 'nik_ayah', 'no_hp',
                'alamat', 'rt', 'rw', 'dusun',
            ])->all());

            // Ukuran terakhir dari Buku KIA dipakai sebagai pembanding (Tabel 10).
            if (collect(['ukur_bb', 'ukur_pb_tb', 'ukur_lila', 'ukur_lk'])->contains(fn ($kolom) => filled($data[$kolom] ?? null))) {
                $anak->pengukuran()->create([
                    'tanggal_ukur' => $data['ukur_tanggal'],
                    'sumber' => SumberData::BukuKia,
                    'bb' => $data['ukur_bb'] ?? null,
                    'pb_tb' => $data['ukur_pb_tb'] ?? null,
                    'lila' => $data['ukur_lila'] ?? null,
                    'lk' => $data['ukur_lk'] ?? null,
                ]);
            }

            return $anak;
        });

        return redirect()->route('meja1.anak', $anak);
    }

    /** S07 Anak Tersimpan, juga ringkasan anak yang dipilih (FR-13). */
    public function tersimpan(Anak $anak): Response
    {
        return Inertia::render('meja1/anak-tersimpan', [
            'anak' => TampilanAnak::ringkas($anak),
        ]);
    }

    /**
     * Membuka kunjungan hari ini dan mengirim anak ke antrean Meja 2, lalu
     * kembali ke awal Meja 1 (FR-13, FR-16, FR-17).
     */
    public function kirim(Request $request, Anak $anak): RedirectResponse
    {
        $kunjungan = $this->antrean->bukaKunjungan($anak);
        Urungan::catat($request, $kunjungan, null);

        Inertia::flash('toast', [
            'pesan' => "{$anak->nama} masuk antrean Meja 2 · #".str_pad((string) $kunjungan->nomor_antrean, 2, '0', STR_PAD_LEFT),
            'batal' => true,
        ]);

        return redirect()->route('meja', 1);
    }

    /**
     * Kata pencarian yang cukup panjang: huruf minimal 3, angka minimal 4.
     *
     * @return list<string>
     */
    private function kataCari(string $cari): array
    {
        return array_values(array_filter(
            preg_split('/\s+/', $cari) ?: [],
            fn (string $kata) => ctype_digit($kata)
                ? strlen($kata) >= self::MIN_ANGKA
                : mb_strlen($kata) >= self::MIN_HURUF,
        ));
    }

    /**
     * Setiap kata harus cocok dengan nama anak, nama ibu, NIK anak, atau
     * NIK ibu, sehingga kombinasi seperti "nayla dewi" bisa dipakai (FR-14).
     *
     * @param  list<string>  $kata
     * @return Collection<int, Anak>
     */
    private function cariAnak(array $kata)
    {
        $query = Anak::query();

        foreach ($kata as $satu) {
            $pola = '%'.addcslashes($satu, '\\%_').'%';

            $query->where(fn (Builder $q) => ctype_digit($satu)
                ? $q->where('nik', 'like', $pola)->orWhere('nik_ibu', 'like', $pola)
                : $q->where('nama', 'like', $pola)->orWhere('nama_ibu', 'like', $pola));
        }

        return $query->orderBy('nama')->limit(self::MAKS_HASIL)->get();
    }
}
