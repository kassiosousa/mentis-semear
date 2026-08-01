<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSeedRequest;
use Illuminate\Http\JsonResponse;
use Src\Application\DTOs\CreateSeedDTO;
use Src\Application\UseCases\CreateSeedUseCase;
use Src\Application\UseCases\ListSeedsUseCase;

/**
 * Presentation adapter. Translates HTTP <-> Application use cases.
 * Holds no business logic — it only orchestrates use cases and shapes JSON.
 */
final class SeedController extends Controller
{
    public function index(ListSeedsUseCase $listSeeds): JsonResponse
    {
        $seeds = array_map(
            fn ($seed) => $seed->toArray(),
            $listSeeds->execute(),
        );

        return response()->json(['data' => $seeds]);
    }

    public function store(StoreSeedRequest $request, CreateSeedUseCase $createSeed): JsonResponse
    {
        $seed = $createSeed->execute(
            CreateSeedDTO::fromArray($request->validated()),
        );

        return response()->json(['data' => $seed->toArray()], 201);
    }
}
