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
                required: ['company_id', 'datetime', 'address'],
                properties: [
                    new OA\Property(property: 'company_id', type: 'integer', example: 1),
                    new OA\Property(property: 'user_facilitator_id', type: 'string', format: 'uuid', nullable: true),
                    new OA\Property(property: 'datetime', type: 'string', format: 'date-time', example: '2026-09-01 14:00:00'),
                    new OA\Property(property: 'address', type: 'string', example: 'Auditório - Matriz'),
                ],
                // token, checkin_link e assessment_link são gerados no backend, não enviados aqui.
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Criado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Workshop')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação'),
            new OA\Response(response: 500, description: 'Não foi possível gerar um token único para o workshop'),
        ],
    )]
    public function store(StoreWorkshopRequest $request): JsonResponse
    {
        try {
            $workshop = Workshop::createWithUniqueToken([
                ...$request->validated(),
                'user_creator_id' => auth('api')->id(),
            ]);
        } catch (\RuntimeException) {
            // Colisões de token esgotaram as tentativas — nada foi persistido.
            return response()->json([
                'message' => 'Não foi possível criar o workshop: falha ao gerar um token único. Tente novamente.',
            ], 500);
        }

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

    #[OA\Get(
        path: '/api/public/workshops/{token}',
        summary: 'Dados públicos do workshop pelo token (sem autenticação)',
        description: 'Usado pela página pública de check-in/avaliação para resolver o workshop a partir do token do link. Retorna apenas dados do evento — nunca participantes ou dados pessoais.',
        tags: ['Público'],
        parameters: [new OA\Parameter(name: 'token', in: 'path', required: true, description: 'Token público do workshop (presente nos links de check-in/avaliação)', schema: new OA\Schema(type: 'string', example: 'aB3xK9pQ2mL'))],
        responses: [
            new OA\Response(response: 200, description: 'Dados públicos do evento', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'object', properties: [
                    new OA\Property(property: 'id', type: 'integer', example: 1),
                    new OA\Property(property: 'datetime', type: 'string', format: 'date-time', example: '2026-09-01T14:00:00Z'),
                    new OA\Property(property: 'address', type: 'string', example: 'Auditório - Matriz'),
                    new OA\Property(property: 'company', type: 'string', example: 'ACME Ltda'),
                ]),
            ])),
            new OA\Response(response: 404, description: 'Token inválido'),
        ],
    )]
    public function publicShow(Workshop $workshop): JsonResponse
    {
        // Somente dados do evento — nada de check-ins/dados pessoais.
        return response()->json(['data' => [
            'id' => $workshop->id,
            'datetime' => $workshop->datetime,
            'address' => $workshop->address,
            'company' => $workshop->company->name,
        ]]);
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
                ],
                // checkin_link/assessment_link não são editáveis (derivam do token).
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
