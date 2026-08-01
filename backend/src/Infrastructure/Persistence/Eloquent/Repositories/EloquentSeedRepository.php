<?php

declare(strict_types=1);

namespace Src\Infrastructure\Persistence\Eloquent\Repositories;

use DateTimeImmutable;
use Src\Domain\Entities\Seed;
use Src\Domain\Exceptions\SeedNotFoundException;
use Src\Domain\Repositories\SeedRepositoryInterface;
use Src\Infrastructure\Persistence\Eloquent\Models\SeedModel;

/**
 * Concrete repository. Translates between the Eloquent model and the
 * pure domain entity, keeping persistence details out of the Domain layer.
 */
final class EloquentSeedRepository implements SeedRepositoryInterface
{
    /** @return Seed[] */
    public function all(): array
    {
        return SeedModel::query()
            ->orderByDesc('planted_at')
            ->get()
            ->map(fn (SeedModel $model): Seed => $this->toEntity($model))
            ->all();
    }

    public function findById(int $id): ?Seed
    {
        $model = SeedModel::query()->find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function save(Seed $seed): Seed
    {
        $model = $seed->id() !== null
            ? SeedModel::query()->findOrFail($seed->id())
            : new SeedModel();

        $model->title = $seed->title();
        $model->content = $seed->content();
        $model->planted_at = $seed->plantedAt()->format('Y-m-d H:i:s');
        $model->save();

        return $this->toEntity($model->refresh());
    }

    public function delete(int $id): void
    {
        $deleted = SeedModel::query()->where('id', $id)->delete();

        if ($deleted === 0) {
            throw SeedNotFoundException::withId($id);
        }
    }

    private function toEntity(SeedModel $model): Seed
    {
        return new Seed(
            id: $model->id,
            title: $model->title,
            content: $model->content,
            plantedAt: new DateTimeImmutable($model->planted_at->toDateTimeString()),
        );
    }
}
