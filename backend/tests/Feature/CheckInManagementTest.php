<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CheckInManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    private function workshop(): Workshop
    {
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R', 'email' => 'a@ex.com']);

        return Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L', 'checkin_link' => 'c', 'assessment_link' => 'a',
        ]);
    }

    /** @return array<string, mixed> */
    private function payload(Workshop $workshop, string $cpf = '12345678901'): array
    {
        return [
            'workshop_id' => $workshop->id, 'name' => 'João', 'position' => 'Analista', 'sector' => 'TI',
            'lgpd_read' => true, 'cpf' => $cpf, 'birthday' => '1990-05-20', 'gender' => 'M', 'celphone' => '11999999999',
        ];
    }

    public function test_guests_cannot_list_check_ins(): void
    {
        $this->getJson('/api/check-ins')->assertUnauthorized();
    }

    public function test_facilitador_cannot_list_check_ins(): void
    {
        $token = $this->tokenFor(User::factory()->create(['type' => UserType::Facilitador]));
        $this->withToken($token)->getJson('/api/check-ins')->assertForbidden();
    }

    public function test_usuario_can_create_a_check_in_and_records_lgpd_consent(): void
    {
        $usuario = User::factory()->create();
        $workshop = $this->workshop();

        $response = $this->withToken($this->tokenFor($usuario))
            ->postJson('/api/check-ins', $this->payload($workshop))
            ->assertCreated()
            ->assertJsonPath('data.lgpd_read', true);

        // Consentimento LGPD registrado com timestamp.
        $this->assertNotNull($response->json('data.lgpd_consent_at'));
    }

    public function test_same_cpf_cannot_check_in_twice_in_the_same_workshop(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();
        $token = $this->tokenFor($admin);

        $this->withToken($token)->postJson('/api/check-ins', $this->payload($workshop))->assertCreated();
        $this->withToken($token)->postJson('/api/check-ins', $this->payload($workshop))->assertStatus(422);
    }

    public function test_same_cpf_can_check_in_in_different_workshops(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $this->tokenFor($admin);

        $this->withToken($token)->postJson('/api/check-ins', $this->payload($this->workshop()))->assertCreated();
        $this->withToken($token)->postJson('/api/check-ins', $this->payload($this->workshop()))->assertCreated();
    }

    public function test_create_validates_cpf_and_workshop(): void
    {
        $admin = User::factory()->admin()->create();
        $payload = $this->payload($this->workshop(), '123'); // cpf inválido (não tem 11 dígitos)

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/check-ins', $payload)
            ->assertStatus(422);
    }
}
