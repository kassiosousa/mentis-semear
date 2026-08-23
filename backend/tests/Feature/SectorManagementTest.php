<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class SectorManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    private function company(string $email = 'a@ex.com'): Company
    {
        return Company::create(['name' => 'ACME', 'address' => 'R', 'email' => $email]);
    }

    private function empresaUser(Company $company): User
    {
        return User::factory()->create(['type' => UserType::Empresa, 'company_id' => $company->id]);
    }

    public function test_guests_cannot_list_sectors(): void
    {
        $this->getJson('/api/sectors')->assertUnauthorized();
    }

    public function test_usuario_and_facilitador_cannot_manage_sectors(): void
    {
        foreach ([UserType::Usuario, UserType::Facilitador] as $type) {
            $token = $this->tokenFor(User::factory()->create(['type' => $type]));
            $this->withToken($token)->getJson('/api/sectors')->assertForbidden();
        }
    }

    public function test_admin_can_create_list_update_delete_sectors(): void
    {
        $admin = User::factory()->admin()->create();
        $company = $this->company();
        $token = $this->tokenFor($admin);

        $id = $this->withToken($token)
            ->postJson('/api/sectors', ['company_id' => $company->id, 'name' => 'TI'])
            ->assertCreated()
            ->assertJsonPath('data.company_id', $company->id)
            ->assertJsonPath('data.name', 'TI')
            ->json('data.id');

        $this->withToken($token)->getJson('/api/sectors')->assertOk();
        $this->withToken($token)->getJson("/api/sectors/{$id}")->assertOk();

        $this->withToken($token)
            ->putJson("/api/sectors/{$id}", ['name' => 'Tecnologia'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Tecnologia');

        $this->withToken($token)->deleteJson("/api/sectors/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('sectors', ['id' => $id]);
    }

    public function test_admin_must_provide_a_company(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/sectors', ['name' => 'Sem empresa'])
            ->assertStatus(422);
    }

    public function test_sector_name_is_unique_per_company_but_reusable_across_companies(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $this->tokenFor($admin);
        $a = $this->company('a@ex.com');
        $b = $this->company('b@ex.com');

        $this->withToken($token)->postJson('/api/sectors', ['company_id' => $a->id, 'name' => 'RH'])->assertCreated();
        // Mesmo nome na mesma empresa -> 422.
        $this->withToken($token)->postJson('/api/sectors', ['company_id' => $a->id, 'name' => 'RH'])->assertStatus(422);
        // Mesmo nome em outra empresa -> OK.
        $this->withToken($token)->postJson('/api/sectors', ['company_id' => $b->id, 'name' => 'RH'])->assertCreated();
    }

    public function test_empresa_creates_only_for_its_own_company(): void
    {
        $mine = $this->company('mine@ex.com');

        // company_id enviado é ignorado (mesmo inexistente, não é validado) — usa a própria empresa.
        $this->withToken($this->tokenFor($this->empresaUser($mine)))
            ->postJson('/api/sectors', ['company_id' => 999999, 'name' => 'Meu Setor'])
            ->assertCreated()
            ->assertJsonPath('data.company_id', $mine->id);
    }

    public function test_empresa_lists_only_its_own_sectors(): void
    {
        $mine = $this->company('mine@ex.com');
        $other = $this->company('other@ex.com');
        Sector::create(['company_id' => $mine->id, 'name' => 'Interno']);
        Sector::create(['company_id' => $other->id, 'name' => 'Externo']);

        $list = $this->withToken($this->tokenFor($this->empresaUser($mine)))
            ->getJson('/api/sectors')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $list);
        $this->assertSame($mine->id, $list[0]['company_id']);
    }

    public function test_empresa_cannot_touch_another_companys_sector(): void
    {
        $mine = $this->company('mine@ex.com');
        $other = $this->company('other@ex.com');
        $foreign = Sector::create(['company_id' => $other->id, 'name' => 'Externo']);

        $token = $this->tokenFor($this->empresaUser($mine));

        $this->withToken($token)->getJson("/api/sectors/{$foreign->id}")->assertForbidden();
        $this->withToken($token)->putJson("/api/sectors/{$foreign->id}", ['name' => 'x'])->assertForbidden();
        $this->withToken($token)->deleteJson("/api/sectors/{$foreign->id}")->assertForbidden();
    }

    public function test_deleting_a_company_cascades_its_sectors(): void
    {
        $company = $this->company();
        $sector = Sector::create(['company_id' => $company->id, 'name' => 'TI']);

        $company->delete();

        $this->assertDatabaseMissing('sectors', ['id' => $sector->id]);
    }
}
