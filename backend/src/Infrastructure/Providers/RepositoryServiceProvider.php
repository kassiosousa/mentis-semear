<?php

declare(strict_types=1);

namespace Src\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Wires Domain contracts to their Infrastructure implementations.
 * This is the composition root for the Dependency Inversion Principle:
 * inner layers depend on interfaces, this provider supplies concretes.
 *
 * Add repository bindings here, e.g.:
 *   WorkshopRepositoryInterface::class => EloquentWorkshopRepository::class,
 *
 * @var array<class-string, class-string>
 */
final class RepositoryServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    public array $bindings = [];
}
