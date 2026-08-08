<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'User',
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid', example: '019fd761-bae3-716c-91d3-bb073c2e4c3f'),
        new OA\Property(property: 'name', type: 'string', example: 'Kassio'),
        new OA\Property(property: 'type', type: 'string', enum: ['admin', 'usuario', 'facilitador', 'empresa'], example: 'usuario'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'kassio@example.com'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class UserSchema {}
