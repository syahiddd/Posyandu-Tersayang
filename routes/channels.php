<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Perubahan antrean meja (FR-09, NFR-02): hanya untuk kader aktif.
Broadcast::channel('antrean', fn (User $user): bool => $user->is_active);
