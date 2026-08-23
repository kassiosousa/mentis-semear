<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Api\DiaryEvidenceController;
use App\Http\Controllers\Api\LogController;
use App\Http\Controllers\Api\MoodEntryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SectorController;
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

    // Termômetro emocional: empresa pelo token (nome + setores) e registro anônimo.
    Route::get('/companies/{company:token}', [CompanyController::class, 'publicShow']);
    Route::post('/mood-entries', [MoodEntryController::class, 'publicStore']);
});

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Notificações do usuário autenticado (criação é interna, via eventos).
Route::middleware('auth:api')->prefix('notifications')->group(function (): void {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/read-all', [NotificationController::class, 'readAll']);
    Route::get('/{notification}', [NotificationController::class, 'show']);
    Route::patch('/{notification}', [NotificationController::class, 'update']);
    Route::delete('/{notification}', [NotificationController::class, 'destroy']);
});

// Gestão de usuários + auditoria — apenas admin.
Route::middleware(['auth:api', 'type:admin'])->group(function (): void {
    Route::apiResource('users', UserController::class);

    // Logs de auditoria (somente leitura — gravados automaticamente).
    Route::get('logs', [LogController::class, 'index']);
    Route::get('logs/{log}', [LogController::class, 'show']);
});

// Acesso do facilitador: leitura de workshops + CRUD completo de diários e anexos.
Route::middleware(['auth:api', 'type:admin,usuario,facilitador'])->group(function (): void {
    Route::apiResource('workshops', WorkshopController::class)->only(['index', 'show']);
    Route::apiResource('diaries', DiaryController::class);
    // Download dos arquivos do diário (slot 1 ou 2).
    Route::get('diaries/{diary}/files/{slot}', [DiaryController::class, 'downloadFile'])->whereIn('slot', ['1', '2']);
    Route::apiResource('diary-evidences', DiaryEvidenceController::class)->parameters(['diary-evidences' => 'diaryEvidence']);
});

// Setores + termômetro emocional — admin (todas as empresas) e usuário "empresa" (só a sua).
Route::middleware(['auth:api', 'type:admin,empresa'])->group(function (): void {
    Route::apiResource('sectors', SectorController::class);

    // Termômetro emocional (leitura/gestão) — 'summary' antes de '{moodEntry}'.
    Route::get('mood-entries/summary', [MoodEntryController::class, 'summary']);
    Route::get('mood-entries', [MoodEntryController::class, 'index']);
    Route::get('mood-entries/{moodEntry}', [MoodEntryController::class, 'show']);
    Route::delete('mood-entries/{moodEntry}', [MoodEntryController::class, 'destroy']);
});

// Domínio operacional — admin e usuário padrão.
Route::middleware(['auth:api', 'type:admin,usuario'])->group(function (): void {
    Route::apiResource('companies', CompanyController::class);
    // Escrita de workshop (criar/editar/deletar) fica restrita a admin/usuário.
    Route::apiResource('workshops', WorkshopController::class)->except(['index', 'show']);
    Route::apiResource('check-ins', CheckInController::class)->parameters(['check-ins' => 'checkIn']);
    Route::apiResource('assessments', AssessmentController::class);
});

// Relatórios (somente leitura): agregados + lista paginada; escopo por perfil.
Route::middleware('auth:api')->prefix('reports')->group(function (): void {
    // Workshops / participação / satisfação — admin, usuário e empresa (só a própria).
    Route::middleware('type:admin,usuario,empresa')->group(function (): void {
        Route::get('workshops', [ReportController::class, 'workshops']);
        Route::get('check-ins', [ReportController::class, 'checkIns']);
        Route::get('assessments', [ReportController::class, 'assessments']);
    });

    // Comparativo entre empresas — só admin e usuário (não expõe outras empresas).
    Route::middleware('type:admin,usuario')->group(function (): void {
        Route::get('companies-overview', [ReportController::class, 'companiesOverview']);
    });

    // Termômetro e painel da empresa — admin e empresa (só a própria).
    Route::middleware('type:admin,empresa')->group(function (): void {
        Route::get('mood', [ReportController::class, 'mood']);
        Route::get('company/{company}', [ReportController::class, 'companyPanel']);
    });
});
