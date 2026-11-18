<?php

namespace Database\Seeders;

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\Pengukuran;
use App\Models\Posyandu;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Data contoh untuk pengembangan lokal: 1 posyandu, 1 ketua, 4 kader aktif,
 * 1 kader nonaktif, 12 anak fiktif, dan kunjungan hari ini di beberapa meja.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('DatabaseSeeder berisi akun dan anak contoh; jangan dijalankan di produksi.');
        }

        // Dijalankan tiap deploy demo (railway.json); jangan isi ulang bila sudah ada data.
        if (User::query()->exists()) {
            return;
        }

        $sandi = config('posyandu.seed_password');

        if (! is_string($sandi) || $sandi === '') {
            throw new RuntimeException('Isi SEED_PASSWORD di .env: kata sandi lokal untuk akun contoh.');
        }

        Posyandu::factory()->create([
            'nama' => 'Posyandu Tersayang',
            'desa_kelurahan' => 'Desa Purwodadi Simpang',
            'kecamatan' => 'Tj. Bintang',
            'kabupaten_kota' => 'Lampung Selatan',
            'puskesmas_pembina' => '-',
            'alamat' => '-',
            'jadwal_kegiatan' => 'Setiap tanggal 19',
        ]);

        User::factory()->ketua()->create([
            'name' => 'Tri Desiyanti',
            'username' => 'ketua',
            'meja_biasa' => Meja::Pendataan,
            'password' => $sandi,
        ]);

        // Nomor HP fiktif dan meja yang biasa dipegang (FR-60).
        // Susunan langkah: 1 Nuning, 2 Irawati, 3 Tri Desiyanti (ketua),
        // 4 Elmi Kurnia, 5 Windarsih.
        $kader = collect([
            ['Nuning Ari Wiworo', 'nuning', '081200000001', Meja::Pendaftaran],
            ['Irawati', 'irawati', '081200000002', Meja::Pengukuran],
            ['Elmi Kurnia', 'elmi', '081200000003', Meja::Pelayanan],
            ['Windarsih', 'windarsih', '081200000004', Meja::Penyuluhan],
        ])->map(fn (array $data) => User::factory()->create([
            'name' => $data[0],
            'username' => $data[1],
            'no_hp' => $data[2],
            'meja_biasa' => $data[3],
            'password' => $sandi,
        ]));

        User::factory()->nonaktif()->create([
            'name' => 'No Name',
            'username' => 'rina',
            'password' => $sandi,
        ]);

        $anak = Anak::factory()->count(12)->create();

        Pengukuran::factory()->dariBukuKia()->for($anak[0])->create();
        Pengukuran::factory()->dariBukuKia()->for($anak[1])->create();

        // Kunjungan hari ini di berbagai meja dan status, agar angka Beranda
        // dan Pilih Meja berasal dari database (FR-06, FR-07).
        $susunan = [
            [Meja::Pengukuran, StatusAntrean::Menunggu],
            [Meja::Pengukuran, StatusAntrean::Menunggu],
            [Meja::Pengukuran, StatusAntrean::Menunggu],
            [Meja::Pendataan, StatusAntrean::Menunggu],
            [Meja::Pendataan, StatusAntrean::Ditunda],
            [Meja::Pelayanan, StatusAntrean::Menunggu],
            [Meja::Penyuluhan, StatusAntrean::SedangDilayani],
        ];

        foreach ($susunan as $urutan => [$meja, $status]) {
            $kunjungan = Kunjungan::factory()
                ->for($anak[$urutan])
                ->diMeja($meja, $status)
                ->create([
                    'nomor_antrean' => $urutan + 1,
                    'dibuka_oleh' => $status === StatusAntrean::SedangDilayani ? $kader[0]->id : null,
                    'dibuka_pada' => $status === StatusAntrean::SedangDilayani ? now() : null,
                ]);

            if ($meja->value > Meja::Pengukuran->value) {
                Pengukuran::factory()->for($anak[$urutan])->for($kunjungan)->create();
            }
        }

        foreach ([7, 8] as $urutan) {
            $kunjungan = Kunjungan::factory()
                ->for($anak[$urutan])
                ->selesai()
                ->create(['nomor_antrean' => $urutan + 1]);

            Pengukuran::factory()->for($anak[$urutan])->for($kunjungan)->create();
        }
    }
}
