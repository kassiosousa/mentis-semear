<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'Company',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'token', type: 'string', example: 'aB3xK9pQ2mL', description: 'Token público (usado no link do termômetro)'),
        new OA\Property(property: 'name', type: 'string', example: 'ACME Ltda'),
        new OA\Property(property: 'address', type: 'string', example: 'Rua das Flores, 123'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'contato@acme.com'),
        new OA\Property(property: 'thermometer_link', type: 'string', example: 'https://mentis.kassiosousa.com.br/termometro/aB3xK9pQ2mL', description: 'Link público do termômetro emocional (derivado do token)'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class CompanySchema {}
