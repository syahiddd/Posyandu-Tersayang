<?php

use App\Enums\HasilDeteksiStunting;
use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Pengukuran;
use App\Models\User;
use App\Support\MejaAktif;

/*
| Meja 5 Penyuluhan (PRD 4.7): FR-37 sampai FR-46.
*/

/**
 * Anak di Meja 5 dengan pengukuran hari ini. Nilai ukur dihitung dari median
 * tabel WHO aplikasi (z = 0) kecuali diberi z lain untuk panjang/tinggi.
 */
function buka_di_meja5(int $umurBulan = 30, string $jk = 'P', float $zPanjang = 0.0, array $kunjungan = []): Kunjungan
{
    $anak = Anak::factory()->create([
        'jenis_kelamin' => $jk,
        'tanggal_lahir' => today()->subMonthsNoOverflow($umurBulan)->toDateString(),
    ]);
    $kelompok = $jk === 'L' ? 'laki' : 'perempuan';
    $hari = (int) $anak->tanggal_lahir->diffInDays(today());

    $k = Kunjungan::factory()->for($anak)->diMeja(Meja::Penyuluhan)->create($kunjungan);
    Pengukuran::factory()->for($anak)->for($k)->create([
        'tanggal_ukur' => today()->toDateString(),
        'bb' => round(baris_who($kelompok, 'bb_u', $umurBulan)[1], 1),
        'pb_tb' => round(nilai_pada_z(baris_who($kelompok, 'pb_tb_u', $hari), $zPanjang), 1),
        'cara_ukur' => $umurBulan < 24 ? 'telentang' : 'berdiri',
        'lila' => 15.0,
        'lk' => null,
        'status_nt' => 'tidak_ditimbang',
    ]);

    test()->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 5]);
    test()->post(route('kunjungan.buka', $k));

    return $k->fresh();
}

function isian_meja5(array $ubah = []): array
{
    return [
        'pengamatan_fisik' => [],
        'pengamatan_motorik' => [],
        'materi' => [],
        'catatan_tindak_lanjut' => '',
        ...$ubah,
    ];
}

test('anak di antrean Meja 5 dapat dibuka', function () {
    $k = buka_di_meja5();

    expect($k->status)->toBe(StatusAntrean::SedangDilayani);
    $this->get(route('meja', 5))->assertOk()->assertInertia(fn ($page) => $page->has('antreanMeja.antrean', 1));
});

test('layar Meja 5 menampilkan ringkasan, status gizi, dan grafik (FR-37 sampai FR-39)', function () {
    $k = buka_di_meja5(30, 'P');

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->component('kunjungan/penyuluhan')
        ->has('ringkasan.imt')
        ->where('perluUkurUlang', false)
        ->where('statusGizi.0.kode', 'normal')
        ->where('statusGizi', fn ($status) => collect($status)->pluck('label')->contains('TB/U')
            && collect($status)->pluck('label')->contains('LiLA'))
        ->where('grafik.jenisKelamin', 'P')
        ->where('grafik.pakaiPanjang', false)
        ->where('grafik.tabAwal', 'kms')
        ->where('grafik.daftar.pb_tb_u.dariX', 24)
        ->where('grafik.daftar.pb_tb_u.titik.0.hariIni', true)
        ->where('banner', null)
        ->where('stunting.hasil', 'normal')
        ->where('alasanWajib', []));
});

test('anak 23 bulan memakai grafik 0–2 tahun dan anak 25 bulan grafik 2–5 tahun (kriteria 4.7)', function (int $umur, int $dari, bool $panjang) {
    $k = buka_di_meja5($umur, 'L');

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('grafik.jenisKelamin', 'L')
        ->where('grafik.pakaiPanjang', $panjang)
        ->where('grafik.daftar.bb_u.dariX', $dari));
})->with([[23, 0, true], [25, 24, false]]);

test('TB/U < −2 SD: banner stunting, indeks bermasalah di atas, catatan wajib (FR-38, FR-42, FR-45)', function () {
    $k = buka_di_meja5(39, 'P', -2.5);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('statusGizi.0.label', 'TB/U')
        ->where('statusGizi.0.kode', 'pendek')
        ->where('statusGizi.0.varian', 'bahaya')
        ->where('grafik.tabAwal', 'pb_tb_u')
        ->where('stunting.hasil', 'stunting')
        ->where('banner.varian', 'bahaya')
        ->where('banner.judul', 'Stunting · rujuk ke puskesmas')
        ->where('materi.rekomendasi', fn ($kode) => collect($kode)->contains('cegah_stunting'))
        ->where('alasanWajib', fn ($alasan) => count($alasan) >= 2));

    $this->post(route('kunjungan.selesai', $k), isian_meja5())
        ->assertSessionHasErrors('catatan_tindak_lanjut');

    expect($k->fresh()->status)->toBe(StatusAntrean::SedangDilayani);
});

test('status T dan BB di bawah garis merah memunculkan pesan rujukan KMS (FR-40)', function () {
    $k = buka_di_meja5(30, 'L');
    $kelompok = 'laki';
    $k->pengukuran->update([
        'bb' => round(nilai_pada_z(baris_who($kelompok, 'bb_u', 30), -2.4), 1),
        'status_nt' => 'T',
    ]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('penimbangan.status', 'T')
        ->where('rujukanKms', ['Berat badan tidak naik (T)', 'Berat badan di bawah garis merah KMS']));
});

test('catatan dari Meja 4 dan layanan hari ini serta imunisasi kejar ditampilkan (FR-41, FR-45)', function () {
    $k = buka_di_meja5(18, 'L', kunjungan: ['catatan_penyuluhan' => 'Anak sedikit demam']);
    $k->layanan()->create([
        'anak_id' => $k->anak_id, 'jenis' => 'imunisasi', 'detail' => 'MR 2',
        'tanggal' => today()->toDateString(), 'sumber' => 'posyandu',
    ]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('catatanMeja4', 'Anak sedikit demam')
        ->where('layanan.0.detail', 'MR 2')
        ->where('imunisasiTertunda', fn ($daftar) => ! collect($daftar)->pluck('kode')->contains('MR 2')
            && collect($daftar)->pluck('kode')->contains('OPV 1')
            && ! collect($daftar)->pluck('kode')->contains('JE'))
        ->where('isiPiringku.otomatis', true));
});

test('Selesai menyimpan penyuluhan, z-score, dan menambah angka Selesai Dilayani (FR-44, FR-46)', function () {
    $k = buka_di_meja5(39, 'P', -2.5);

    $this->post(route('kunjungan.selesai', $k), isian_meja5([
        'pengamatan_fisik' => ['demam'],
        'materi' => ['cegah_stunting', 'perawatan_anak_sakit', '  Cuci tangan pakai sabun  '],
        'catatan_tindak_lanjut' => 'Rujuk ke puskesmas, kontrol 5 Des',
    ]))->assertRedirect(route('meja', 5))->assertSessionHasNoErrors();

    $k->refresh();
    $penyuluhan = $k->penyuluhan;

    expect($k->status)->toBe(StatusAntrean::Selesai)
        ->and($k->selesai_meja_5_pada)->not->toBeNull()
        ->and($penyuluhan->pengamatan_fisik)->toBe(['demam'])
        ->and($penyuluhan->materi)->toBe(['cegah_stunting', 'perawatan_anak_sakit', 'Cuci tangan pakai sabun'])
        ->and($penyuluhan->hasil_deteksi_stunting)->toBe(HasilDeteksiStunting::Stunting)
        ->and($penyuluhan->catatan_tindak_lanjut)->toBe('Rujuk ke puskesmas, kontrol 5 Des')
        ->and((float) $k->pengukuran->zscore_pb_tb_u)->toBeLessThan(-2.0)
        ->and($k->pengukuran->imt)->not->toBeNull();

    $this->get(route('beranda'))->assertInertia(fn ($page) => $page->where('ringkasan.selesai', 1));
});

test('anak normal dapat diselesaikan tanpa catatan tindak lanjut', function () {
    $k = buka_di_meja5(30, 'P');

    $this->post(route('kunjungan.selesai', $k), isian_meja5())->assertSessionHasNoErrors();

    expect($k->fresh()->status)->toBe(StatusAntrean::Selesai);
});

test('pengamatan yang tidak dikenal ditolak', function () {
    $k = buka_di_meja5(30, 'P');

    $this->post(route('kunjungan.selesai', $k), isian_meja5(['pengamatan_fisik' => ['batuk']]))
        ->assertSessionHasErrors('pengamatan_fisik.0');
});

test('Batal setelah Selesai mengembalikan anak ke layar Meja 5 dengan isian tersimpan', function () {
    $k = buka_di_meja5(30, 'P');

    $this->post(route('kunjungan.selesai', $k), isian_meja5(['materi' => ['mpasi'], 'catatan_tindak_lanjut' => 'Kontrol']));
    $this->post(route('antrean.urungkan'))->assertRedirect(route('kunjungan.layar', $k));

    expect($k->fresh()->status)->toBe(StatusAntrean::SedangDilayani);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('nilaiAwal.materi', ['mpasi'])
        ->where('nilaiAwal.catatan_tindak_lanjut', 'Kontrol'));

    $this->post(route('kunjungan.selesai', $k), isian_meja5())->assertSessionHasNoErrors();
    expect($k->fresh()->penyuluhan->catatan_tindak_lanjut)->toBeNull();
});

test('Tunda di Meja 5 menyimpan isian sebagai draf (FR-47, FR-48)', function () {
    $k = buka_di_meja5(30, 'P');

    $this->post(route('kunjungan.tunda', $k), ['draf' => isian_meja5(['materi' => ['mpasi'], 'catatan_tindak_lanjut' => 'Draf'])]);
    $this->post(route('kunjungan.lanjutkan', $k));
    $this->post(route('kunjungan.buka', $k));

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('nilaiAwal.catatan_tindak_lanjut', 'Draf'));
});

test('kader yang tidak memegang anak tidak dapat menyelesaikan', function () {
    $k = buka_di_meja5(30, 'P');

    $this->actingAs(User::factory()->create())->withSession([MejaAktif::KUNCI_SESI => 5]);

    $this->post(route('kunjungan.selesai', $k), isian_meja5())->assertSessionHasErrors('kunjungan');
    expect($k->fresh()->status)->toBe(StatusAntrean::SedangDilayani);
});

test('rentang sumbu grafik mengikuti Buku KIA (PRD Tabel 23 dan 24)', function (int $umur, string $jk, array $harapan) {
    $k = buka_di_meja5($umur, $jk);

    $this->get(route('kunjungan.layar', $k))->assertInertia(function ($page) use ($harapan) {
        foreach ($harapan as $indeks => [$dariX, $sampaiX, $minY, $maksY]) {
            $page->where("grafik.daftar.{$indeks}.dariX", $dariX)
                ->where("grafik.daftar.{$indeks}.sampaiX", $sampaiX)
                ->where("grafik.daftar.{$indeks}.minimumY", $minY)
                ->where("grafik.daftar.{$indeks}.maksimumY", $maksY);
        }
    });
})->with([
    'laki-laki 0–2 tahun' => [10, 'L', [
        'kms' => [0, 24, 1, 18], 'bb_u' => [0, 24, 2, 17], 'pb_tb_u' => [0, 24, 45, 95],
        'bb_pb_tb' => [45, 110, 2, 24], 'imt_u' => [0, 24, 10, 22], 'lk_u' => [0, 60, 30, 54],
    ]],
    'perempuan 2–5 tahun' => [40, 'P', [
        'kms' => [24, 60, 8, 30], 'bb_u' => [24, 60, 7, 30], 'pb_tb_u' => [24, 60, 80, 125],
        'bb_pb_tb' => [65, 120, 6, 32], 'imt_u' => [24, 60, 12, 21], 'lk_u' => [0, 60, 30, 54],
    ]],
    'laki-laki 2–5 tahun' => [40, 'L', [
        'kms' => [24, 60, 8, 28], 'bb_u' => [24, 60, 8, 28], 'bb_pb_tb' => [65, 120, 6, 30],
    ]],
]);

test('hasil ukur tidak wajar: banner perlu ukur ulang dan stunting belum dinilai (PRD 5.6, DESIGN Tabel 33)', function () {
    $k = buka_di_meja5(30, 'P');
    $k->pengukuran->update(['pb_tb' => 60.0]);

    $this->get(route('kunjungan.layar', $k))->assertInertia(fn ($page) => $page
        ->where('perluUkurUlang', true)
        ->where('statusGizi', [])
        ->where('banner.judul', 'Perlu ukur ulang')
        ->where('stunting.hasil', 'belum_dinilai'));

    $this->post(route('kunjungan.selesai', $k), isian_meja5(['catatan_tindak_lanjut' => 'Ukur ulang bulan depan']))
        ->assertSessionHasNoErrors();

    expect($k->fresh()->penyuluhan->hasil_deteksi_stunting)->toBeNull();
});
