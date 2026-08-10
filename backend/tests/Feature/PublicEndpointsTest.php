<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class PublicEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private function workshop(): Workshop
    {
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);

        // checkin_link/assessment_link são gerados no backend a partir do token.
        return Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L',
        ]);
    }

    /** @return array<string, mixed> */
    private function checkInPayload(Workshop $w, string $cpf = '12345678901'): array
    {
        return [
            'workshop_id' => $w->id, 'name' => 'Participante', 'position' => 'Analista', 'sector' => 'TI',
            'lgpd_read' => true, 'cpf' => $cpf, 'birthday' => '1990-01-01', 'gender' => 'M', 'celphone' => '11999999999',
        ];
    }

    public function test_public_checkin_works_without_authentication(): void
    {
        $workshop = $this->workshop();

        $this->postJson('/api/public/check-ins', $this->checkInPayload($workshop))
            ->assertCreated()
            ->assertJsonPath('data.workshop_id', $workshop->id)
            ->assertJsonPath('data.name', 'Participante');

        // Consentimento LGPD é registrado com timestamp.
        $this->assertNotNull($workshop->checkIns()->first()->lgpd_consent_at);
    }

    public function test_public_checkin_rejects_duplicate_cpf_in_same_workshop(): void
    {
        $workshop = $this->workshop();
        $this->postJson('/api/public/check-ins', $this->checkInPayload($workshop))->assertCreated();

        $this->postJson('/api/public/check-ins', $this->checkInPayload($workshop))->assertStatus(422);
    }

    public function test_public_assessment_works_without_authentication(): void
    {
        $workshop = $this->workshop();

        $this->postJson('/api/public/assessments', ['workshop_id' => $workshop->id, 'score' => 9, 'suggestions' => 'Ótimo'])
            ->assertCreated()
            ->assertJsonPath('data.score', 9);
    }

    public function test_public_assessment_rejects_invalid_score(): void
    {
        $workshop = $this->workshop();

        $this->postJson('/api/public/assessments', ['workshop_id' => $workshop->id, 'score' => 99])
            ->assertStatus(422);
    }

    public function test_workshop_gets_an_auto_generated_token(): void
    {
        $workshop = $this->workshop();

        $this->assertNotEmpty($workshop->token);
    }

    public function test_public_workshop_lookup_by_token_returns_only_public_data(): void
    {
        $workshop = $this->workshop();

        $this->getJson("/api/public/workshops/{$workshop->token}")
            ->assertOk()
            ->assertJsonPath('data.id', $workshop->id)
            ->assertJsonPath('data.address', 'L')
            ->assertJsonPath('data.company', 'ACME')
            // Nunca expõe links internos nem dados de participantes.
            ->assertJsonMissingPath('data.checkin_link')
            ->assertJsonMissingPath('data.user_creator_id');
    }

    public function test_public_workshop_lookup_returns_404_for_unknown_token(): void
    {
        $this->getJson('/api/public/workshops/inexistente')->assertNotFound();
    }
}
