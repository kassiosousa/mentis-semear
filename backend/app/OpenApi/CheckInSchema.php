<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'CheckIn',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'workshop_id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'João Participante'),
        new OA\Property(property: 'position', type: 'string', example: 'Analista'),
        new OA\Property(property: 'sector', type: 'string', example: 'TI'),
        new OA\Property(property: 'lgpd_read', type: 'boolean', example: true),
        new OA\Property(property: 'lgpd_consent_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'cpf', type: 'string', example: '12345678901'),
        new OA\Property(property: 'birthday', type: 'string', format: 'date', example: '1990-05-20'),
        new OA\Property(property: 'gender', type: 'string', example: 'M'),
        new OA\Property(property: 'celphone', type: 'string', example: '11999999999'),
        new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class CheckInSchema {}
