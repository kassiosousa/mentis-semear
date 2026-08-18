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
        new OA\Property(property: 'file_1', type: 'string', nullable: true, example: 'diaries/abc123.pdf', description: 'Caminho do arquivo 1 no storage'),
        new OA\Property(property: 'file_2', type: 'string', nullable: true),
        new OA\Property(property: 'file_1_url', type: 'string', nullable: true, example: 'https://.../api/diaries/1/files/1', description: 'URL autenticada de download'),
        new OA\Property(property: 'file_2_url', type: 'string', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class DiarySchema {}
