<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kader mengganti kata sandinya sendiri, misalnya setelah menerima kata
 * sandi sementara dari Ketua Kader (FR-02; keputusan pemilik produk).
 */
class GantiSandiController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('akun/ganti-sandi');
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sandi_lama' => ['required', 'string', 'current_password'],
            'sandi_baru' => ['required', 'string', 'confirmed', 'different:sandi_lama', Password::defaults()],
        ]);

        $request->user()?->forceFill(['password' => $data['sandi_baru']])->save();

        Inertia::flash('toast', ['pesan' => 'Kata sandi diganti']);

        return redirect()->route('lainnya');
    }
}
