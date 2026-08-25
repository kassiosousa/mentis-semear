<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\CheckIn;
use App\Models\Company;
use App\Models\Sector;
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
            'workshop_id' => $workshop->id, 'name' => 'João', 'position' => 'Analista',
            'lgpd_read' => true, 'cpf' => $cpf, 'birthday' => '1990-05-20', 'gender' => 'M', 'celphone' => '11999999999',
        ];
    }

    public function test_guests_cannot_list_check_ins(): void
    {
        $this->getJson('/api/check-ins')->assertUnauthorized();
    }

    public function test_facilitador_reads_only_check_ins_of_workshops_it_facilitates(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        $company = Company::create(['name' => 'ACME', 'address' => 'R', 'email' => 'ci@ex.com']);

        // Oficina facilitada por ele + check-in.
        $mine = Workshop::create(['company_id' => $company->id, 'user_creator_id' => $fac->id, 'user_facilitator_id' => $fac->id, 'datetime' => now(), 'address' => 'L']);
        $ciMine = CheckIn::create($this->payload($mine, '11122233344'));

        // Oficina de outro (facilitador diferente) + check-in.
        $other = $this->workshop();
        $ciOther = CheckIn::create($this->payload($other, '99988877766'));

        $token = $this->tokenFor($fac);

        // Lista: vê só o da própria oficina.
        $list = $this->withToken($token)->getJson('/api/check-ins')->assertOk()->json('data');
        $this->assertCount(1, $list);
        $this->assertSame($ciMine->id, $list[0]['id']);

        // Detalhe: o dele 200; o de outra oficina 403.
        $this->withToken($token)->getJson("/api/check-ins/{$ciMine->id}")->assertOk();
        $this->withToken($token)->getJson("/api/check-ins/{$ciOther->id}")->assertForbidden();

        // Escrita continua bloqueada para facilitador.
        $this->withToken($token)->postJson('/api/check-ins', $this->payload($mine, '88877766655'))->assertForbidden();
        $this->withToken($token)->deleteJson("/api/check-ins/{$ciMine->id}")->assertForbidden();
    }

    public function test_empresa_reads_only_check_ins_of_its_company(): void
    {
        $mineCompany = Company::create(['name' => 'Mine', 'address' => 'R', 'email' => 'mine@ex.com']);
        $otherCompany = Company::create(['name' => 'Other', 'address' => 'R', 'email' => 'other@ex.com']);
        $creator = User::factory()->create();

        $mineWorkshop = Workshop::create(['company_id' => $mineCompany->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id, 'datetime' => now(), 'address' => 'L']);
        $otherWorkshop = Workshop::create(['company_id' => $otherCompany->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id, 'datetime' => now(), 'address' => 'L']);
        $ciMine = CheckIn::create($this->payload($mineWorkshop, '11122233344'));
        $ciOther = CheckIn::create($this->payload($otherWorkshop, '99988877766'));

        $empresa = User::factory()->create(['type' => UserType::Empresa, 'company_id' => $mineCompany->id]);
        $token = $this->tokenFor($empresa);

        // Lista: só os da própria empresa.
        $list = $this->withToken($token)->getJson('/api/check-ins')->assertOk()->json('data');
        $this->assertCount(1, $list);
        $this->assertSame($ciMine->id, $list[0]['id']);

        // Detalhe: o da própria empresa 200; o de outra 403.
        $this->withToken($token)->getJson("/api/check-ins/{$ciMine->id}")->assertOk();
        $this->withToken($token)->getJson("/api/check-ins/{$ciOther->id}")->assertForbidden();

        // Escrita bloqueada para empresa.
        $this->withToken($token)->postJson('/api/check-ins', $this->payload($mineWorkshop, '88877766655'))->assertForbidden();
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

    public function test_check_in_still_accepts_the_legacy_sector_text(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();

        // Retrocompatibilidade: o front atual pode continuar enviando `sector` (texto).
        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/check-ins', [...$this->payload($workshop), 'sector' => 'TI'])
            ->assertCreated()
            ->assertJsonPath('data.sector', 'TI');
    }

    public function test_check_in_accepts_a_sector_of_the_workshop_company(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();
        $sector = Sector::create(['company_id' => $workshop->company_id, 'name' => 'TI']);

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/check-ins', [...$this->payload($workshop), 'sector_id' => $sector->id])
            ->assertCreated()
            ->assertJsonPath('data.sector_id', $sector->id);
    }

    public function test_check_in_rejects_a_sector_from_another_company(): void
    {
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshop();
        $other = Company::create(['name' => 'Other', 'address' => 'R', 'email' => 'o@ex.com']);
        $foreign = Sector::create(['company_id' => $other->id, 'name' => 'Externo']);

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/check-ins', [...$this->payload($workshop), 'sector_id' => $foreign->id])
            ->assertStatus(422);
    }
}
