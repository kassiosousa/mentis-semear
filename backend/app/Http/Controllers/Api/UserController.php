<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Administrative management of users (admin-only).
 * Self-service (register/login/me/logout) lives in AuthController.
 */
final class UserController extends Controller
{
    #[OA\Get(
        path: '/api/users',
        summary: 'Lista usuários (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Users'],
        parameters: [
            new OA\Parameter(
                name: 'type',
                in: 'query',
                required: false,
                description: 'Filtra por tipo',
                schema: new OA\Schema(type: 'string', enum: ['admin', 'usuario', 'facilitador', 'empresa']),
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista paginada',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/User')),
                        new OA\Property(property: 'current_page', type: 'integer', example: 1),
                        new OA\Property(property: 'per_page', type: 'integer', example: 15),
                        new OA\Property(property: 'total', type: 'integer', example: 42),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->orderBy('name')
            ->paginate(15);

        return response()->json($users);
    }

    #[OA\Post(
        path: '/api/users',
        summary: 'Cria um usuário (admin define o tipo)',
        security: [['bearerAuth' => []]],
        tags: ['Users'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'type'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Ana Facilitadora'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'ana@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'senha1234'),
                    new OA\Property(property: 'type', type: 'string', enum: ['admin', 'usuario', 'facilitador', 'empresa'], example: 'facilitador'),
                    new OA\Property(property: 'company_id', type: 'integer', nullable: true, example: 1, description: 'Obrigatório quando type = empresa (empresa existente)'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Criado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/User')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json(['data' => $user], 201);
    }

    #[OA\Get(
        path: '/api/users/{user}',
        summary: 'Detalha um usuário',
        security: [['bearerAuth' => []]],
        tags: ['Users'],
        parameters: [new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid'))],
        responses: [
            new OA\Response(response: 200, description: 'Usuário', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/User')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(User $user): JsonResponse
    {
        return response()->json(['data' => $user]);
    }

    #[OA\Put(
        path: '/api/users/{user}',
        summary: 'Atualiza um usuário (campos parciais)',
        security: [['bearerAuth' => []]],
        tags: ['Users'],
        parameters: [new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid'))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Ana Silva'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8),
                    new OA\Property(property: 'type', type: 'string', enum: ['admin', 'usuario', 'facilitador', 'empresa']),
                    new OA\Property(property: 'company_id', type: 'integer', nullable: true, description: 'Obrigatório quando type = empresa'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Atualizado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/User')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json(['data' => $user]);
    }

    #[OA\Delete(
        path: '/api/users/{user}',
        summary: 'Remove um usuário',
        security: [['bearerAuth' => []]],
        tags: ['Users'],
        parameters: [new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'uuid'))],
        responses: [
            new OA\Response(response: 204, description: 'Removido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito (não admin)'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 409, description: 'Usuário possui vínculos (workshops/diários)'),
        ],
    )]
    public function destroy(User $user): Response
    {
        try {
            $user->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Usuário possui vínculos e não pode ser removido.'], 409);
        }

        return response()->noContent();
    }
}
