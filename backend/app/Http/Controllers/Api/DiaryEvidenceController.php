<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiaryEvidence\StoreDiaryEvidenceRequest;
use App\Http\Requests\DiaryEvidence\UpdateDiaryEvidenceRequest;
use App\Models\DiaryEvidence;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Evidências do diário (links de fotos/documentos). Gerenciável por admin e usuário padrão.
 * O criador (user_creator_id) é sempre o usuário autenticado.
 */
final class DiaryEvidenceController extends Controller
{
    #[OA\Get(
        path: '/api/diary-evidences',
        summary: 'Lista evidências (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['DiaryEvidences'],
        parameters: [new OA\Parameter(name: 'diary_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/DiaryEvidence')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $evidences = DiaryEvidence::query()
            ->when($request->query('diary_id'), fn ($q, $id) => $q->where('diary_id', $id))
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($evidences);
    }

    #[OA\Post(
        path: '/api/diary-evidences',
        summary: 'Adiciona uma evidência a um diário',
        security: [['bearerAuth' => []]],
        tags: ['DiaryEvidences'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['diary_id', 'link'],
            properties: [
                new OA\Property(property: 'diary_id', type: 'integer', example: 1),
                new OA\Property(property: 'link', type: 'string', example: 'https://drive.google.com/file/abc'),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Criada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/DiaryEvidence')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function store(StoreDiaryEvidenceRequest $request): JsonResponse
    {
        $evidence = DiaryEvidence::create([
            ...$request->validated(),
            'user_creator_id' => auth('api')->id(),
        ]);

        return response()->json(['data' => $evidence], 201);
    }

    #[OA\Get(
        path: '/api/diary-evidences/{diaryEvidence}',
        summary: 'Detalha uma evidência',
        security: [['bearerAuth' => []]],
        tags: ['DiaryEvidences'],
        parameters: [new OA\Parameter(name: 'diaryEvidence', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Evidência', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/DiaryEvidence')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function show(DiaryEvidence $diaryEvidence): JsonResponse
    {
        return response()->json(['data' => $diaryEvidence]);
    }

    #[OA\Put(
        path: '/api/diary-evidences/{diaryEvidence}',
        summary: 'Atualiza o link de uma evidência',
        security: [['bearerAuth' => []]],
        tags: ['DiaryEvidences'],
        parameters: [new OA\Parameter(name: 'diaryEvidence', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(properties: [
            new OA\Property(property: 'link', type: 'string'),
        ])),
        responses: [
            new OA\Response(response: 200, description: 'Atualizada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/DiaryEvidence')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateDiaryEvidenceRequest $request, DiaryEvidence $diaryEvidence): JsonResponse
    {
        $diaryEvidence->update($request->validated());

        return response()->json(['data' => $diaryEvidence]);
    }

    #[OA\Delete(
        path: '/api/diary-evidences/{diaryEvidence}',
        summary: 'Remove uma evidência',
        security: [['bearerAuth' => []]],
        tags: ['DiaryEvidences'],
        parameters: [new OA\Parameter(name: 'diaryEvidence', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removida'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function destroy(DiaryEvidence $diaryEvidence): Response
    {
        try {
            $diaryEvidence->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Não foi possível remover a evidência.'], 409);
        }

        return response()->noContent();
    }
}
