<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'DiaryEvidence',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'diary_id', type: 'integer', example: 1),
        new OA\Property(property: 'user_creator_id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'link', type: 'string', example: 'https://drive.google.com/file/abc'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class DiaryEvidenceSchema {}
