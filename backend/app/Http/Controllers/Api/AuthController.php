<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * JWT authentication (access token only) via the `api` guard.
 * Token issuance/validation is an infrastructure concern and lives here,
 * not in the Domain/Application layers.
 */
final class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/auth/register',
        summary: 'Registra um novo usuário (tipo "usuario") e retorna um token',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Kassio'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'kassio@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'senha1234'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'senha1234'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Usuário criado', content: new OA\JsonContent(ref: '#/components/schemas/AuthToken')),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        // `type` is not user-settable at registration — defaults to "usuario".
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'type' => UserType::Usuario,
        ]);

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user, 201);
    }

    #[OA\Post(
        path: '/api/auth/login',
        summary: 'Autentica e retorna um token JWT',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'kassio@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'senha1234'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Autenticado', content: new OA\JsonContent(ref: '#/components/schemas/AuthToken')),
            new OA\Response(response: 401, description: 'Credenciais inválidas'),
        ],
    )]
    public function login(LoginRequest $request): JsonResponse
    {
        $token = auth('api')->attempt($request->only('email', 'password'));

        if (! $token) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        return $this->respondWithToken($token, auth('api')->user());
    }

    #[OA\Get(
        path: '/api/auth/me',
        summary: 'Retorna o usuário autenticado',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Usuário autenticado',
                content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/User')]),
            ),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function me(): JsonResponse
    {
        return response()->json(['data' => auth('api')->user()]);
    }

    #[OA\Post(
        path: '/api/auth/logout',
        summary: 'Invalida o token atual (logout)',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Logout realizado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    private function respondWithToken(string $token, Authenticatable $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $user,
        ], $status);
    }
}
