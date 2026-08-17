<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\CheckIn;
use App\Models\Company;
use App\Models\MoodEntry;
use App\Models\Sector;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Relatórios (somente leitura). Cada endpoint devolve `summary` (agregado p/ gráfico)
 * e, quando faz sentido, `items` (lista paginada, base para exportação).
 *
 * Filtros comuns: date_from/date_to (dia) e time_from/time_to (hora) — aplicados ao
 * `created_at` (horário do registro). Escopo por perfil: empresa vê só a própria.
 */
final class ReportController extends Controller
{
    #[OA\Get(
        path: '/api/reports/workshops',
        summary: 'Relatório de workshops (filtros: empresa, período, hora, facilitador, avaliação, diário)',
        security: [['bearerAuth' => []]],
        tags: ['Reports'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'facilitator_id', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'uuid')),
            new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'time_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', example: '14:00')),
            new OA\Parameter(name: 'time_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', example: '18:00')),
            new OA\Parameter(name: 'min_score', in: 'query', required: false, schema: new OA\Schema(type: 'number')),
            new OA\Parameter(name: 'max_score', in: 'query', required: false, schema: new OA\Schema(type: 'number')),
            new OA\Parameter(name: 'has_diary', in: 'query', required: false, schema: new OA\Schema(type: 'boolean')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'summary + items (paginado)'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function workshops(Request $request): JsonResponse
    {
        $scope = $this->companyScope($request);

        $base = Workshop::query()
            ->when($scope, fn ($q) => $q->where('company_id', $scope))
            ->when($request->filled('facilitator_id'), fn ($q) => $q->where('user_facilitator_id', $request->query('facilitator_id')))
            // (float) garante literal numérico — evita a afinidade texto do SQLite e é injection-safe.
            ->when($request->filled('min_score'), fn ($q) => $q->whereRaw('(select avg(score) from assessments where assessments.workshop_id = workshops.id) >= '.(float) $request->query('min_score')))
            ->when($request->filled('max_score'), fn ($q) => $q->whereRaw('(select avg(score) from assessments where assessments.workshop_id = workshops.id) <= '.(float) $request->query('max_score')));

        $this->applyPeriod($base, $request);

        if ($request->has('has_diary')) {
            $request->boolean('has_diary') ? $base->whereHas('diary') : $base->whereDoesntHave('diary');
        }

        $items = (clone $base)
            ->with(['company:id,name', 'facilitator:id,name'])
            ->withCount(['checkIns', 'assessments'])
            ->withAvg('assessments', 'score')
            ->orderByDesc('datetime')
            ->paginate($this->perPage($request))
            ->through(fn (Workshop $w) => [
                'id' => $w->id,
                'datetime' => $w->datetime,
                'company' => $w->company?->name,
                'facilitator' => $w->facilitator?->name,
                'address' => $w->address,
                'check_ins' => $w->check_ins_count,
                'assessments' => $w->assessments_count,
                'avg_score' => $this->round($w->assessments_avg_score),
                'created_at' => $w->created_at,
            ]);

        $idSub = (clone $base)->select('id');
        $summary = [
            'total_workshops' => (clone $base)->count(),
            'total_check_ins' => CheckIn::whereIn('workshop_id', (clone $idSub))->count(),
            'avg_score_geral' => $this->round(Assessment::whereIn('workshop_id', (clone $idSub))->avg('score')),
        ];

        return response()->json(['summary' => $summary, 'items' => $items]);
    }

    #[OA\Get(
        path: '/api/reports/mood',
        summary: 'Relatório do termômetro emocional (empresa vê a sua; admin todas). Filtros: período, hora, setor',
        security: [['bearerAuth' => []]],
        tags: ['Reports'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, description: 'apenas admin', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'sector_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'time_from', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'time_to', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'summary (total, média, distribuição, por setor, tendência) + items'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function mood(Request $request): JsonResponse
    {
        $scope = $this->companyScope($request);

        $base = MoodEntry::query()
            ->when($scope, fn ($q) => $q->where('company_id', $scope))
            ->when($request->filled('sector_id'), fn ($q) => $q->where('sector_id', $request->query('sector_id')));
        $this->applyPeriod($base, $request);

        $summary = $this->moodSummary($base);
        $summary['trend'] = (clone $base)
            ->selectRaw('date(created_at) as date, count(*) as total, round(avg(mood), 2) as average')
            ->groupByRaw('date(created_at)')
            ->orderByRaw('date(created_at)')
            ->get()
            ->map(fn ($r) => ['date' => $r->date, 'total' => (int) $r->total, 'average' => (float) $r->average]);

        $items = (clone $base)
            ->orderByDesc('created_at')
            ->paginate($this->perPage($request))
            ->through(fn (MoodEntry $m) => [
                'id' => $m->id,
                'company_id' => $m->company_id,
                'sector_id' => $m->sector_id,
                'mood' => $m->mood,
                'created_at' => $m->created_at,
            ]);

        return response()->json(['summary' => $summary, 'items' => $items]);
    }

    #[OA\Get(
        path: '/api/reports/companies-overview',
        summary: 'Relatório quantitativo: workshops, check-ins e avaliação média por empresa (para gráfico)',
        security: [['bearerAuth' => []]],
        tags: ['Reports'],
        parameters: [
            new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'time_from', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'time_to', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'summary + items (uma linha por empresa)'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function companiesOverview(Request $request): JsonResponse
    {
        $items = Company::query()
            ->orderBy('name')
            ->paginate($this->perPage($request))
            ->through(function (Company $c) use ($request) {
                $workshopIds = $this->applyPeriod($c->workshops(), $request)->pluck('id');
                $avg = Assessment::whereIn('workshop_id', $workshopIds)->avg('score');

                return [
                    'company_id' => $c->id,
                    'company' => $c->name,
                    'workshops' => $workshopIds->count(),
                    'check_ins' => CheckIn::whereIn('workshop_id', $workshopIds)->count(),
                    'avg_score' => $this->round($avg),
                ];
            });

        $workshopIdsAll = $this->applyPeriod(Workshop::query(), $request)->pluck('id');
        $summary = [
            'total_companies' => Company::count(),
            'total_workshops' => $workshopIdsAll->count(),
            'total_check_ins' => CheckIn::whereIn('workshop_id', $workshopIdsAll)->count(),
            'avg_score_geral' => $this->round(Assessment::whereIn('workshop_id', $workshopIdsAll)->avg('score')),
        ];

        return response()->json(['summary' => $summary, 'items' => $items]);
    }

    #[OA\Get(
        path: '/api/reports/check-ins',
        summary: 'Relatório de participação (demografia: setor, gênero, faixa etária, consentimento LGPD)',
        security: [['bearerAuth' => []]],
        tags: ['Reports'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'workshop_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'sector_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'summary (demografia) + items (sem CPF/e-mail)'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function checkIns(Request $request): JsonResponse
    {
        $scope = $this->companyScope($request);

        $base = CheckIn::query()
            ->when($scope, fn ($q) => $q->whereHas('workshop', fn ($w) => $w->where('company_id', $scope)))
            ->when($request->filled('workshop_id'), fn ($q) => $q->where('workshop_id', $request->query('workshop_id')))
            ->when($request->filled('sector_id'), fn ($q) => $q->where('sector_id', $request->query('sector_id')));
        $this->applyPeriod($base, $request);

        $total = (clone $base)->count();

        $bySector = (clone $base)->selectRaw('sector_id, count(*) as total')->groupBy('sector_id')->get();
        $names = Sector::whereIn('id', $bySector->pluck('sector_id')->filter())->pluck('name', 'id');

        // Faixas etárias calculadas em PHP (portável entre MySQL/SQLite).
        $brackets = ['<25' => 0, '25-34' => 0, '35-44' => 0, '45-54' => 0, '55+' => 0];
        foreach ((clone $base)->pluck('birthday') as $birthday) {
            $age = $birthday?->age ?? 0;
            $key = match (true) {
                $age < 25 => '<25',
                $age < 35 => '25-34',
                $age < 45 => '35-44',
                $age < 55 => '45-54',
                default => '55+',
            };
            $brackets[$key]++;
        }

        $lgpdYes = (clone $base)->where('lgpd_read', true)->count();

        $summary = [
            'total' => $total,
            'by_sector' => $bySector->map(fn ($r) => [
                'sector_id' => $r->sector_id,
                'sector' => $r->sector_id ? ($names[$r->sector_id] ?? null) : 'Sem setor',
                'total' => (int) $r->total,
            ])->values(),
            'by_gender' => (clone $base)->selectRaw('gender, count(*) as total')->groupBy('gender')->pluck('total', 'gender'),
            'by_age' => $brackets,
            'lgpd_consent_rate' => $total > 0 ? $this->round($lgpdYes / $total * 100) : null,
        ];

        $items = (clone $base)
            ->orderByDesc('created_at')
            ->paginate($this->perPage($request))
            ->through(fn (CheckIn $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'position' => $c->position,
                'sector_id' => $c->sector_id,
                'gender' => $c->gender,
                'workshop_id' => $c->workshop_id,
                'created_at' => $c->created_at,
            ]);

        return response()->json(['summary' => $summary, 'items' => $items]);
    }

    #[OA\Get(
        path: '/api/reports/assessments',
        summary: 'Relatório de satisfação (média, histograma 0–10, NPS, tendência)',
        security: [['bearerAuth' => []]],
        tags: ['Reports'],
        parameters: [
            new OA\Parameter(name: 'company_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'workshop_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'summary (média, histograma, NPS, tendência) + items'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso restrito ao perfil'),
        ],
    )]
    public function assessments(Request $request): JsonResponse
    {
        $scope = $this->companyScope($request);

        $base = Assessment::query()
            ->when($scope, fn ($q) => $q->whereHas('workshop', fn ($w) => $w->where('company_id', $scope)))
            ->when($request->filled('workshop_id'), fn ($q) => $q->where('workshop_id', $request->query('workshop_id')));
        $this->applyPeriod($base, $request);

        $total = (clone $base)->count();
        $counts = (clone $base)->selectRaw('score, count(*) as c')->groupBy('score')->pluck('c', 'score');

        $histogram = [];
        foreach (range(0, 10) as $s) {
            $histogram[(string) $s] = (int) ($counts[$s] ?? 0);
        }

        // NPS: promotores 9–10, neutros 7–8, detratores 0–6.
        $promoters = (clone $base)->where('score', '>=', 9)->count();
        $detractors = (clone $base)->where('score', '<=', 6)->count();
        $nps = $total > 0 ? $this->round(($promoters - $detractors) / $total * 100) : null;

        $summary = [
            'total' => $total,
            'average' => $this->round((clone $base)->avg('score')),
            'histogram' => $histogram,
            'nps' => [
                'promoters' => $promoters,
                'passives' => $total - $promoters - $detractors,
                'detractors' => $detractors,
                'score' => $nps,
            ],
            'trend' => (clone $base)
                ->selectRaw('date(created_at) as date, count(*) as total, round(avg(score), 2) as average')
                ->groupByRaw('date(created_at)')
                ->orderByRaw('date(created_at)')
                ->get()
                ->map(fn ($r) => ['date' => $r->date, 'total' => (int) $r->total, 'average' => (float) $r->average]),
        ];

        $items = (clone $base)
            ->orderByDesc('created_at')
            ->paginate($this->perPage($request))
            ->through(fn (Assessment $a) => [
                'id' => $a->id,
                'workshop_id' => $a->workshop_id,
                'score' => $a->score,
                'suggestions' => $a->suggestions,
                'created_at' => $a->created_at,
            ]);

        return response()->json(['summary' => $summary, 'items' => $items]);
    }

    #[OA\Get(
        path: '/api/reports/company/{company}',
        summary: 'Painel consolidado da empresa (workshops + alcance + satisfação + termômetro)',
        description: 'Empresa acessa apenas a própria; admin acessa qualquer uma.',
        security: [['bearerAuth' => []]],
        tags: ['Reports'],
        parameters: [new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Painel consolidado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Empresa de outro dono'),
            new OA\Response(response: 404, description: 'Não encontrada'),
        ],
    )]
    public function companyPanel(Company $company): JsonResponse
    {
        $user = $this->currentUser();
        if ($user->type === UserType::Empresa && $company->id !== $user->company_id) {
            abort(403, 'Empresa não pertence ao seu acesso.');
        }

        $workshopIds = $company->workshops()->pluck('id');

        return response()->json(['data' => [
            'company' => ['id' => $company->id, 'name' => $company->name],
            'workshops' => $workshopIds->count(),
            'check_ins' => CheckIn::whereIn('workshop_id', $workshopIds)->count(),
            'satisfaction' => [
                'total' => Assessment::whereIn('workshop_id', $workshopIds)->count(),
                'average' => $this->round(Assessment::whereIn('workshop_id', $workshopIds)->avg('score')),
            ],
            'mood' => $this->moodSummary(MoodEntry::where('company_id', $company->id)),
        ]]);
    }

    // ---- Helpers ----

    /** Resumo do termômetro (total, média, distribuição 1–5, por setor). $query = Eloquent Builder. */
    private function moodSummary($query): array
    {
        $total = (clone $query)->count();
        $counts = (clone $query)->selectRaw('mood, count(*) as c')->groupBy('mood')->pluck('c', 'mood');

        $distribution = [];
        foreach (range(1, 5) as $m) {
            $distribution[(string) $m] = (int) ($counts[$m] ?? 0);
        }

        $bySector = (clone $query)
            ->selectRaw('sector_id, count(*) as total, round(avg(mood), 2) as average')
            ->groupBy('sector_id')
            ->get();
        $names = Sector::whereIn('id', $bySector->pluck('sector_id')->filter())->pluck('name', 'id');

        return [
            'total' => $total,
            'average' => $total > 0 ? $this->round((clone $query)->avg('mood')) : null,
            'distribution' => $distribution,
            'by_sector' => $bySector->map(fn ($r) => [
                'sector_id' => $r->sector_id,
                'sector' => $r->sector_id ? ($names[$r->sector_id] ?? null) : 'Sem setor',
                'total' => (int) $r->total,
                'average' => (float) $r->average,
            ])->values(),
        ];
    }

    /** Aplica os filtros de período (dia) e hora sobre created_at. $query = Builder ou Relation. */
    private function applyPeriod($query, Request $request, string $col = 'created_at')
    {
        return $query
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate($col, '>=', $request->query('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate($col, '<=', $request->query('date_to')))
            ->when($request->filled('time_from'), fn ($q) => $q->whereTime($col, '>=', $request->query('time_from')))
            ->when($request->filled('time_to'), fn ($q) => $q->whereTime($col, '<=', $request->query('time_to')));
    }

    /** Empresa efetiva do relatório: própria (usuário empresa) ou filtro opcional (admin/usuário). */
    private function companyScope(Request $request): ?int
    {
        $user = $this->currentUser();

        if ($user->type === UserType::Empresa) {
            return $user->company_id;
        }

        return $request->filled('company_id') ? (int) $request->query('company_id') : null;
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 25), 100));
    }

    private function round(float|int|string|null $value): ?float
    {
        return $value === null ? null : round((float) $value, 2);
    }

    private function currentUser(): User
    {
        /** @var User $user */
        $user = auth('api')->user();

        return $user;
    }
}
