<?php

namespace App\Http\Controllers;

use App\Auth\LoginLockout;
use App\Auth\SandiSementara;
use App\Enums\Meja;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * S21 Pengaturan Akun, khusus Ketua Kader (FR-02, DESIGN 5.10 dan 6.5):
 * tambah kader, ubah data kader, nonaktifkan atau aktifkan lagi, dan atur
 * ulang kata sandi. Nomor HP dan meja biasa dipakai di Data Posyandu (FR-60).
 */
class AkunController extends Controller
{
    private const KUNCI_SANDI = 'sandiSementara';

    public function index(Request $request): Response
    {
        $akun = User::query()
            ->orderByDesc('is_active')
            ->orderByRaw("role = 'ketua' desc")
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                ...$this->tampilan($user),
                'aktif' => $user->is_active,
                'peran' => $user->role->label(),
                'diriSendiri' => $user->is($request->user()),
            ]);

        return Inertia::render('akun/daftar', [
            'akun' => $akun,
            'daftarMeja' => $this->daftarMeja(),
            'sandiSementara' => $request->session()->get(self::KUNCI_SANDI),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('akun/formulir', [
            'akun' => null,
            'usulanSandi' => SandiSementara::buat(),
            'daftarMeja' => $this->daftarMeja(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->rapikanNoHp($request);
        $data = $request->validate([
            ...$this->aturan(),
            'password' => ['required', 'string', Password::defaults()],
        ], $this->pesan());

        $user = User::query()->create([...$data, 'role' => Role::Kader, 'is_active' => true]);

        return redirect()->route('pengaturan-akun')->with(self::KUNCI_SANDI, [
            'judul' => 'Akun baru dibuat',
            'nama' => $user->name,
            'username' => $user->username,
            'sandi' => $data['password'],
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('akun/formulir', [
            'akun' => $this->tampilan($user),
            'usulanSandi' => null,
            'daftarMeja' => $this->daftarMeja(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->rapikanNoHp($request);
        $user->update($request->validate($this->aturan($user), $this->pesan()));

        Inertia::flash('toast', ['pesan' => "Data {$user->name} disimpan"]);

        return redirect()->route('pengaturan-akun');
    }

    /** Nonaktifkan atau aktifkan lagi. Akun nonaktif langsung dikeluarkan (EnsureAkunAktif). */
    public function status(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['aktif' => ['required', 'boolean']]);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'aktif' => 'Akun Anda sendiri tidak dapat dinonaktifkan.',
            ]);
        }

        $user->update(['is_active' => (bool) $data['aktif']]);

        Inertia::flash('toast', [
            'pesan' => $user->is_active ? "Akun {$user->name} aktif lagi" : "Akun {$user->name} dinonaktifkan",
        ]);

        return back();
    }

    /** Kata sandi sementara tampil sekali untuk diberikan langsung kepada kader. */
    public function aturUlangSandi(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'sandi' => 'Ganti kata sandi Anda sendiri lewat Lainnya > Ganti kata sandi.',
            ]);
        }

        $sandi = SandiSementara::buat();
        $user->forceFill(['password' => $sandi, 'remember_token' => null])->save();
        LoginLockout::bukaKunci($user->username);

        return back()->with(self::KUNCI_SANDI, [
            'judul' => 'Kata sandi diatur ulang',
            'nama' => $user->name,
            'username' => $user->username,
            'sandi' => $sandi,
        ]);
    }

    /** Nomor HP boleh ditulis dengan spasi atau tanda hubung (sama dengan Meja 1). */
    private function rapikanNoHp(Request $request): void
    {
        if (is_string($request->input('no_hp'))) {
            $request->merge(['no_hp' => preg_replace('/[\s\-]/', '', $request->input('no_hp')) ?: null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function tampilan(User $user): array
    {
        return [
            'id' => $user->id,
            'nama' => $user->name,
            'username' => $user->username,
            'noHp' => $user->no_hp,
            'mejaBiasa' => $user->meja_biasa?->value,
        ];
    }

    /**
     * @return list<array{nomor: int, tahap: string}>
     */
    private function daftarMeja(): array
    {
        return array_map(fn (Meja $meja) => ['nomor' => $meja->value, 'tahap' => $meja->tahap()], Meja::cases());
    }

    /**
     * @return array<string, mixed>
     */
    private function aturan(?User $user = null): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'username' => [
                'required', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9._]+$/',
                Rule::unique('users', 'username')->ignore($user),
            ],
            'no_hp' => ['nullable', 'regex:/^(08\d{8,11}|\+62\d{8,11})$/'],
            'meja_biasa' => ['nullable', 'integer', Rule::enum(Meja::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function pesan(): array
    {
        return [
            'username.regex' => 'Nama pengguna hanya huruf kecil, angka, titik, atau garis bawah.',
            'username.unique' => 'Nama pengguna sudah dipakai.',
            'no_hp.regex' => 'Nomor HP 10 sampai 13 digit, diawali 08 atau +62.',
        ];
    }
}
