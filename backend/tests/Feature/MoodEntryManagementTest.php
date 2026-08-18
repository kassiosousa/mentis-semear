<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\MoodEntry;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class MoodEntryManagementTest extends TestCase
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

    private function empresaUser(Company $c): User
    {
        return User::factory()->create(['type' => UserType::Empresa, 'company_id' => $c->id]);
    }

    // ---- Token / link ----

    public function test_company_gets_a_token_and_thermometer_link(): void
    {
        $c = $this->company();

        $this->assertNotEmpty($c->token);
        $this->assertStringContainsString("/termometro/{$c->token}", $c->thermometer_link);
    }

    // ---- Público ----

    public function test_public_company_lookup_by_token_lists_sectors(): void
    {
        $c = $this->company();
        Sector::create(['company_id' => $c->id, 'name' => 'TI']);
        Sector::create(['company_id' => $c->id, 'name' => 'RH']);

        $this->getJson("/api/public/companies/{$c->token}")
            ->assertOk()
            ->assertJsonPath('data.name', 'ACME')
            ->assertJsonCount(2, 'data.sectors')
            ->assertJsonPath('data.sectors.0.name', 'RH'); // ordenado por nome
    }

    public function test_public_company_lookup_returns_404_for_unknown_token(): void
    {
        $this->getJson('/api/public/companies/naoexiste')->assertNotFound();
    }

    public function test_public_mood_entry_works_and_is_anonymous(): void
    {
        $c = $this->company();
        $s = Sector::create(['company_id' => $c->id, 'name' => 'TI']);

        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 4])
            ->assertCreated()
            ->assertJsonPath('data.mood', 4)
            ->assertJsonPath('data.sector_id', $s->id);
    }

    public function test_public_mood_entry_accepts_a_description(): void
    {
        $c = $this->company();
        $s = Sector::create(['company_id' => $c->id, 'name' => 'TI']);

        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 4, 'description' => 'Semana puxada, mas bom clima'])
            ->assertCreated()
            ->assertJsonPath('data.description', 'Semana puxada, mas bom clima');
    }

    public function test_public_mood_entry_requires_a_sector(): void
    {
        $c = $this->company();

        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'mood' => 3])
            ->assertStatus(422);
    }

    public function test_public_mood_entry_validates_the_scale_1_to_5(): void
    {
        $c = $this->company();
        $s = Sector::create(['company_id' => $c->id, 'name' => 'TI']);

        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 0])->assertStatus(422);
        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 6])->assertStatus(422);
        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 1])->assertCreated();
        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 5])->assertCreated();
    }

    public function test_public_mood_entry_rejects_a_sector_from_another_company(): void
    {
        $c = $this->company('a@ex.com');
        $other = $this->company('b@ex.com');
        $foreign = Sector::create(['company_id' => $other->id, 'name' => 'X']);

        $this->postJson('/api/public/mood-entries', ['company_id' => $c->id, 'sector_id' => $foreign->id, 'mood' => 3])
            ->assertStatus(422);
    }

    // ---- Gestão ----

    public function test_guests_and_wrong_profiles_cannot_list(): void
    {
        $this->getJson('/api/mood-entries')->assertUnauthorized();

        foreach ([UserType::Usuario, UserType::Facilitador] as $type) {
            $token = $this->tokenFor(User::factory()->create(['type' => $type]));
            $this->withToken($token)->getJson('/api/mood-entries')->assertForbidden();
        }
    }

    public function test_empresa_lists_only_its_own_entries(): void
    {
        $mine = $this->company('mine@ex.com');
        $other = $this->company('other@ex.com');
        $ms = Sector::create(['company_id' => $mine->id, 'name' => 'TI']);
        $os = Sector::create(['company_id' => $other->id, 'name' => 'TI']);
        MoodEntry::create(['company_id' => $mine->id, 'sector_id' => $ms->id, 'mood' => 5]);
        MoodEntry::create(['company_id' => $other->id, 'sector_id' => $os->id, 'mood' => 2]);

        $list = $this->withToken($this->tokenFor($this->empresaUser($mine)))
            ->getJson('/api/mood-entries')->assertOk()->json('data');

        $this->assertCount(1, $list);
        $this->assertSame($mine->id, $list[0]['company_id']);
    }

    public function test_empresa_cannot_view_or_delete_another_companys_entry(): void
    {
        $mine = $this->company('mine@ex.com');
        $other = $this->company('other@ex.com');
        $os = Sector::create(['company_id' => $other->id, 'name' => 'TI']);
        $entry = MoodEntry::create(['company_id' => $other->id, 'sector_id' => $os->id, 'mood' => 2]);

        $token = $this->tokenFor($this->empresaUser($mine));
        $this->withToken($token)->getJson("/api/mood-entries/{$entry->id}")->assertForbidden();
        $this->withToken($token)->deleteJson("/api/mood-entries/{$entry->id}")->assertForbidden();
    }

    public function test_admin_can_delete_an_entry(): void
    {
        $c = $this->company();
        $s = Sector::create(['company_id' => $c->id, 'name' => 'TI']);
        $entry = MoodEntry::create(['company_id' => $c->id, 'sector_id' => $s->id, 'mood' => 3]);

        $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->deleteJson("/api/mood-entries/{$entry->id}")->assertNoContent();

        $this->assertDatabaseMissing('mood_entries', ['id' => $entry->id]);
    }

    public function test_summary_returns_total_average_distribution_and_by_sector(): void
    {
        $c = $this->company();
        $ti = Sector::create(['company_id' => $c->id, 'name' => 'TI']);
        $rh = Sector::create(['company_id' => $c->id, 'name' => 'RH']);
        foreach ([5, 5, 3] as $m) {
            MoodEntry::create(['company_id' => $c->id, 'sector_id' => $ti->id, 'mood' => $m]);
        }
        MoodEntry::create(['company_id' => $c->id, 'sector_id' => $rh->id, 'mood' => 1]);

        $data = $this->withToken($this->tokenFor($this->empresaUser($c)))
            ->getJson('/api/mood-entries/summary')->assertOk()->json('data');

        $this->assertSame(4, $data['total']);
        $this->assertEqualsWithDelta(3.5, $data['average'], 0.001); // (5+5+3+1)/4
        $this->assertSame(2, $data['distribution']['5']);
        $this->assertSame(1, $data['distribution']['1']);
        $this->assertSame(0, $data['distribution']['2']);
        $this->assertCount(2, $data['by_sector']);
    }
}
