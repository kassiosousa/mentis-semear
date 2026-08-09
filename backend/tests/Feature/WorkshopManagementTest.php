<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

final class WorkshopManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    private function company(): Company
    {
        return Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);
    }

    /** @return array<string, mixed> */
    private function payload(Company $company, ?User $facilitator = null): array
    {
        return [
            'company_id' => $company->id,
            'user_facilitator_id' => $facilitator?->id,
            'datetime' => '2026-09-01 14:00:00',
            'address' => 'Auditório',
            'checkin_link' => 'https://ex.com/checkin/abc',
            'assessment_link' => 'https://ex.com/aval/abc',
        ];
    }

    public function test_guests_cannot_list_workshops(): void
    {
        $this->getJson('/api/workshops')->assertUnauthorized();
    }

    public function test_facilitador_cannot_list_workshops(): void
    {
        $token = $this->tokenFor(User::factory()->create(['type' => UserType::Facilitador]));
        $this->withToken($token)->getJson('/api/workshops')->assertForbidden();
    }

    public function test_usuario_padrao_can_create_a_workshop(): void
    {
        $usuario = User::factory()->create(); // type = usuario
        $company = $this->company();

        $this->withToken($this->tokenFor($usuario))
            ->postJson('/api/workshops', $this->payload($company))
            ->assertCreated()
            ->assertJsonPath('data.user_creator_id', $usuario->id);
    }

    public function test_admin_can_list_workshops(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->getJson('/api/workshops')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    }

    public function test_admin_can_create_a_workshop_and_becomes_the_creator(): void
    {
        $admin = User::factory()->admin()->create();
        $facilitator = User::factory()->create();
        $company = $this->company();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/workshops', $this->payload($company, $facilitator))
            ->assertCreated()
            ->assertJsonPath('data.company_id', $company->id)
            ->assertJsonPath('data.user_creator_id', $admin->id)          // creator = usuário autenticado
            ->assertJsonPath('data.user_facilitator_id', $facilitator->id);
    }

    public function test_create_rejects_a_non_existent_company(): void
    {
        $admin = User::factory()->admin()->create();
        $company = $this->company();

        $payload = $this->payload($company);
        $payload['company_id'] = 999999;

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/workshops', $payload)
            ->assertStatus(422);
    }

    public function test_admin_can_update_a_workshop(): void
    {
        $admin = User::factory()->admin()->create();
        $company = $this->company();
        $workshop = Workshop::create([...$this->payload($company), 'user_creator_id' => $admin->id]);

        $this->withToken($this->tokenFor($admin))
            ->putJson("/api/workshops/{$workshop->id}", ['address' => 'Novo local'])
            ->assertOk()
            ->assertJsonPath('data.address', 'Novo local');
    }

    public function test_admin_can_delete_a_workshop(): void
    {
        $admin = User::factory()->admin()->create();
        $company = $this->company();
        $workshop = Workshop::create([...$this->payload($company), 'user_creator_id' => $admin->id]);

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/workshops/{$workshop->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('workshops', ['id' => $workshop->id]);
    }

    public function test_workshop_creation_aborts_after_5_token_collisions(): void
    {
        $admin = User::factory()->admin()->create();
        $company = $this->company();

        // Força Str::random a sempre devolver o mesmo token → colisão garantida.
        Str::createRandomStringsUsing(fn () => 'COLLISION01');

        // Primeiro workshop ocupa o token.
        Workshop::create([...$this->payload($company), 'user_creator_id' => $admin->id]);

        // Segundo: 5 tentativas, todas colidem → 500 e nada gravado.
        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/workshops', $this->payload($company))
            ->assertStatus(500)
            ->assertJsonPath('message', 'Não foi possível criar o workshop: falha ao gerar um token único. Tente novamente.');

        Str::createRandomStringsNormally();

        // A operação foi cancelada por completo: só o primeiro workshop existe.
        $this->assertSame(1, Workshop::count());
    }

    public function test_workshop_creation_retries_and_succeeds_on_token_collision(): void
    {
        $admin = User::factory()->admin()->create();
        $company = $this->company();

        // Colide nas 2 primeiras tentativas e libera na 3ª → criação bem-sucedida.
        $tokens = ['DUPLICATE01', 'DUPLICATE01', 'DUPLICATE01', 'UNIQUE99999'];
        $i = 0;
        Str::createRandomStringsUsing(function () use (&$i, $tokens) {
            return $tokens[min($i++, count($tokens) - 1)];
        });

        // Ocupa 'DUPLICATE01'.
        Workshop::create([...$this->payload($company), 'user_creator_id' => $admin->id]);

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/workshops', $this->payload($company))
            ->assertCreated()
            ->assertJsonPath('data.token', 'UNIQUE99999');

        Str::createRandomStringsNormally();

        $this->assertSame(2, Workshop::count());
    }
}
