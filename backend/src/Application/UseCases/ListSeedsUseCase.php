<?php

declare(strict_types=1);

namespace Src\Application\UseCases;

use Src\Domain\Entities\Seed;
use Src\Domain\Repositories\SeedRepositoryInterface;

final class ListSeedsUseCase
{
    public function __construct(
        private readonly SeedRepositoryInterface $seeds,
    ) {
    }

    /** @return Seed[] */
    public function execute(): array
    {
        return $this->seeds->all();
    }
}
