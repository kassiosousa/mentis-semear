<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\StoreAssessmentRequest;
use App\Http\Requests\Assessment\UpdateAssessmentRequest;
use App\Models\Assessment;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Avaliações anônimas do workshop. Gerenciável por admin e usuário padrão.
 */
final class AssessmentController extends Controller
{
    #[OA\Get(
        path: '/api/assessments',
        summary: 'Lista avaliações (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Assessments'],
        parameters: [new OA\Parameter(name: 'workshop_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Assessment')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $assessments = Assessment::query()
            ->when($request->query('workshop_id'), fn ($q, $id) => $q->where('workshop_id', $id))
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($assessments);
    }

    #[OA\Post(
        path: '/api/assessments',
        summary: 'Registra uma avaliação anônima',
        security: [['bearerAuth' => []]],
        tags: ['Assessments'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['workshop_id', 'score'],
            properties: [
                new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
                new OA\Property(property: 'score', type: 'integer', minimum: 0, maximum: 10, example: 9),
                new OA\Property(property: 'suggestions', type: 'string', nullable: true, example: 'Muito bom!'),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Criada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Assessment')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function store(StoreAssessmentRequest $request): JsonResponse
    {
        $assessment = Assessment::create($request->validated());

        return response()->json(['data' => $assessment], 201);
    }

    #[OA\Post(
        path: '/api/public/assessments',
        summary: 'Avaliação pública anônima (sem autenticação)',
        tags: ['Público'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['workshop_id', 'score'],
            properties: [
                new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
                new OA\Property(property: 'score', type: 'integer', minimum: 0, maximum: 10, example: 9),
                new OA\Property(property: 'suggestions', type: 'string', nullable: true, example: 'Muito bom!'),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Avaliação registrada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Assessment')])),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function publicStore(StoreAssessmentRequest $request): JsonResponse
    {
        $assessment = Assessment::create($request->validated());

        return response()->json(['data' => $assessment], 201);
    }

    #[OA\Get(
        path: '/api/assessments/{assessment}',
        summary: 'Detalha uma avaliação',
        security: [['bearerAuth' => []]],
        tags: ['Assessments'],
        parameters: [new OA\Parameter(name: 'assessment', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Avaliação', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Assessment')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function show(Assessment $assessment): JsonResponse
    {
        return response()->json(['data' => $assessment]);
    }

    #[OA\Put(
        path: '/api/assessments/{assessment}',
        summary: 'Atualiza uma avaliação (campos parciais)',
        security: [['bearerAuth' => []]],
        tags: ['Assessments'],
        parameters: [new OA\Parameter(name: 'assessment', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(properties: [
            new OA\Property(property: 'score', type: 'integer', minimum: 0, maximum: 10),
            new OA\Property(property: 'suggestions', type: 'string', nullable: true),
        ])),
        responses: [
            new OA\Response(response: 200, description: 'Atualizada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Assessment')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateAssessmentRequest $request, Assessment $assessment): JsonResponse
    {
        $assessment->update($request->validated());

        return response()->json(['data' => $assessment]);
    }

    #[OA\Delete(
        path: '/api/assessments/{assessment}',
        summary: 'Remove uma avaliação',
        security: [['bearerAuth' => []]],
        tags: ['Assessments'],
        parameters: [new OA\Parameter(name: 'assessment', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removida'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function destroy(Assessment $assessment): Response
    {
        try {
            $assessment->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Não foi possível remover a avaliação.'], 409);
        }

        return response()->noContent();
    }
}
