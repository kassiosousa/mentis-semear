<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'Workshop',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'company_id', type: 'integer', example: 1),
        new OA\Property(property: 'user_creator_id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'user_facilitator_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'datetime', type: 'string', format: 'date-time', example: '2026-09-01T14:00:00Z'),
        new OA\Property(property: 'address', type: 'string', example: 'Auditório - Matriz'),
        new OA\Property(property: 'checkin_link', type: 'string', example: 'https://mentis.kassiosousa.com.br/checkin/abc'),
        new OA\Property(property: 'assessment_link', type: 'string', example: 'https://mentis.kassiosousa.com.br/avaliacao/abc'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class WorkshopSchema {}
