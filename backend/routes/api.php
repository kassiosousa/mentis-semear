<?php

declare(strict_types=1);

use App\Http\Controllers\Api\SeedController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'mentis-semear-api']));

Route::prefix('seeds')->group(function (): void {
    Route::get('/', [SeedController::class, 'index']);
    Route::post('/', [SeedController::class, 'store']);
});
