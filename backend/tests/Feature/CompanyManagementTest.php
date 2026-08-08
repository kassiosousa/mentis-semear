<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CompanyManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    public function test_guests_cannot_list_companies(): void
    {
        $this->getJson('/api/companies')->assertUnauthorized();
    }

    public function test_facilitador_cannot_list_companies(): void
    {
        $token = $this->tokenFor(User::factory()->create(['type' => UserType::Facilitador]));
        $this->withToken($token)->getJson('/api/companies')->assertForbidden();
    }

    public function test_usuario_padrao_can_list_companies(): void
    {
        $token = $this->tokenFor(User::factory()->create()); // type = usuario
        $this->withToken($token)->getJson('/api/companies')->assertOk();
    }

    public function test_admin_can_list_companies(): void
    {
        $admin = User::factory()->admin()->create();
        Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);
        Company::create(['name' => 'Globex', 'address' => 'R. 2', 'email' => 'g@ex.com']);

        $this->withToken($this->tokenFor($admin))
            ->getJson('/api/companies')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'per_page', 'total']);
    }

    public function test_admin_can_create_a_company(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/companies', ['name' => 'ACME', 'address' => 'Rua 1', 'email' => 'contato@acme.com'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'ACME');

        $this->assertDatabaseHas('companies', ['email' => 'contato@acme.com']);
    }

    public function test_create_validates_required_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/companies', ['name' => ''])
            ->assertStatus(422);
    }

    public function test_admin_can_update_a_company(): void
    {
        $admin = User::factory()->admin()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);

        $this->withToken($this->tokenFor($admin))
            ->putJson("/api/companies/{$company->id}", ['name' => 'ACME S.A.'])
            ->assertOk()
            ->assertJsonPath('data.name', 'ACME S.A.');
    }

    public function test_admin_can_delete_a_company(): void
    {
        $admin = User::factory()->admin()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/companies/{$company->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('companies', ['id' => $company->id]);
    }

    public function test_cannot_delete_a_company_with_workshops(): void
    {
        $admin = User::factory()->admin()->create();
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);
        Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L', 'checkin_link' => 'c', 'assessment_link' => 'a',
        ]);

        $this->withToken($this->tokenFor($admin))
            ->deleteJson("/api/companies/{$company->id}")
            ->assertStatus(409);
    }
}
