<?php

namespace App\Antrean;

use App\Enums\Meja;
use App\Enums\StatusAntrean;
use App\Models\Anak;
use App\Models\Kunjungan;
use App\Models\User;
use App\Support\Umur;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Aturan antrean lima meja (PRD 3.2, 3.3; FR-16, FR-23, FR-28, FR-29,
 * FR-47 sampai FR-49). Setiap perubahan disiarkan ke perangkat lain.
 */
final class LayananAntrean
{
    /** Kunci "sedang dilayani" lepas otomatis setelah 10 menit tanpa simpan. */
    public const MENIT_KUNCI = 10;

    /**
     * Membuka kunjungan hari ini dan memasukkan anak ke antrean Meja 2
     * (FR-13, FR-16).
     */
    public function bukaKunjungan(Anak $anak): Kunjungan
    {
        if (Umur::bulanPenuh($anak->tanggal_lahir) > Umur::MAKS_BULAN) {
            throw ValidationException::withMessages([
                'kunjungan' => 'Umur anak lebih dari 60 bulan, tidak dapat dilayani di posyandu balita.',
            ]);
        }

        for ($percobaan = 1; ; $percobaan++) {
            try {
                $kunjungan = DB::transaction(function () use ($anak) {
                    if ($anak->kunjungan()->whereDate('tanggal', today())->exists()) {
                        throw ValidationException::withMessages([
                            'kunjungan' => 'Anak ini sudah ada di antrean hari ini.',
                        ]);
                    }

                    $nomorTerakhir = (int) Kunjungan::query()
                        ->whereDate('tanggal', today())
                        ->lockForUpdate()
                        ->max('nomor_antrean');

                    return Kunjungan::query()->create([
                        'anak_id' => $anak->id,
                        'tanggal' => today()->toDateString(),
                        'nomor_antrean' => $nomorTerakhir + 1,
                        'meja_saat_ini' => Meja::Pengukuran,
                        'status' => StatusAntrean::Menunggu,
                        'masuk_meja_pada' => now(),
                        'selesai_meja_1_pada' => now(),
                    ]);
                });

                break;
            } catch (UniqueConstraintViolationException $galat) {
                // Dua meja 1 membuka kunjungan bersamaan: coba nomor berikutnya.
                if ($percobaan >= 3 || $anak->kunjungan()->whereDate('tanggal', today())->exists()) {
                    throw ValidationException::withMessages([
                        'kunjungan' => 'Anak ini sudah ada di antrean hari ini.',
                    ]);
                }
            }
        }

        SiarAntrean::kabari(Meja::Pendaftaran->value, Meja::Pengukuran->value);

        return $kunjungan;
    }

    /**
     * Kader membuka anak dari antrean; anak terkunci untuk kader itu
     * (PRD 3.3). Kunci kader lain yang lebih dari 10 menit boleh diambil alih.
     */
    public function buka(Kunjungan $kunjungan, User $user): Kunjungan
    {
        $this->pastikanHariIni($kunjungan);

        $berhasil = Kunjungan::query()
            ->whereKey($kunjungan->id)
            ->where(function (Builder $query) use ($user) {
                $query->where('status', StatusAntrean::Menunggu)
                    ->orWhere(fn (Builder $q) => $q
                        ->where('status', StatusAntrean::SedangDilayani)
                        ->where(fn (Builder $q) => $q
                            ->where('dibuka_oleh', $user->id)
                            ->orWhereNull('dibuka_oleh')
                            ->orWhere('dibuka_pada', '<=', now()->subMinutes(self::MENIT_KUNCI))));
            })
            ->update([
                'status' => StatusAntrean::SedangDilayani,
                'dibuka_oleh' => $user->id,
                'dibuka_pada' => now(),
            ]);

        if ($berhasil === 0) {
            throw ValidationException::withMessages([
                'kunjungan' => $kunjungan->fresh()?->status === StatusAntrean::Ditunda
                    ? 'Anak ini sedang ditunda. Tekan Lanjutkan dulu di daftar Ditunda.'
                    : 'Anak ini sedang dilayani kader lain.',
            ]);
        }

        SiarAntrean::kabari($kunjungan->meja_saat_ini->value);

        return $kunjungan->refresh();
    }

    /** Kader kembali ke antrean tanpa menyimpan; anak menunggu lagi. */
    public function lepas(Kunjungan $kunjungan, User $user): Kunjungan
    {
        if ($this->dipegangOleh($kunjungan, $user)) {
            $kunjungan->update([
                'status' => StatusAntrean::Menunggu,
                'dibuka_oleh' => null,
                'dibuka_pada' => null,
            ]);

            SiarAntrean::kabari($kunjungan->meja_saat_ini->value);
        }

        return $kunjungan;
    }

    /**
     * Menunda anak di meja ini; isian yang sudah diketik disimpan sebagai
     * draf (FR-47, FR-48, DESIGN 5.8).
     *
     * @param  array<string, mixed>  $draf
     */
    public function tunda(Kunjungan $kunjungan, User $user, array $draf = []): Kunjungan
    {
        $this->pastikanDipegang($kunjungan, $user);

        $semuaDraf = $kunjungan->draf ?? [];
        $semuaDraf[(string) $kunjungan->meja_saat_ini->value] = $draf;

        $kunjungan->update([
            'status' => StatusAntrean::Ditunda,
            'ditunda_pada' => now(),
            'dibuka_oleh' => null,
            'dibuka_pada' => null,
            'draf' => $semuaDraf,
        ]);

        SiarAntrean::kabari($kunjungan->meja_saat_ini->value);

        return $kunjungan;
    }

    /**
     * Anak yang ditunda kembali ke antrean meja yang sama pada posisi
     * asalnya; draf tetap tersimpan (FR-48).
     */
    public function lanjutkan(Kunjungan $kunjungan): Kunjungan
    {
        $this->pastikanHariIni($kunjungan);

        if ($kunjungan->status !== StatusAntrean::Ditunda) {
            throw ValidationException::withMessages(['kunjungan' => 'Anak ini tidak sedang ditunda.']);
        }

        $kunjungan->update([
            'status' => StatusAntrean::Menunggu,
            'ditunda_pada' => null,
        ]);

        SiarAntrean::kabari($kunjungan->meja_saat_ini->value);

        return $kunjungan;
    }

    /** Meja selesai; anak masuk antrean meja berikutnya (FR-23, FR-29). */
    public function teruskan(Kunjungan $kunjungan, User $user): Kunjungan
    {
        $this->pastikanDipegang($kunjungan, $user);

        $meja = $kunjungan->meja_saat_ini;
        $berikutnya = Meja::from($meja->value + 1);
        $draf = $kunjungan->draf ?? [];
        unset($draf[(string) $meja->value]);

        $kunjungan->update([
            "selesai_meja_{$meja->value}_pada" => now(),
            'meja_saat_ini' => $berikutnya,
            'status' => StatusAntrean::Menunggu,
            'masuk_meja_pada' => now(),
            'dibuka_oleh' => null,
            'dibuka_pada' => null,
            'draf' => $draf === [] ? null : $draf,
            'perlu_ukur_ulang' => $meja === Meja::Pengukuran ? false : $kunjungan->perlu_ukur_ulang,
            'alasan_kembali' => $meja === Meja::Pengukuran ? null : $kunjungan->alasan_kembali,
        ]);

        SiarAntrean::kabari($meja->value, $berikutnya->value);

        return $kunjungan;
    }

    /**
     * Meja 3 mengembalikan anak ke antrean Meja 2 karena data keliru
     * (FR-28); anak ditandai "Perlu ukur ulang".
     */
    public function kembalikanKePengukuran(Kunjungan $kunjungan, User $user, string $alasan): Kunjungan
    {
        $this->pastikanDipegang($kunjungan, $user);

        if ($kunjungan->meja_saat_ini !== Meja::Pendataan) {
            throw ValidationException::withMessages(['kunjungan' => 'Hanya Meja 3 yang dapat mengembalikan ke Meja 2.']);
        }

        $kunjungan->update([
            'meja_saat_ini' => Meja::Pengukuran,
            'status' => StatusAntrean::Menunggu,
            'masuk_meja_pada' => now(),
            'dibuka_oleh' => null,
            'dibuka_pada' => null,
            'selesai_meja_2_pada' => null,
            'perlu_ukur_ulang' => true,
            'alasan_kembali' => $alasan,
        ]);

        SiarAntrean::kabari(Meja::Pendataan->value, Meja::Pengukuran->value);

        return $kunjungan;
    }

    public function dipegangOleh(Kunjungan $kunjungan, User $user): bool
    {
        return $kunjungan->status === StatusAntrean::SedangDilayani
            && $kunjungan->dibuka_oleh === $user->id;
    }

    /** Hanya kader yang membuka anak yang boleh menyimpan atau menunda. */
    public function pastikanDipegang(Kunjungan $kunjungan, User $user): void
    {
        $this->pastikanHariIni($kunjungan);

        if (! $this->dipegangOleh($kunjungan, $user)) {
            throw ValidationException::withMessages([
                'kunjungan' => 'Anak ini tidak sedang Anda layani. Buka lagi dari antrean.',
            ]);
        }
    }

    /** Kunjungan hari sebelumnya tetap tersimpan sebagai belum selesai (PRD 3.3). */
    public function pastikanHariIni(Kunjungan $kunjungan): void
    {
        if (! $kunjungan->tanggal->isToday()) {
            throw ValidationException::withMessages([
                'kunjungan' => 'Kunjungan ini bukan kunjungan hari ini.',
            ]);
        }
    }
}
