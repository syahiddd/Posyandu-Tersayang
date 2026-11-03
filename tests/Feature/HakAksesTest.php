<?php

use App\Models\Anak;
use App\Models\Posyandu;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/*
| Hak akses berbasis role (PRD 2.3 Tabel 5): FR-02, FR-53, FR-59.
*/

test('hanya ketua yang boleh kelola akun (FR-02)', function () {
    expect(Gate::forUser(User::factory()->ketua()->create())->allows('kelola-akun'))->toBeTrue()
        ->and(Gate::forUser(User::factory()->create())->allows('kelola-akun'))->toBeFalse()
        ->and(Gate::forUser(User::factory()->ketua()->nonaktif()->create())->allows('kelola-akun'))->toBeFalse();
});

test('hanya ketua yang boleh menghapus dan memulihkan anak (FR-53)', function () {
    $anak = Anak::factory()->create();
    $ketua = User::factory()->ketua()->create();
    $kader = User::factory()->create();

    expect($ketua->can('delete', $anak))->toBeTrue()
        ->and($ketua->can('restore', $anak))->toBeTrue()
        ->and($kader->can('delete', $anak))->toBeFalse()
        ->and($kader->can('restore', $anak))->toBeFalse()
        ->and($kader->can('forceDelete', $anak))->toBeFalse();
});

test('semua kader aktif boleh melihat, menambah, dan mengubah anak (PRD 2.3)', function () {
    $anak = Anak::factory()->create();
    $kader = User::factory()->create();

    expect($kader->can('viewAny', Anak::class))->toBeTrue()
        ->and($kader->can('view', $anak))->toBeTrue()
        ->and($kader->can('create', Anak::class))->toBeTrue()
        ->and($kader->can('update', $anak))->toBeTrue();
});

test('hanya ketua yang boleh mengubah profil posyandu (FR-59)', function () {
    $posyandu = Posyandu::factory()->create();

    expect(User::factory()->ketua()->create()->can('update', $posyandu))->toBeTrue()
        ->and(User::factory()->create()->can('update', $posyandu))->toBeFalse()
        ->and(User::factory()->create()->can('view', $posyandu))->toBeTrue();
});
