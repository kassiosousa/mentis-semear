<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckIn\StoreCheckInRequest;
use App\Http\Requests\CheckIn\UpdateCheckInRequest;
use App\Models\CheckIn;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check-ins de participantes. Gerenciável por admin e usuário padrão.
 */
final class CheckInController extends Controller
{
    #[OA\Get(
        path: '/api/check-ins',
        summary: 'Lista check-ins (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['CheckIns'],
        parameters: [new OA\Parameter(name: 'workshop_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/CheckIn')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $checkIns = CheckIn::query()
            ->when($request->query('workshop_id'), fn ($q, $id) => $q->where('workshop_id', $id))
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($checkIns);
    }

    #[OA\Post(
        path: '/api/check-ins',
        summary: 'Registra um check-in',
        security: [['bearerAuth' => []]],
        tags: ['CheckIns'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['workshop_id', 'name', 'position', 'sector', 'lgpd_read', 'cpf', 'birthday', 'gender', 'celphone'],
            properties: [
                new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
                new OA\Property(property: 'name', type: 'string', example: 'João Participante'),
                new OA\Property(property: 'position', type: 'string', example: 'Analista'),
                new OA\Property(property: 'sector', type: 'string', example: 'TI'),
                new OA\Property(property: 'lgpd_read', type: 'boolean', example: true),
                new OA\Property(property: 'cpf', type: 'string', example: '12345678901'),
                new OA\Property(property: 'birthday', type: 'string', format: 'date', example: '1990-05-20'),
                new OA\Property(property: 'gender', type: 'string', example: 'M'),
                new OA\Property(property: 'celphone', type: 'string', example: '11999999999'),
                new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Criado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/CheckIn')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação (CPF já registrado neste workshop, etc.)'),
        ],
    )]
    public function store(StoreCheckInRequest $request): JsonResponse
    {
        $data = $request->validated();
        // Registra o momento do consentimento LGPD quando aceito.
        $data['lgpd_consent_at'] = ($data['lgpd_read'] ?? false) ? now() : null;

        $checkIn = CheckIn::create($data);

        return response()->json(['data' => $checkIn], 201);
    }

    #[OA\Post(
        path: '/api/public/check-ins',
        summary: 'Check-in público de participante (sem autenticação)',
        tags: ['Público'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['workshop_id', 'name', 'position', 'sector', 'lgpd_read', 'cpf', 'birthday', 'gender', 'celphone'],
            properties: [
                new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
                new OA\Property(property: 'name', type: 'string', example: 'João Participante'),
                new OA\Property(property: 'position', type: 'string', example: 'Analista'),
                new OA\Property(property: 'sector', type: 'string', example: 'TI'),
                new OA\Property(property: 'lgpd_read', type: 'boolean', example: true),
                new OA\Property(property: 'cpf', type: 'string', example: '12345678901'),
                new OA\Property(property: 'birthday', type: 'string', format: 'date', example: '1990-05-20'),
                new OA\Property(property: 'gender', type: 'string', example: 'M'),
                new OA\Property(property: 'celphone', type: 'string', example: '11999999999'),
                new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Check-in registrado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/CheckIn')])),
            new OA\Response(response: 422, description: 'Falha de validação (CPF já registrado neste workshop, etc.)'),
        ],
    )]
    public function publicStore(StoreCheckInRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['lgpd_consent_at'] = ($data['lgpd_read'] ?? false) ? now() : null;

        $checkIn = CheckIn::create($data);

        return response()->json(['data' => $checkIn], 201);
    }

    #[OA\Get(
        path: '/api/check-ins/{checkIn}',
        summary: 'Detalha um check-in',
        security: [['bearerAuth' => []]],
        tags: ['CheckIns'],
        parameters: [new OA\Parameter(name: 'checkIn', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Check-in', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/CheckIn')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(CheckIn $checkIn): JsonResponse
    {
        return response()->json(['data' => $checkIn]);
    }

    #[OA\Put(
        path: '/api/check-ins/{checkIn}',
        summary: 'Atualiza um check-in (campos parciais)',
        security: [['bearerAuth' => []]],
        tags: ['CheckIns'],
        parameters: [new OA\Parameter(name: 'checkIn', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(properties: [
            new OA\Property(property: 'name', type: 'string'),
            new OA\Property(property: 'position', type: 'string'),
            new OA\Property(property: 'sector', type: 'string'),
            new OA\Property(property: 'lgpd_read', type: 'boolean'),
            new OA\Property(property: 'cpf', type: 'string'),
            new OA\Property(property: 'birthday', type: 'string', format: 'date'),
            new OA\Property(property: 'gender', type: 'string'),
            new OA\Property(property: 'celphone', type: 'string'),
            new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
        ])),
        responses: [
            new OA\Response(response: 200, description: 'Atualizado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/CheckIn')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateCheckInRequest $request, CheckIn $checkIn): JsonResponse
    {
        $checkIn->update($request->validated());

        return response()->json(['data' => $checkIn]);
    }

    #[OA\Delete(
        path: '/api/check-ins/{checkIn}',
        summary: 'Remove um check-in',
        security: [['bearerAuth' => []]],
        tags: ['CheckIns'],
        parameters: [new OA\Parameter(name: 'checkIn', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function destroy(CheckIn $checkIn): Response
    {
        try {
            $checkIn->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Não foi possível remover o check-in.'], 409);
        }

        return response()->noContent();
    }
}
