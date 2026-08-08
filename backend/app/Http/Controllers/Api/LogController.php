<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Consulta de logs de auditoria (somente leitura, admin).
 * A gravação é automática (middleware AuditLog) — não há criação via API.
 */
final class LogController extends Controller
{
    #[OA\Get(
        path: '/api/logs',
        summary: 'Lista os logs de auditoria (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Logs'],
        parameters: [
            new OA\Parameter(name: 'user_id', in: 'query', required: false, description: 'Filtra pelo usuário que executou a ação', schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, description: 'Itens por página (1–100, padrão 30)', schema: new OA\Schema(type: 'integer', default: 30, maximum: 100, minimum: 1)),
            new OA\Parameter(name: 'page', in: 'query', required: false, description: 'Número da página', schema: new OA\Schema(type: 'integer', default: 1, minimum: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Log')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        // Tamanho da página configurável via ?per_page (limitado a 1–100).
        $perPage = max(1, min($request->integer('per_page', 30), 100));

        $logs = Log::query()
            ->when($request->query('user_id'), fn ($q, $userId) => $q->where('user_id', $userId))
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($logs);
    }

    #[OA\Get(
        path: '/api/logs/{log}',
        summary: 'Detalha um log de auditoria',
        security: [['bearerAuth' => []]],
        tags: ['Logs'],
        parameters: [new OA\Parameter(name: 'log', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Log', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Log')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(Log $log): JsonResponse
    {
        return response()->json(['data' => $log]);
    }
}
