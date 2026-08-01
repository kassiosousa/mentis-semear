<?php

declare(strict_types=1);

namespace Src\Domain\Repositories;

use Src\Domain\Entities\Seed;

/**
 * Repository contract owned by the Domain layer.
 * The Infrastructure layer provides the concrete implementation.
 */
interface SeedRepositoryInterface
{
    /** @return Seed[] */
    public function all(): array;

    public function findById(int $id): ?Seed;

    public function save(Seed $seed): Seed;

    public function delete(int $id): void;
}
