<?php

use App\Antrean\SiarAntrean;
use App\Events\AntreanBerubah;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Exceptions;

/*
| Sinkronisasi antrean antar perangkat (FR-09, NFR-02).
*/

test('channel antrean hanya untuk kader aktif', function () {
    $otorisasi = Broadcast::getChannels()->get('antrean');

    expect($otorisasi(User::factory()->create()))->toBeTrue()
        ->and($otorisasi(User::factory()->nonaktif()->create()))->toBeFalse();
});

test('perubahan antrean disiarkan di channel privat tanpa data pribadi', function () {
    $event = new AntreanBerubah([2, 3]);

    expect($event->broadcastOn())->toEqual([new PrivateChannel('antrean')])
        ->and($event->broadcastAs())->toBe('antrean.berubah')
        ->and($event->broadcastWith())->toBe(['meja' => [2, 3]]);
});

test('SiarAntrean mengirim event dengan nomor meja unik', function () {
    Event::fake([AntreanBerubah::class]);

    SiarAntrean::kabari(2, 3, 3);

    Event::assertDispatched(AntreanBerubah::class, fn (AntreanBerubah $event) => $event->meja === [2, 3]);
});

test('gagal menyiarkan tidak menggagalkan penyimpanan, hanya dicatat', function () {
    Exceptions::fake();
    Broadcast::shouldReceive('event')->andThrow(new RuntimeException('Reverb tidak berjalan'));

    SiarAntrean::kabari(2);

    Exceptions::assertReported(RuntimeException::class);
});
