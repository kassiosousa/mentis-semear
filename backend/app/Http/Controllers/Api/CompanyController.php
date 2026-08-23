<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Administrative management of companies (admin-only).
 */
final class CompanyController extends Controller
{
    #[OA\Get(
        path: '/api/companies',
        summary: 'Lista empresas (paginado)',
        security: [['bearerAuth' => []]],
        tags: ['Companies'],
        parameters: [
            new OA\Parameter(name: 'search', in: 'query', required: false, description: 'Filtra por nome', schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista paginada',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Company')),
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
        $companies = Company::query()
            ->when($request->query('search'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(15);

        return response()->json($companies);
    }

    #[OA\Post(
        path: '/api/companies',
        summary: 'Cria uma empresa',
        security: [['bearerAuth' => []]],
        tags: ['Companies'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'address', 'email'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'ACME Ltda'),
                    new OA\Property(property: 'address', type: 'string', example: 'Rua das Flores, 123'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'contato@acme.com'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Criada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Company')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação'),
            new OA\Response(response: 500, description: 'Não foi possível gerar um token único para a empresa'),
        ],
    )]
    public function store(StoreCompanyRequest $request): JsonResponse
    {
        try {
            $company = Company::createWithUniqueToken($request->validated());
        } catch (\RuntimeException) {
            return response()->json([
                'message' => 'Não foi possível criar a empresa: falha ao gerar um token único. Tente novamente.',
            ], 500);
        }

        return response()->json(['data' => $company], 201);
    }

    #[OA\Get(
        path: '/api/public/companies/{token}',
        summary: 'Dados públicos da empresa pelo token (sem autenticação)',
        description: 'Usado pela página pública do termômetro emocional para carregar a empresa e a lista de setores. Retorna apenas dados públicos — nunca participantes ou respostas.',
        tags: ['Público'],
        parameters: [new OA\Parameter(name: 'token', in: 'path', required: true, description: 'Token público da empresa (do link do termômetro)', schema: new OA\Schema(type: 'string', example: 'aB3xK9pQ2mL'))],
        responses: [
            new OA\Response(response: 200, description: 'Dados públicos da empresa', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'object', properties: [
                    new OA\Property(property: 'id', type: 'integer', example: 1),
                    new OA\Property(property: 'name', type: 'string', example: 'ACME Ltda'),
                    new OA\Property(property: 'sectors', type: 'array', description: 'Setores para o participante escolher', items: new OA\Items(properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'name', type: 'string', example: 'Tecnologia da Informação'),
                    ], type: 'object')),
                ]),
            ])),
            new OA\Response(response: 404, description: 'Token inválido'),
        ],
    )]
    public function publicShow(Company $company): JsonResponse
    {
        // Apenas dados públicos + setores para o formulário do termômetro.
        return response()->json(['data' => [
            'id' => $company->id,
            'name' => $company->name,
            'sectors' => $company->sectors()->orderBy('name')->get(['id', 'name']),
        ]]);
    }

    #[OA\Get(
        path: '/api/companies/{company}',
        summary: 'Detalha uma empresa',
        security: [['bearerAuth' => []]],
        tags: ['Companies'],
        parameters: [new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Empresa', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Company')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function show(Company $company): JsonResponse
    {
        return response()->json(['data' => $company]);
    }

    #[OA\Put(
        path: '/api/companies/{company}',
        summary: 'Atualiza uma empresa (campos parciais)',
        security: [['bearerAuth' => []]],
        tags: ['Companies'],
        parameters: [new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'ACME S.A.'),
                    new OA\Property(property: 'address', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Atualizada', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Company')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $company->update($request->validated());

        return response()->json(['data' => $company]);
    }

    #[OA\Delete(
        path: '/api/companies/{company}',
        summary: 'Remove uma empresa',
        security: [['bearerAuth' => []]],
        tags: ['Companies'],
        parameters: [new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removida'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 404, description: 'Não encontrada'),
            new OA\Response(response: 409, description: 'Empresa possui workshops vinculados'),
        ],
    )]
    public function destroy(Company $company): Response
    {
        try {
            $company->delete();
        } catch (QueryException) {
            return response()->json(['message' => 'Empresa possui workshops vinculados e não pode ser removida.'], 409);
        }

        return response()->noContent();
    }
}
