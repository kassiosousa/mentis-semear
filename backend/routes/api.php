<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Api\DiaryEvidenceController;
use App\Http\Controllers\Api\LogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkshopController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'mentis-semear-api']));

// Endpoints públicos (participantes, sem autenticação) — throttle contra abuso.
Route::prefix('public')->middleware('throttle:60,1')->group(function (): void {
    // Resolve o workshop pelo token do link (ex.: /checkin/abc) — só dados públicos do evento.
    Route::get('/workshops/{workshop:token}', [WorkshopController::class, 'publicShow']);
    Route::post('/check-ins', [CheckInController::class, 'publicStore']);
    Route::post('/assessments', [AssessmentController::class, 'publicStore']);
});

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Gestão de usuários + auditoria — apenas admin.
Route::middleware(['auth:api', 'type:admin'])->group(function (): void {
    Route::apiResource('users', UserController::class);

    // Logs de auditoria (somente leitura — gravados automaticamente).
    Route::get('logs', [LogController::class, 'index']);
    Route::get('logs/{log}', [LogController::class, 'show']);
});

// Domínio operacional — admin e usuário padrão.
Route::middleware(['auth:api', 'type:admin,usuario'])->group(function (): void {
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('workshops', WorkshopController::class);
    Route::apiResource('check-ins', CheckInController::class)->parameters(['check-ins' => 'checkIn']);
    Route::apiResource('assessments', AssessmentController::class);
    Route::apiResource('diaries', DiaryController::class);
    Route::apiResource('diary-evidences', DiaryEvidenceController::class)->parameters(['diary-evidences' => 'diaryEvidence']);
});
