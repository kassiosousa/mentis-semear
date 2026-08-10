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

final class DiaryManagementTest extends TestCase
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
    private function payload(Workshop $workshop): array
    {
        return ['workshop_id' => $workshop->id, 'title' => 'Dia 1', 'description' => 'Relato', 'datetime' => '2026-09-01 16:00:00'];
    }

    public function test_guests_cannot_list_diaries(): void
    {
        $this->getJson('/api/diaries')->assertUnauthorized();
    }

    public function test_facilitador_has_full_crud_on_diaries(): void
    {
        $facilitador = User::factory()->create(['type' => UserType::Facilitador]);
        $token = $this->tokenFor($facilitador);
        $workshop = $this->workshop();

        // Listar.
        $this->withToken($token)->getJson('/api/diaries')->assertOk();

        // Criar (o facilitador vira o criador).
        $created = $this->withToken($token)
            ->postJson('/api/diaries', $this->payload($workshop))
            ->assertCreated()
            ->assertJsonPath('data.user_creator_id', $facilitador->id);
        $diaryId = $created->json('data.id');

        // Detalhar.
        $this->withToken($token)->getJson("/api/diaries/{$diaryId}")->assertOk();

        // Editar.
        $this->withToken($token)
            ->putJson("/api/diaries/{$diaryId}", ['title' => 'Editado pelo facilitador'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Editado pelo facilitador');

        // Deletar.
        $this->withToken($token)->deleteJson("/api/diaries/{$diaryId}")->assertNoContent();
    }

    public function test_usuario_can_create_a_diary_and_becomes_the_creator(): void
    {
        $usuario = User::factory()->create();
        $workshop = $this->workshop();

        $this->withToken($this->tokenFor($usuario))
            ->postJson('/api/diaries', $this->payload($workshop))
            ->assertCreated()
            ->assertJsonPath('data.user_creator_id', $usuario->id);
    }

    public function test_a_workshop_can_have_only_one_diary(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();
        Diary::create([...$this->payload($workshop), 'user_creator_id' => $admin->id]);

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/diaries', $this->payload($workshop))
            ->assertStatus(422);
    }

    public function test_create_rejects_a_non_existent_workshop(): void
    {
        $admin = User::factory()->admin()->create();
        $this->workshop();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/diaries', ['workshop_id' => 999999, 'title' => 'x', 'description' => 'y', 'datetime' => now()->toDateTimeString()])
            ->assertStatus(422);
    }

    public function test_admin_can_update_and_delete_a_diary(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();
        $diary = Diary::create([...$this->payload($workshop), 'user_creator_id' => $admin->id]);

        $this->withToken($this->tokenFor($admin))
            ->putJson("/api/diaries/{$diary->id}", ['title' => 'Novo título'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Novo título');

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/diaries/{$diary->id}")
            ->assertNoContent();
    }
}
