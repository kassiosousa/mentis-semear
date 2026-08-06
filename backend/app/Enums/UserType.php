<?php

declare(strict_types=1);

namespace App\Enums;

enum UserType: string
{
    case Admin = 'admin';
    case Usuario = 'usuario';
    case Facilitador = 'facilitador';
    case Empresa = 'empresa';

    /** @return string[] */
    public static function values(): array
    {
        return array_map(fn (self $type): string => $type->value, self::cases());
    }
}
