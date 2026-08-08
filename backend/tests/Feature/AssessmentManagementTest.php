<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AssessmentManagementTest extends TestCase
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

    public function test_guests_cannot_list_assessments(): void
    {
        $this->getJson('/api/assessments')->assertUnauthorized();
    }

    public function test_facilitador_cannot_list_assessments(): void
    {
        $token = $this->tokenFor(User::factory()->create(['type' => UserType::Facilitador]));
        $this->withToken($token)->getJson('/api/assessments')->assertForbidden();
    }

    public function test_usuario_can_create_an_anonymous_assessment(): void
    {
        $usuario = User::factory()->create();
        $workshop = $this->workshop();

        $this->withToken($this->tokenFor($usuario))
            ->postJson('/api/assessments', ['workshop_id' => $workshop->id, 'score' => 9, 'suggestions' => 'Muito bom'])
            ->assertCreated()
            ->assertJsonPath('data.score', 9);

        $this->assertDatabaseHas('assessments', ['workshop_id' => $workshop->id, 'score' => 9]);
    }

    public function test_score_must_be_between_0_and_10(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/assessments', ['workshop_id' => $workshop->id, 'score' => 11])
            ->assertStatus(422);
    }

    public function test_create_rejects_a_non_existent_workshop(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/assessments', ['workshop_id' => 999999, 'score' => 5])
            ->assertStatus(422);
    }

    public function test_admin_can_update_and_delete_an_assessment(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();
        $created = $this->withToken($this->tokenFor($admin))
            ->postJson('/api/assessments', ['workshop_id' => $workshop->id, 'score' => 5])
            ->json('data.id');

        $this->withToken($this->tokenFor($admin))
            ->putJson("/api/assessments/{$created}", ['score' => 8])
            ->assertOk()
            ->assertJsonPath('data.score', 8);

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/assessments/{$created}")
            ->assertNoContent();
    }
}
