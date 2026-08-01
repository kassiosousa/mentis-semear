<?php

declare(strict_types=1);

namespace Tests\Unit;

use Src\Domain\Entities\Seed;
use Src\Domain\Repositories\SeedRepositoryInterface;

/**
 * Test double: a fully in-memory implementation of the domain contract,
 * used to exercise use cases without touching the database.
 */
final class InMemorySeedRepository implements SeedRepositoryInterface
{
    /** @var Seed[] */
    private array $items = [];

    private int $nextId = 1;

    public function all(): array
    {
        return array_values($this->items);
    }

    public function findById(int $id): ?Seed
    {
        return $this->items[$id] ?? null;
    }

    public function save(Seed $seed): Seed
    {
        $stored = new Seed($this->nextId, $seed->title(), $seed->content(), $seed->plantedAt());
        $this->items[$this->nextId] = $stored;
        $this->nextId++;

        return $stored;
    }

    public function delete(int $id): void
    {
        unset($this->items[$id]);
    }
}
