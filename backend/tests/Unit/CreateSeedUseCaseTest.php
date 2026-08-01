<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use Src\Application\DTOs\CreateSeedDTO;
use Src\Application\UseCases\CreateSeedUseCase;
use Src\Domain\Entities\Seed;
use Src\Domain\Repositories\SeedRepositoryInterface;

/**
 * The use case is exercised with a pure in-memory fake — no Laravel, no MySQL.
 * This is the payoff of Clean Architecture: the core logic is testable in isolation.
 */
final class CreateSeedUseCaseTest extends TestCase
{
    public function test_it_persists_a_seed_through_the_repository(): void
    {
        $repository = new InMemorySeedRepository();
        $useCase = new CreateSeedUseCase($repository);

        $seed = $useCase->execute(new CreateSeedDTO('Ideia', 'Conteúdo da semente'));

        $this->assertSame(1, $seed->id());
        $this->assertSame('Ideia', $seed->title());
        $this->assertCount(1, $repository->all());
    }

    public function test_it_rejects_an_empty_title(): void
    {
        $useCase = new CreateSeedUseCase(new InMemorySeedRepository());

        $this->expectException(\InvalidArgumentException::class);

        $useCase->execute(new CreateSeedDTO('   ', 'Conteúdo'));
    }
}
