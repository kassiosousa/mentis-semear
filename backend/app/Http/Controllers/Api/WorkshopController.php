<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workshop\StoreWorkshopRequest;
use App\Http\Requests\Workshop\UpdateWorkshopRequest;
use App\Models\Workshop;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Administrative management of workshops (admin-only).
 * The creator (user_creator_id) is always the authenticated user.
 */
final class WorkshopController extends Controller
{
    #[OA\Get(
        path: '/api/workshops',
        summary: 'Lista workshops (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Workshops'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, description: 'Filtra por empresa', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista paginada',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Workshop')),
                        new OA\Property(property: 'current_page', type: 'integer', example: 1),
                        new OA\Property(property: 'per_page', type: 'integer', example: 15),
                        new OA\Property(property: 'total', type: 'integer', example: 42),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $workshops = Workshop::query()
            ->when($request->query('company_id'), fn ($q, $companyId) => $q->where('company_id', $companyId))
            ->orderByDesc('datetime')
            ->paginate(15);

        return response()->json($workshops);
    }

    #[OA\Post(
        path: '/api/workshops',
        summary: 'Cria um workshop (o criador é o usuário autenticado)',
        security: [['bearerAuth' => []]],
        tags: ['Workshops'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['company_id', 'datetime', 'address', 'checkin_link', 'assessment_link'],
                properties: [
                    new OA\Property(property: 'company_id', type: 'integer', example: 1),
                    new OA\Property(property: 'user_facilitator_id', type: 'string', format: 'uuid', nullable: true),
                    new OA\Property(property: 'datetime', type: 'string', format: 'date-time', example: '2026-09-01 14:00:00'),
                    new OA\Property(property: 'address', type: 'string', example: 'Auditório - Matriz'),
                    new OA\Property(property: 'checkin_link', type: 'string', example: 'https://mentis.kassiosousa.com.br/checkin/abc'),
                    new OA\Property(property: 'assessment_link', type: 'string', example: 'https://mentis.kassiosousa.com.br/avaliacao/abc'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Criado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Workshop')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function store(StoreWorkshopRequest $request): JsonResponse
    {
        $workshop = Workshop::create([
            ...$request->validated(),
            'user_creator_id' => auth('api')->id(),
        ]);

        return response()->json(['data' => $workshop], 201);
    }

    #[OA\Get(
        path: '/api/workshops/{workshop}',
        summary: 'Detalha um workshop',
        security: [['bearerAuth' => []]],
        tags: ['Workshops'],
        parameters: [new OA\Parameter(name: 'workshop', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Workshop', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Workshop')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(Workshop $workshop): JsonResponse
    {
        return response()->json(['data' => $workshop]);
    }

    #[OA\Put(
        path: '/api/workshops/{workshop}',
        summary: 'Atualiza um workshop (campos parciais)',
        security: [['bearerAuth' => []]],
        tags: ['Workshops'],
        parameters: [new OA\Parameter(name: 'workshop', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'company_id', type: 'integer'),
                    new OA\Property(property: 'user_facilitator_id', type: 'string', format: 'uuid', nullable: true),
                    new OA\Property(property: 'datetime', type: 'string', format: 'date-time'),
                    new OA\Property(property: 'address', type: 'string'),
                    new OA\Property(property: 'checkin_link', type: 'string'),
                    new OA\Property(property: 'assessment_link', type: 'string'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Atualizado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Workshop')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateWorkshopRequest $request, Workshop $workshop): JsonResponse
    {
        $workshop->update($request->validated());

        return response()->json(['data' => $workshop]);
    }

    #[OA\Delete(
        path: '/api/workshops/{workshop}',
        summary: 'Remove um workshop (check-ins, avaliações e diário são removidos em cascata)',
        security: [['bearerAuth' => []]],
        tags: ['Workshops'],
        parameters: [new OA\Parameter(name: 'workshop', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 409, description: 'Vínculo impede a remoção'),
        ],
    )]
    public function destroy(Workshop $workshop): Response
    {
        try {
            $workshop->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Workshop possui vínculos que impedem a remoção.'], 409);
        }

        return response()->noContent();
    }
}
