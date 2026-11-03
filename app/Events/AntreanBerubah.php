<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Antrean satu atau beberapa meja berubah (FR-09, NFR-02).
 *
 * Disiarkan langsung (tanpa antrean job) agar layar kader lain berubah
 * dalam 3 detik. Payload hanya nomor meja, tanpa data pribadi anak; layar
 * memuat ulang datanya lewat HTTP yang sudah berautentikasi.
 */
class AntreanBerubah implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /**
     * @param  list<int>  $meja
     */
    public function __construct(public array $meja) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('antrean')];
    }

    public function broadcastAs(): string
    {
        return 'antrean.berubah';
    }

    /**
     * @return array{meja: list<int>}
     */
    public function broadcastWith(): array
    {
        return ['meja' => $this->meja];
    }
}
