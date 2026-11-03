<?php

namespace App\Policies;

use App\Models\Anak;
use App\Models\User;

/**
 * Hak akses data anak (PRD 2.3, Tabel 5). Semua kader aktif boleh melihat,
 * menambah, dan mengubah; hanya Ketua Kader yang boleh menghapus dan
 * memulihkan (FR-53). Akun nonaktif sudah dikeluarkan oleh EnsureAkunAktif.
 */
class AnakPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Anak $anak): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, Anak $anak): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, Anak $anak): bool
    {
        return $user->is_active && $user->isKetua();
    }

    public function restore(User $user, Anak $anak): bool
    {
        return $user->is_active && $user->isKetua();
    }

    public function forceDelete(User $user, Anak $anak): bool
    {
        return $user->is_active && $user->isKetua();
    }
}
