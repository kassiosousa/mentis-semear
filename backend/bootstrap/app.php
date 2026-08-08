<?php

use App\Http\Middleware\AuditLog;
use App\Http\Middleware\EnsureUserType;
use App\Http\Middleware\ForceJsonResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Atrás do proxy reverso (Apache/Cloudflare) que termina o HTTPS:
        // confia no X-Forwarded-* para o Laravel gerar URLs https corretamente.
        $middleware->trustProxies(at: '*');

        // Toda requisição /api é tratada como JSON → erros retornam
        // 401/403/404/422 corretos (em vez de redirecionar para `login`).
        $middleware->api(prepend: [ForceJsonResponse::class]);

        // Auditoria: grava logs das ações (POST/PUT/PATCH/DELETE) em /api/*.
        $middleware->api(append: [AuditLog::class]);

        $middleware->alias([
            'type' => EnsureUserType::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
