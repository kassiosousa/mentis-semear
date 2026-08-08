<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'Diary',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
        new OA\Property(property: 'user_creator_id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'title', type: 'string', example: 'Relato do dia'),
        new OA\Property(property: 'description', type: 'string', example: 'Como foi a dinâmica...'),
        new OA\Property(property: 'datetime', type: 'string', format: 'date-time'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class DiarySchema {}
