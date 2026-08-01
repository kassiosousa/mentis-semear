<?php

declare(strict_types=1);

namespace Src\Domain\Exceptions;

use RuntimeException;

final class SeedNotFoundException extends RuntimeException
{
    public static function withId(int $id): self
    {
        return new self("Seed with id [{$id}] was not found.");
    }
}
