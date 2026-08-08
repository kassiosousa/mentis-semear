<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Força as requisições da API a serem tratadas como JSON.
 * Assim, erros (401, 403, 404, 422...) sempre retornam JSON com o status
 * correto — em vez de, por exemplo, redirecionar para a rota `login` (500).
 */
final class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
