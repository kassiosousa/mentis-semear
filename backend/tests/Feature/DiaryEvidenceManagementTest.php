<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Diary;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DiaryEvidenceManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    private function diary(User $creator): Diary
    {
        $company = Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);
        $workshop = Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L', 'checkin_link' => 'c', 'assessment_link' => 'a',
        ]);

        return Diary::create([
            'workshop_id' => $workshop->id, 'user_creator_id' => $creator->id,
            'title' => 'Dia 1', 'description' => 'x', 'datetime' => now(),
        ]);
    }

    public function test_guests_cannot_list_evidences(): void
    {
        $this->getJson('/api/diary-evidences')->assertUnauthorized();
    }

    public function test_facilitador_has_full_crud_on_evidences(): void
    {
        $facilitador = User::factory()->create(['type' => UserType::Facilitador]);
        $token = $this->tokenFor($facilitador);
        $diary = $this->diary($facilitador);

        // Listar.
        $this->withToken($token)->getJson('/api/diary-evidences')->assertOk();

        // Criar (o facilitador vira o criador).
        $id = $this->withToken($token)
            ->postJson('/api/diary-evidences', ['diary_id' => $diary->id, 'link' => 'https://ex.com/foto.jpg'])
            ->assertCreated()
            ->assertJsonPath('data.user_creator_id', $facilitador->id)
            ->json('data.id');

        // Detalhar.
        $this->withToken($token)->getJson("/api/diary-evidences/{$id}")->assertOk();

        // Editar.
        $this->withToken($token)
            ->putJson("/api/diary-evidences/{$id}", ['link' => 'https://ex.com/nova.jpg'])
            ->assertOk()
            ->assertJsonPath('data.link', 'https://ex.com/nova.jpg');

        // Deletar.
        $this->withToken($token)->deleteJson("/api/diary-evidences/{$id}")->assertNoContent();
    }

    public function test_user_can_create_evidence_and_becomes_creator(): void
    {
        $user = User::factory()->create(); // usuario padrão
        $diary = $this->diary($user);

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/diary-evidences', ['diary_id' => $diary->id, 'link' => 'https://ex.com/foto.jpg'])
            ->assertCreated()
            ->assertJsonPath('data.diary_id', $diary->id)
            ->assertJsonPath('data.user_creator_id', $user->id);
    }

    public function test_create_requires_a_valid_url_and_existing_diary(): void
    {
        $admin = User::factory()->admin()->create();
        $diary = $this->diary($admin);

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/diary-evidences', ['diary_id' => $diary->id, 'link' => 'nao-e-url'])
            ->assertStatus(422);
    }

    public function test_admin_can_update_and_delete_evidence(): void
    {
        $admin = User::factory()->admin()->create();
        $diary = $this->diary($admin);
        $token = $this->tokenFor($admin);

        $id = $this->withToken($token)
            ->postJson('/api/diary-evidences', ['diary_id' => $diary->id, 'link' => 'https://ex.com/a.jpg'])
            ->json('data.id');

        $this->withToken($token)
            ->putJson("/api/diary-evidences/{$id}", ['link' => 'https://ex.com/b.jpg'])
            ->assertOk()
            ->assertJsonPath('data.link', 'https://ex.com/b.jpg');

        $this->withToken($token)->deleteJson("/api/diary-evidences/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('diary_evidences', ['id' => $id]);
    }
}
