<?php

namespace App\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

/**
 * Kunci akun 15 menit setelah 5 kali gagal masuk berturut-turut (FR-04).
 *
 * Menggantikan LoginRateLimiter bawaan Fortify (kunci username|IP, 1 menit):
 * - Kunci berdasarkan username saja, sehingga yang dikunci adalah akunnya.
 * - Kegagalan dihitung dalam jendela 15 menit; pada kegagalan ke-5 akun
 *   dikunci penuh 15 menit sejak percobaan itu.
 * - Berlaku sama untuk username yang tidak terdaftar, jadi pesan kunci tidak
 *   membocorkan keberadaan akun (PRD 4.1).
 * - Hitungan direset saat berhasil masuk (PrepareAuthenticatedSession).
 */
class LoginLockout extends LoginRateLimiter
{
    public const MAKS_GAGAL = 5;

    public const DETIK_KUNCI = 15 * 60;

    public function attempts(Request $request)
    {
        return $this->limiter->attempts($this->kunciHitungan($request));
    }

    public function tooManyAttempts(Request $request)
    {
        return $this->limiter->tooManyAttempts($this->kunciTerkunci($request), 1);
    }

    public function increment(Request $request)
    {
        $gagal = $this->limiter->hit($this->kunciHitungan($request), self::DETIK_KUNCI);

        if ($gagal >= self::MAKS_GAGAL) {
            $this->limiter->clear($this->kunciHitungan($request));
            $this->limiter->hit($this->kunciTerkunci($request), self::DETIK_KUNCI);
        }
    }

    public function availableIn(Request $request)
    {
        return $this->limiter->availableIn($this->kunciTerkunci($request));
    }

    public function clear(Request $request)
    {
        $this->limiter->clear($this->kunciHitungan($request));
    }

    protected function throttleKey(Request $request)
    {
        return self::normalkan((string) $request->input(Fortify::username()));
    }

    /**
     * Membuka kunci akun saat Ketua Kader mengatur ulang kata sandinya (FR-02).
     */
    public static function bukaKunci(string $username): void
    {
        RateLimiter::clear('login-gagal|'.self::normalkan($username));
        RateLimiter::clear('login-terkunci|'.self::normalkan($username));
    }

    private static function normalkan(string $username): string
    {
        return Str::transliterate(Str::lower($username));
    }

    private function kunciHitungan(Request $request): string
    {
        return 'login-gagal|'.$this->throttleKey($request);
    }

    private function kunciTerkunci(Request $request): string
    {
        return 'login-terkunci|'.$this->throttleKey($request);
    }
}
