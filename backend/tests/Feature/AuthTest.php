<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_a_user_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Kassio',
            'email' => 'kassio@example.com',
            'password' => 'senha1234',
            'password_confirmation' => 'senha1234',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['access_token', 'token_type', 'expires_in', 'user' => ['id', 'name', 'type', 'email']])
            ->assertJsonPath('user.type', 'usuario');

        $this->assertDatabaseHas('users', ['email' => 'kassio@example.com', 'type' => 'usuario']);
        // Password must never be returned or stored in plain text.
        $response->assertJsonMissingPath('user.password');
    }

    public function test_login_returns_a_token_for_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'kassio@example.com',
            'password' => 'senha1234',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'kassio@example.com',
            'password' => 'senha1234',
        ])->assertOk()->assertJsonStructure(['access_token']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'kassio@example.com', 'password' => 'senha1234']);

        $this->postJson('/api/auth/login', [
            'email' => 'kassio@example.com',
            'password' => 'errada',
        ])->assertUnauthorized();
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = auth('api')->login($user);

        $this->getJson('/api/auth/me', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }
}
