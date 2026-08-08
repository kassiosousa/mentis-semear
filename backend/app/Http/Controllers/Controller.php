<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Mentis Semear API',
    description: 'API do monólito Mentis Semear (autenticação JWT, workshops, check-ins, avaliações e diário).',
)]
#[OA\Server(url: '/', description: 'Mesma origem (dev e produção)')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Envie o token no header: Authorization: Bearer {token}',
)]
abstract class Controller
{
    //
}
