<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkshopController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'mentis-semear-api']));

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Gestão de usuários — apenas admin.
Route::middleware(['auth:api', 'type:admin'])->group(function (): void {
    Route::apiResource('users', UserController::class);
});

// Empresas e workshops — admin e usuário padrão.
Route::middleware(['auth:api', 'type:admin,usuario'])->group(function (): void {
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('workshops', WorkshopController::class);
});
