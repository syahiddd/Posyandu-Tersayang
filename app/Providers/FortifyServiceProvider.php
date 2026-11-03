<?php

namespace App\Providers;

use App\Auth\LoginLockout;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Hash bcrypt dari nilai acak yang dibuang; dipakai saat username tidak
     * ditemukan agar biaya pemeriksaan sama dengan akun yang ada.
     */
    private const HASH_PENGGANTI = '$2y$12$HdFtyNeDRRCSlIRfid/umuJJ5uoa47QRp1/yrRRz1X/pW2J6aoPSi';

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginRateLimiter::class, LoginLockout::class);

        // Hanya login dan logout yang dipakai; route-nya didaftarkan di
        // routes/web.php agar route Fortify lain (konfirmasi sandi) tidak ada.
        Fortify::ignoreRoutes();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureAuthentication();
        $this->configureViews();
    }

    /**
     * Masuk dengan username dan kata sandi (FR-01). Akun nonaktif ditolak
     * dengan pesan yang sama seperti kata sandi salah (PRD 4.1).
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request): ?User {
            $user = User::query()
                ->where('username', (string) $request->input('username'))
                ->first();

            // Hash tetap diperiksa walau akun tidak ada, agar waktu respons
            // tidak membedakan username terdaftar dan tidak.
            $cocok = Hash::check(
                (string) $request->input('password'),
                $user->password ?? self::HASH_PENGGANTI,
            );

            return $user && $user->is_active && $cocok ? $user : null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn () => Inertia::render('auth/login'));
    }
}
