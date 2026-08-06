<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    public function test_guests_cannot_list_users(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $token = $this->tokenFor(User::factory()->create()); // type = usuario
        $this->withToken($token)->getJson('/api/users')->assertForbidden();
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $this->withToken($this->tokenFor($admin))
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    }

    public function test_admin_can_create_a_user_with_a_type(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/users', [
                'name' => 'Ana', 'email' => 'ana@ex.com', 'password' => 'senha1234', 'type' => 'facilitador',
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'facilitador');

        $this->assertDatabaseHas('users', ['email' => 'ana@ex.com', 'type' => 'facilitador']);
    }

    public function test_create_rejects_an_invalid_type(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/users', ['name' => 'X', 'email' => 'x@ex.com', 'password' => 'senha1234', 'type' => 'invalido'])
            ->assertStatus(422);
    }

    public function test_admin_can_update_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($admin))
            ->putJson("/api/users/{$user->id}", ['type' => 'empresa'])
            ->assertOk()
            ->assertJsonPath('data.type', 'empresa');
    }

    public function test_admin_can_delete_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/users/{$user->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_cannot_delete_a_user_that_owns_workshops(): void
    {
        $admin = User::factory()->admin()->create();
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R', 'email' => 'a@ex.com']);
        Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L', 'checkin_link' => 'c', 'assessment_link' => 'a',
        ]);

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/users/{$creator->id}")
            ->assertStatus(409);
    }
}
