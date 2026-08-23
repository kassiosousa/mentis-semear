<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sector\StoreSectorRequest;
use App\Http\Requests\Sector\UpdateSectorRequest;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gestão de setores vinculados a empresas.
 * Acesso: admin (todas as empresas) e empresa (apenas a sua).
 */
final class SectorController extends Controller
{
    #[OA\Get(
        path: '/api/sectors',
        summary: 'Lista setores (paginado)',
        description: 'Admin vê todos (com filtro opcional por empresa); usuário "empresa" vê apenas os da própria empresa.',
        security: [['bearerAuth' => []]],
        tags: ['Sectors'],
        parameters: [new OA\Parameter(name: 'company_id', in: 'query', required: false, description: 'Filtra por empresa (apenas admin)', schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Sector')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $user = $this->currentUser();

        $sectors = Sector::query()
            ->when($user->type === UserType::Empresa, fn ($q) => $q->where('company_id', $user->company_id))
            ->when($user->type === UserType::Admin && $request->filled('company_id'), fn ($q) => $q->where('company_id', $request->query('company_id')))
            ->orderBy('name')
            ->paginate(15);

        return response()->json($sectors);
    }

    #[OA\Post(
        path: '/api/sectors',
        summary: 'Cria um setor',
        description: 'Admin informa company_id; usuário "empresa" cria sempre para a própria empresa (company_id ignorado).',
        security: [['bearerAuth' => []]],
        tags: ['Sectors'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['name'],
            properties: [
                new OA\Property(property: 'company_id', type: 'integer', example: 1, description: 'Obrigatório para admin; ignorado para usuário "empresa"'),
                new OA\Property(property: 'name', type: 'string', example: 'Tecnologia da Informação'),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Criado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Sector')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
            new OA\Response(response: 422, description: 'Falha de validação (nome duplicado na empresa, etc.)'),
        ],
    )]
    public function store(StoreSectorRequest $request): JsonResponse
    {
        $sector = Sector::create([
            'company_id' => $request->resolvedCompanyId(),
            'name' => $request->validated('name'),
        ]);

        return response()->json(['data' => $sector], 201);
    }

    #[OA\Get(
        path: '/api/sectors/{sector}',
        summary: 'Detalha um setor',
        security: [['bearerAuth' => []]],
        tags: ['Sectors'],
        parameters: [new OA\Parameter(name: 'sector', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Setor', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Sector')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Setor de outra empresa'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(Sector $sector): JsonResponse
    {
        $this->authorizeCompanyAccess($sector);

        return response()->json(['data' => $sector]);
    }

    #[OA\Put(
        path: '/api/sectors/{sector}',
        summary: 'Atualiza um setor (apenas o nome)',
        security: [['bearerAuth' => []]],
        tags: ['Sectors'],
        parameters: [new OA\Parameter(name: 'sector', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(properties: [new OA\Property(property: 'name', type: 'string', example: 'Recursos Humanos')])),
        responses: [
            new OA\Response(response: 200, description: 'Atualizado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Sector')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Setor de outra empresa'),
            new OA\Response(response: 404, description: 'Não encontrado'),
            new OA\Response(response: 422, description: 'Falha de validação'),
        ],
    )]
    public function update(UpdateSectorRequest $request, Sector $sector): JsonResponse
    {
        $this->authorizeCompanyAccess($sector);

        $sector->update($request->validated());

        return response()->json(['data' => $sector]);
    }

    #[OA\Delete(
        path: '/api/sectors/{sector}',
        summary: 'Remove um setor (check-ins vinculados ficam sem setor)',
        security: [['bearerAuth' => []]],
        tags: ['Sectors'],
        parameters: [new OA\Parameter(name: 'sector', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Setor de outra empresa'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function destroy(Sector $sector): Response
    {
        $this->authorizeCompanyAccess($sector);

        $sector->delete();

        return response()->noContent();
    }

    private function currentUser(): User
    {
        /** @var User $user */
        $user = auth('api')->user();

        return $user;
    }

    /** Usuário "empresa" só acessa setores da própria empresa; admin acessa qualquer um. */
    private function authorizeCompanyAccess(Sector $sector): void
    {
        $user = $this->currentUser();

        if ($user->type === UserType::Empresa && $sector->company_id !== $user->company_id) {
            abort(403, 'Setor não pertence à sua empresa.');
        }
    }
}
