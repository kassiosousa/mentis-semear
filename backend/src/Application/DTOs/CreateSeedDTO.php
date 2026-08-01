<?php

declare(strict_types=1);

namespace Src\Application\DTOs;

/**
 * Immutable input boundary for the CreateSeed use case.
 * Decouples the Application layer from HTTP request shapes.
 */
final class CreateSeedDTO
{
    public function __construct(
        public readonly string $title,
        public readonly string $content,
    ) {
    }

    /** @param array<string, mixed> $data */
    public static function fromArray(array $data): self
    {
        return new self(
            title: (string) ($data['title'] ?? ''),
            content: (string) ($data['content'] ?? ''),
        );
    }
}
