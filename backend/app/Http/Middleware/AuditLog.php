<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Log;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Auditoria automática: grava um registro em `logs` para cada requisição de
 * AÇÃO (POST/PUT/PATCH/DELETE) bem-sucedida em /api/*.
 *
 * O usuário é capturado no handle (após a auth resolver) e a gravação ocorre
 * no terminate (depois da resposta), sem somar latência à requisição.
 */
final class AuditLog
{
    /** @var list<string> */
    private const ACTION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Neste ponto a auth já rodou — captura o id (null em rotas públicas)
        // e guarda no request para uso no terminate.
        $request->attributes->set('audit_user_id', auth('api')->id());

        return $response;
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! in_array($request->method(), self::ACTION_METHODS, true)) {
            return;
        }

        // Registra apenas ações efetivadas (respostas 2xx/3xx).
        if ($response->getStatusCode() >= 400) {
            return;
        }

        Log::create([
            'description' => Str::limit(
                sprintf('%s /%s (%d)', $request->method(), $request->path(), $response->getStatusCode()),
                500,
                '',
            ),
            'user_id' => $request->attributes->get('audit_user_id'),
        ]);
    }
}
