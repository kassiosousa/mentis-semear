<?php

declare(strict_types=1);

namespace Src\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use Src\Domain\Repositories\SeedRepositoryInterface;
use Src\Infrastructure\Persistence\Eloquent\Repositories\EloquentSeedRepository;

/**
 * Wires Domain contracts to their Infrastructure implementations.
 * This is the composition root for the Dependency Inversion Principle:
 * inner layers depend on interfaces, this provider supplies concretes.
 */
final class RepositoryServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    public array $bindings = [
        SeedRepositoryInterface::class => EloquentSeedRepository::class,
    ];
}
