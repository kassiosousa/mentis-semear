<?php

declare(strict_types=1);

namespace Src\Domain\Entities;

use DateTimeImmutable;

/**
 * Pure domain entity. Framework-agnostic: no Eloquent, no Laravel.
 * Represents a "semente" (a thought/idea planted in the mind).
 */
final class Seed
{
    public function __construct(
        private ?int $id,
        private string $title,
        private string $content,
        private ?DateTimeImmutable $plantedAt = null,
    ) {
        $this->assertTitle($title);
        $this->assertContent($content);
        $this->plantedAt ??= new DateTimeImmutable();
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function title(): string
    {
        return $this->title;
    }

    public function content(): string
    {
        return $this->content;
    }

    public function plantedAt(): DateTimeImmutable
    {
        return $this->plantedAt;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'planted_at' => $this->plantedAt->format(DATE_ATOM),
        ];
    }

    private function assertTitle(string $title): void
    {
        if (trim($title) === '') {
            throw new \InvalidArgumentException('Seed title cannot be empty.');
        }
    }

    private function assertContent(string $content): void
    {
        if (trim($content) === '') {
            throw new \InvalidArgumentException('Seed content cannot be empty.');
        }
    }
}
