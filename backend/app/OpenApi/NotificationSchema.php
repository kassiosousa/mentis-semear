<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI schema only — never instantiated. */
#[OA\Schema(
    schema: 'Notification',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'string', format: 'uuid', nullable: true, description: 'Destinatário específico (ou null se for por tipo)'),
        new OA\Property(property: 'user_type', type: 'string', nullable: true, enum: ['admin', 'usuario', 'facilitador', 'empresa'], description: 'Tipo destinatário (ou null se for usuário específico)'),
        new OA\Property(property: 'title', type: 'string', example: 'Nova oficina'),
        new OA\Property(property: 'message', type: 'string', example: 'Oficina criada.'),
        new OA\Property(property: 'event', type: 'string', nullable: true, example: 'workshop.created'),
        new OA\Property(property: 'status', type: 'string', enum: ['new', 'read'], example: 'new'),
        new OA\Property(property: 'read_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
final class NotificationSchema {}
