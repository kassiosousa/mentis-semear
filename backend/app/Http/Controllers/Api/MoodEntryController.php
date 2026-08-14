<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\MoodEntry\StoreMoodEntryRequest;
use App\Models\MoodEntry;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

/**
 * Termômetro emocional (por empresa).
 * Registro é público/anônimo; a leitura é de admin (todas) e empresa (só a sua).
 */
final class MoodEntryController extends Controller
{
    #[OA\Post(
        path: '/api/public/mood-entries',
        summary: 'Registra o termômetro emocional (público, anônimo)',
        tags: ['Público'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['company_id', 'sector_id', 'mood'],
            properties: [
                new OA\Property(property: 'company_id', type: 'integer', example: 1),
                new OA\Property(property: 'sector_id', type: 'integer', example: 1, description: 'Setor da empresa (obrigatório)'),
                new OA\Property(property: 'mood', type: 'integer', minimum: 1, maximum: 5, example: 4, description: '1 = muito mal … 5 = muito bem'),
            ],
        )),
        responses: [
            new OA\Response(response: 201, description: 'Registrado', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/MoodEntry')])),
            new OA\Response(response: 422, description: 'Falha de validação (setor fora da empresa, humor fora de 1–5, etc.)'),
        ],
    )]
    public function publicStore(StoreMoodEntryRequest $request): JsonResponse
    {
        $entry = MoodEntry::create($request->validated());

        return response()->json(['data' => $entry], 201);
    }

    #[OA\Get(
        path: '/api/mood-entries',
        summary: 'Lista registros do termômetro (paginado)',
        description: 'Admin vê todos (filtro por empresa); usuário "empresa" vê apenas os da própria empresa.',
        security: [['bearerAuth' => []]],
        tags: ['MoodEntries'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, description: 'Filtra por empresa (apenas admin)', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'sector_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista paginada', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/MoodEntry')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $entries = $this->scopedQuery($request)
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($entries);
    }

    #[OA\Get(
        path: '/api/mood-entries/summary',
        summary: 'Resumo agregado do termômetro (total, média, distribuição, por setor)',
        security: [['bearerAuth' => []]],
        tags: ['MoodEntries'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, description: 'Filtra por empresa (apenas admin)', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'sector_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Resumo', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'data', type: 'object', properties: [
                    new OA\Property(property: 'total', type: 'integer', example: 42),
                    new OA\Property(property: 'average', type: 'number', format: 'float', nullable: true, example: 3.71),
                    new OA\Property(property: 'distribution', type: 'object', example: ['1' => 2, '2' => 5, '3' => 10, '4' => 15, '5' => 10]),
                    new OA\Property(property: 'by_sector', type: 'array', items: new OA\Items(properties: [
                        new OA\Property(property: 'sector_id', type: 'integer', nullable: true, example: 1),
                        new OA\Property(property: 'sector', type: 'string', nullable: true, example: 'TI'),
                        new OA\Property(property: 'total', type: 'integer', example: 20),
                        new OA\Property(property: 'average', type: 'number', format: 'float', example: 4.1),
                    ], type: 'object')),
                ]),
            ])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function summary(Request $request): JsonResponse
    {
        $total = (clone $this->scopedQuery($request))->count();
        $average = $total > 0 ? round((float) (clone $this->scopedQuery($request))->avg('mood'), 2) : null;

        $counts = (clone $this->scopedQuery($request))
            ->selectRaw('mood, count(*) as c')
            ->groupBy('mood')
            ->pluck('c', 'mood');

        // Distribuição sempre com as 5 chaves (preenche 0 onde não houver).
        $distribution = [];
        foreach (range(1, 5) as $m) {
            $distribution[(string) $m] = (int) ($counts[$m] ?? 0);
        }

        $bySectorRaw = (clone $this->scopedQuery($request))
            ->selectRaw('sector_id, count(*) as total, round(avg(mood), 2) as average')
            ->groupBy('sector_id')
            ->get();

        $names = Sector::whereIn('id', $bySectorRaw->pluck('sector_id')->filter())->pluck('name', 'id');

        $bySector = $bySectorRaw->map(fn ($row) => [
            'sector_id' => $row->sector_id,
            'sector' => $row->sector_id ? ($names[$row->sector_id] ?? null) : null,
            'total' => (int) $row->total,
            'average' => (float) $row->average,
        ])->values();

        return response()->json(['data' => [
            'total' => $total,
            'average' => $average,
            'distribution' => $distribution,
            'by_sector' => $bySector,
        ]]);
    }

    #[OA\Get(
        path: '/api/mood-entries/{moodEntry}',
        summary: 'Detalha um registro do termômetro',
        security: [['bearerAuth' => []]],
        tags: ['MoodEntries'],
        parameters: [new OA\Parameter(name: 'moodEntry', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Registro', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/MoodEntry')])),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Registro de outra empresa'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function show(MoodEntry $moodEntry): JsonResponse
    {
        $this->authorizeCompanyAccess($moodEntry);

        return response()->json(['data' => $moodEntry]);
    }

    #[OA\Delete(
        path: '/api/mood-entries/{moodEntry}',
        summary: 'Remove um registro do termômetro',
        security: [['bearerAuth' => []]],
        tags: ['MoodEntries'],
        parameters: [new OA\Parameter(name: 'moodEntry', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 204, description: 'Removido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Registro de outra empresa'),
            new OA\Response(response: 404, description: 'Não encontrado'),
        ],
    )]
    public function destroy(MoodEntry $moodEntry): Response
    {
        $this->authorizeCompanyAccess($moodEntry);

        $moodEntry->delete();

        return response()->noContent();
    }

    /** Query já limitada ao escopo do usuário (empresa → própria; admin → todas + filtros). */
    private function scopedQuery(Request $request): Builder
    {
        $user = $this->currentUser();

        return MoodEntry::query()
            ->when($user->type === UserType::Empresa, fn ($q) => $q->where('company_id', $user->company_id))
            ->when($user->type === UserType::Admin && $request->filled('company_id'), fn ($q) => $q->where('company_id', $request->query('company_id')))
            ->when($request->filled('sector_id'), fn ($q) => $q->where('sector_id', $request->query('sector_id')));
    }

    private function currentUser(): User
    {
        /** @var User $user */
        $user = auth('api')->user();

        return $user;
    }

    /** Usuário "empresa" só acessa registros da própria empresa; admin acessa qualquer um. */
    private function authorizeCompanyAccess(MoodEntry $moodEntry): void
    {
        $user = $this->currentUser();

        if ($user->type === UserType::Empresa && $moodEntry->company_id !== $user->company_id) {
            abort(403, 'Registro não pertence à sua empresa.');
        }
    }
}
