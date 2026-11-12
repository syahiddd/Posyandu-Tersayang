<?php

namespace App\Http\Controllers;

use App\Anak\TampilanDetailAnak;
use App\Antrean\LayananAntrean;
use App\Antrean\TampilanKunjungan;
use App\Antrean\Urungan;
use App\Enums\HasilDeteksiStunting;
use App\Enums\Meja;
use App\Gizi\GrafikPertumbuhan;
use App\Gizi\HasilAntropometri;
use App\Http\Requests\SelesaiPenyuluhanRequest;
use App\Models\Kunjungan;
use App\Models\Penyuluhan;
use App\Penyuluhan\AnalisisKunjungan;
use App\Penyuluhan\MateriPenyuluhan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Meja 5 Penyuluhan (PRD 4.7): ringkasan kunjungan, status gizi, grafik,
 * status N/T dan rujukan, layanan, deteksi stunting, edukasi, materi, dan
 * catatan tindak lanjut (FR-37 sampai FR-46; DESIGN 5.7, 6.4, Gambar 6, 10).
 */
class PenyuluhanController extends Controller
{
    public function __construct(private LayananAntrean $antrean) {}

    /**
     * Props layar Meja 5 (S12).
     *
     * @return array<string, mixed>
     */
    public static function props(Kunjungan $kunjungan): array
    {
        $anak = $kunjungan->anak;
        $analisis = new AnalisisKunjungan($kunjungan);
        $hariIni = $analisis->hariIni;
        $statusGizi = $analisis->statusGizi();
        $penimbangan = $analisis->penimbangan();
        $rujukan = $analisis->alasanRujukanKms();
        $tertunda = $analisis->imunisasiTertunda();
        $umur = (int) ($hariIni['umurBulan'] ?? TampilanKunjungan::header($kunjungan)['umurBulan']);
        $grafik = GrafikPertumbuhan::props($anak, $analisis->pengukuran, $kunjungan->pengukuran?->id);

        return [
            'anak' => TampilanKunjungan::header($kunjungan),
            'ringkasan' => $hariIni === null ? null : [
                'bb' => $hariIni['bb'],
                'pbTb' => $hariIni['pbTb'],
                'caraUkur' => $hariIni['caraUkur'],
                'lila' => $hariIni['lila'],
                'lk' => $hariIni['lk'],
                'imt' => $hariIni['imt'],
            ],
            'perluUkurUlang' => $analisis->perluUkurUlang(),
            'statusGizi' => $statusGizi,
            'penimbangan' => $penimbangan,
            'rujukanKms' => $rujukan,
            'stunting' => [...$analisis->stunting, 'hasil' => $analisis->stunting['hasil']->value],
            'banner' => self::banner($analisis, $statusGizi, $rujukan),
            'grafik' => $hariIni === null ? null : [
                'jenisKelamin' => $anak->jenis_kelamin->value,
                'tabAwal' => self::tabAwal($statusGizi),
                'pakaiPanjang' => $umur < 24,
                'jumlahTitik' => count($grafik['riwayat']),
                'daftar' => $grafik['grafik'],
            ],
            'layanan' => TampilanDetailAnak::layanan($anak),
            'imunisasiTertunda' => array_map(fn (array $satu) => [
                'kode' => $satu['kode'],
                'nama' => $satu['nama'],
                'alasan' => $satu['alasan'],
            ], $tertunda),
            'isiPiringku' => [
                'otomatis' => $umur <= (int) config('penyuluhan.isi_piringku_umur_maks'),
                'porsi' => config('penyuluhan.isi_piringku'),
            ],
            'materi' => [
                'daftar' => collect((array) config('penyuluhan.materi'))
                    ->map(fn (array $satu, string $kode) => ['kode' => $kode, ...$satu])
                    ->values(),
                'rekomendasi' => MateriPenyuluhan::rekomendasi(
                    $umur,
                    $hariIni['kategori'] ?? [],
                    $penimbangan['status'] ?? null,
                    $analisis->stunting['hasil'],
                    $tertunda !== [],
                ),
                'pemicuPengamatan' => MateriPenyuluhan::MATERI_PENGAMATAN,
            ],
            'pengamatan' => [
                'fisik' => self::opsi('penyuluhan.pengamatan_fisik'),
                'motorik' => self::opsi('penyuluhan.pengamatan_motorik'),
            ],
            'catatanMeja4' => $kunjungan->catatan_penyuluhan,
            'alasanWajib' => self::alasanCatatanWajib($kunjungan, $analisis),
            'nilaiAwal' => self::nilaiAwal($kunjungan),
        ];
    }

    /**
     * Catatan Tindak Lanjut wajib bila ada status gizi di luar normal,
     * status T, atau risiko stunting (FR-45).
     *
     * @return list<string>
     */
    public static function alasanCatatanWajib(Kunjungan $kunjungan, ?AnalisisKunjungan $analisis = null): array
    {
        $analisis ??= new AnalisisKunjungan($kunjungan);
        $alasan = [];

        $diLuarNormal = collect($analisis->statusGizi())->where('kode', '!=', 'normal');

        if ($diLuarNormal->isNotEmpty()) {
            $alasan[] = $diLuarNormal->map(fn (array $satu) => "{$satu['label']} {$satu['kategori']}")->join(', ');
        }

        if (($analisis->penimbangan()['status'] ?? null) === 'T') {
            $alasan[] = 'Status T';
        }

        if ($analisis->stunting['hasil'] !== HasilDeteksiStunting::Normal) {
            $alasan[] = $analisis->stunting['judul'];
        }

        if ($analisis->perluUkurUlang()) {
            $alasan[] = 'Hasil ukur perlu diperiksa ulang';
        }

        return $alasan;
    }

    /**
     * Banner risiko paling serius (DESIGN Tabel 18 dan 29): hanya bila ada
     * status bahaya, stunting, prediksi berisiko, atau rujukan KMS.
     *
     * @param  list<array<string, mixed>>  $statusGizi
     * @param  list<string>  $rujukan
     * @return array{varian: string, judul: string, isi: string}|null
     */
    private static function banner(AnalisisKunjungan $analisis, array $statusGizi, array $rujukan): ?array
    {
        if ($analisis->perluUkurUlang()) {
            return [
                'varian' => 'bahaya',
                'judul' => 'Perlu ukur ulang',
                'isi' => 'Nilai ukur di luar batas wajar standar WHO, jadi status gizi tidak dihitung. Periksa lagi hasil ukur bersama tenaga kesehatan.',
            ];
        }

        $stunting = $analisis->stunting;

        if ($stunting['hasil'] === HasilDeteksiStunting::Stunting) {
            return [
                'varian' => 'bahaya',
                'judul' => 'Stunting · rujuk ke puskesmas',
                'isi' => "{$stunting['alasan']}. {$stunting['tindakan']}. Hasil skrining, perlu konfirmasi tenaga kesehatan.",
            ];
        }

        $bahaya = collect($statusGizi)->first(fn (array $satu) => $satu['tingkat'] >= 4);

        if ($bahaya !== null) {
            return [
                'varian' => 'bahaya',
                'judul' => "{$bahaya['kategori']} · rujuk ke puskesmas",
                'isi' => "{$bahaya['label']} di luar batas normal. Hasil skrining, perlu konfirmasi tenaga kesehatan.",
            ];
        }

        if ($stunting['hasil'] !== HasilDeteksiStunting::Normal) {
            return [
                'varian' => 'peringatan',
                'judul' => $stunting['judul'],
                'isi' => "{$stunting['alasan']}. {$stunting['tindakan']}. Hasil skrining, perlu konfirmasi tenaga kesehatan.",
            ];
        }

        if ($rujukan !== []) {
            return [
                'varian' => 'peringatan',
                'judul' => 'Rujuk sesuai KMS Buku KIA',
                'isi' => implode('. ', $rujukan).'.',
            ];
        }

        return null;
    }

    /**
     * Tab grafik pertama = indeks paling bermasalah (DESIGN Tabel 29); bila
     * semua normal, KMS.
     *
     * @param  list<array<string, mixed>>  $statusGizi
     */
    private static function tabAwal(array $statusGizi): string
    {
        $teratas = collect($statusGizi)->first(fn (array $satu) => $satu['tingkat'] > 0 && $satu['indeks'] !== 'lila');

        return $teratas['indeks'] ?? 'kms';
    }

    /**
     * @return list<array{kode: string, label: string}>
     */
    private static function opsi(string $kunci): array
    {
        return collect((array) config($kunci))
            ->map(fn (string $label, string $kode) => ['kode' => $kode, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * Isian yang sudah ada: penyuluhan tersimpan (setelah Batal) atau draf
     * saat ditunda (FR-48). Null berarti layar memakai rekomendasi.
     *
     * @return array<string, mixed>|null
     */
    private static function nilaiAwal(Kunjungan $kunjungan): ?array
    {
        $tersimpan = $kunjungan->penyuluhan;

        if ($tersimpan === null) {
            return ($kunjungan->draf ?? [])[Meja::Penyuluhan->value] ?? null;
        }

        return [
            'pengamatan_fisik' => $tersimpan->pengamatan_fisik ?? [],
            'pengamatan_motorik' => $tersimpan->pengamatan_motorik ?? [],
            'materi' => $tersimpan->materi ?? [],
            'catatan_tindak_lanjut' => $tersimpan->catatan_tindak_lanjut ?? '',
        ];
    }

    /** "Selesai": kunjungan berstatus Selesai (FR-46). */
    public function selesai(SelesaiPenyuluhanRequest $request, Kunjungan $kunjungan): RedirectResponse
    {
        $this->antrean->pastikanDipegang($kunjungan, $request->user());

        if ($kunjungan->meja_saat_ini !== Meja::Penyuluhan) {
            throw ValidationException::withMessages(['kunjungan' => 'Anak ini tidak sedang di Meja 5.']);
        }

        $data = $request->validated();
        $analisis = new AnalisisKunjungan($kunjungan);
        $sebelum = Urungan::potret($kunjungan);

        DB::transaction(function () use ($kunjungan, $data, $analisis, $request) {
            Penyuluhan::query()->updateOrCreate(
                ['kunjungan_id' => $kunjungan->id],
                [
                    'pengamatan_fisik' => array_values($data['pengamatan_fisik']),
                    'pengamatan_motorik' => array_values($data['pengamatan_motorik']),
                    'materi' => array_values($data['materi'] ?? []),
                    'hasil_deteksi_stunting' => $analisis->stunting['hasil'],
                    'catatan_tindak_lanjut' => filled($data['catatan_tindak_lanjut'] ?? null)
                        ? trim($data['catatan_tindak_lanjut'])
                        : null,
                ],
            );

            // IMT dan z-score ikut disimpan di pengukuran (PRD 7.1).
            $ukur = $kunjungan->pengukuran;

            if ($ukur !== null) {
                $hasil = HasilAntropometri::hitung(
                    $kunjungan->anak,
                    $ukur->bb === null ? null : (float) $ukur->bb,
                    $ukur->pb_tb === null ? null : (float) $ukur->pb_tb,
                    $ukur->cara_ukur,
                    $ukur->lila === null ? null : (float) $ukur->lila,
                    $ukur->lk === null ? null : (float) $ukur->lk,
                    $ukur->tanggal_ukur,
                );
                $ukur->update($hasil['kolom']);
            }

            $this->antrean->selesaikan($kunjungan, $request->user());
        });

        Urungan::catat($request, $kunjungan, $sebelum);
        Inertia::flash('toast', [
            'pesan' => "{$kunjungan->anak->nama} selesai dilayani",
            'batal' => true,
        ]);

        return redirect()->route('meja', Meja::Penyuluhan->value);
    }
}
