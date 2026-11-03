<?php

namespace App\Http\Controllers;

use App\Anak\PencarianAnak;
use App\Antrean\LayananAntrean;
use App\Antrean\TampilanAnak;
use App\Antrean\Urungan;
use App\Enums\SumberData;
use App\Http\Requests\SimpanAnakRequest;
use App\Models\Anak;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Meja 1 Pendaftaran (PRD 4.3): cari anak terdaftar, tambah anak baru,
 * lalu buka kunjungan hari ini ke antrean Meja 2 (FR-10 sampai FR-17).
 */
class Meja1Controller extends Controller
{
    private const MAKS_HASIL = 20;

    public function __construct(private LayananAntrean $antrean) {}

    /** S04/S06: layar awal Meja 1 dengan pencarian (FR-14, FR-15). */
    public function index(Request $request): Response
    {
        $cari = trim((string) $request->query('cari', ''));
        $kata = PencarianAnak::kata($cari);

        $hasil = $kata === [] ? [] : PencarianAnak::terapkan(TampilanAnak::denganRingkasan(Anak::query()), $kata)
            ->orderBy('nama')
            ->limit(self::MAKS_HASIL)
            ->get()
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
            $anak = Anak::query()->create(collect($data)->only(SimpanAnakRequest::KOLOM_IDENTITAS)->all());

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
}
