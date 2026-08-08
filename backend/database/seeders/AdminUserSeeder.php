<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Cria (ou atualiza) o usuário admin padrão.
     * Idempotente: rodar várias vezes não duplica.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@mentis.com'],
            [
                'name' => 'Admin',
                'type' => UserType::Admin,
                'password' => 'senha@123', // cast 'hashed' no model criptografa
            ],
        );
    }
}
