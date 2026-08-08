<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Diary\StoreDiaryRequest;
use App\Http\Requests\Diary\UpdateDiaryRequest;
use App\Models\Diary;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Diário do workshop (1:1). Gerenciável por admin e usuário padrão.
 * O criador (user_creator_id) é sempre o usuário autenticado.
 */
final class DiaryController extends Controller
{
    #[OA\Get(
        path: '/api/diaries',
        summary: 'Lista diários (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Diaries'],
        parameters: [new OA\Parameter(name: 'workshop_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Diary')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $diaries = Diary::query()
            ->when($request->query('workshop_id'), fn ($q, $id) => $q->where('workshop_id', $id))
            ->orderByDesc('datetime')
            ->paginate(15);

        return response()->json($diaries);
    }

    #[OA\Post(
        path: '/api/diaries',
        summary: 'Cria o diário de um workshop (1 por workshop)',
        security: [['bearerAuth' => []]],
        tags: ['Diaries'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['workshop_id', 'title', 'description', 'datetime'],
            properties: [
                new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
                new OA\Property(property: 'title', type: 'string', example: 'Relato do dia'),
                new OA\Property(property: 'description', type: 'string'),
                new OA\Property(property: 'datetime', type: 'string', format: 'date-time', example: '2026-09-01 16:00:00'),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Criado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Diary')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação (workshop inexistente ou já com diário)'),
        ],
    )]
    public function store(StoreDiaryRequest $request): JsonResponse
    {
        $diary = Diary::create([
            ...$request->validated(),
            'user_creator_id' => auth('api')->id(),
        ]);

        return response()->json(['data' => $diary], 201);
    }

    #[OA\Get(
        path: '/api/diaries/{diary}',
        summary: 'Detalha um diário',
        security: [['bearerAuth' => []]],
        tags: ['Diaries'],
        parameters: [new OA\Parameter(name: 'diary', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Diário', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Diary')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(Diary $diary): JsonResponse
    {
        return response()->json(['data' => $diary]);
    }

    #[OA\Put(
        path: '/api/diaries/{diary}',
        summary: 'Atualiza um diário (campos parciais)',
        security: [['bearerAuth' => []]],
        tags: ['Diaries'],
        parameters: [new OA\Parameter(name: 'diary', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(properties: [
            new OA\Property(property: 'title', type: 'string'),
            new OA\Property(property: 'description', type: 'string'),
            new OA\Property(property: 'datetime', type: 'string', format: 'date-time'),
        ])),
        responses: [
            new OA\Response(response: 200, description: 'Atualizado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Diary')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateDiaryRequest $request, Diary $diary): JsonResponse
    {
        $diary->update($request->validated());

        return response()->json(['data' => $diary]);
    }

    #[OA\Delete(
        path: '/api/diaries/{diary}',
        summary: 'Remove um diário (evidências são removidas em cascata)',
        security: [['bearerAuth' => []]],
        tags: ['Diaries'],
        parameters: [new OA\Parameter(name: 'diary', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 409, description: 'Vínculo impede a remoção'),
        ],
    )]
    public function destroy(Diary $diary): Response
    {
        try {
            $diary->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Diário possui vínculos que impedem a remoção.'], 409);
        }

        return response()->noContent();
    }
}
