<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'Assessment',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
        new OA\Property(property: 'score', type: 'integer', minimum: 0, maximum: 10, example: 9),
        new OA\Property(property: 'suggestions', type: 'string', nullable: true, example: 'Muito bom!'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class AssessmentSchema {}
