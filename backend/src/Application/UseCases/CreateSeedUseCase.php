<?php

declare(strict_types=1);

namespace Src\Application\UseCases;

use Src\Application\DTOs\CreateSeedDTO;
use Src\Domain\Entities\Seed;
use Src\Domain\Repositories\SeedRepositoryInterface;

final class CreateSeedUseCase
{
    public function __construct(
        private readonly SeedRepositoryInterface $seeds,
    ) {
    }

    public function execute(CreateSeedDTO $dto): Seed
    {
        $seed = new Seed(
            id: null,
            title: $dto->title,
            content: $dto->content,
        );

        return $this->seeds->save($seed);
    }
}
