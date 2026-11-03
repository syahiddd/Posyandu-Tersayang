<?php

namespace App\Policies;

use App\Models\Posyandu;
use App\Models\User;

/**
 * Profil posyandu dilihat semua kader dan diubah oleh Ketua Kader
 * (PRD 2.3 Tabel 5, FR-59).
 */
class PosyanduPolicy
{
    public function view(User $user, Posyandu $posyandu): bool
    {
        return $user->is_active;
    }

    public function update(User $user, Posyandu $posyandu): bool
    {
        return $user->is_active && $user->isKetua();
    }
}
