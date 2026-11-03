<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// FR-53: data anak yang dihapus lebih dari 30 hari terhapus permanen.
// Produksi perlu cron `php artisan schedule:run` setiap menit.
Schedule::command('model:prune')->daily();
