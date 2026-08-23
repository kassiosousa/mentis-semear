<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Assessment;
use App\Models\CheckIn;
use App\Models\Company;
use App\Models\MoodEntry;
use App\Models\Sector;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ReportsTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    private function company(string $email): Company
    {
        return Company::create(['name' => 'Co '.$email, 'address' => 'R', 'email' => $email]);
    }

    private function empresaUser(Company $c): User
    {
        return User::factory()->create(['type' => UserType::Empresa, 'company_id' => $c->id]);
    }

    private function workshop(Company $c): Workshop
    {
        $creator = User::factory()->create();

        return Workshop::create([
            'company_id' => $c->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L',
        ]);
    }

    // ---- Acesso ----

    public function test_guests_cannot_access_reports(): void
    {
        $this->getJson('/api/reports/workshops')->assertUnauthorized();
        $this->getJson('/api/reports/mood')->assertUnauthorized();
    }

    public function test_facilitador_cannot_access_reports(): void
    {
        $token = $this->tokenFor(User::factory()->create(['type' => UserType::Facilitador]));
        $this->withToken($token)->getJson('/api/reports/workshops')->assertForbidden();
    }

    public function test_companies_overview_is_blocked_for_empresa(): void
    {
        $a = $this->company('a@ex.com');
        $this->withToken($this->tokenFor($this->empresaUser($a)))
            ->getJson('/api/reports/companies-overview')->assertForbidden();

        $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson('/api/reports/companies-overview')->assertOk();
    }

    // ---- Workshops ----

    public function test_workshops_report_scopes_to_company_for_empresa(): void
    {
        $a = $this->company('a@ex.com');
        $b = $this->company('b@ex.com');
        $wa = $this->workshop($a);
        $this->workshop($b);
        Assessment::create(['workshop_id' => $wa->id, 'score' => 8]);
        Assessment::create(['workshop_id' => $wa->id, 'score' => 10]);

        // admin vê os dois
        $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson('/api/reports/workshops')
            ->assertOk()
            ->assertJsonPath('summary.total_workshops', 2)
            ->assertJsonStructure(['summary', 'items' => ['data', 'current_page', 'total']]);

        // empresa A vê só o dela, com média correta
        $res = $this->withToken($this->tokenFor($this->empresaUser($a)))
            ->getJson('/api/reports/workshops')->assertOk();
        $this->assertSame(1, $res->json('summary.total_workshops'));
        $this->assertEqualsWithDelta(9.0, $res->json('summary.avg_score_geral'), 0.001);
    }

    public function test_workshops_report_filters_by_min_score(): void
    {
        $a = $this->company('a@ex.com');
        $low = $this->workshop($a);
        $high = $this->workshop($a);
        Assessment::create(['workshop_id' => $low->id, 'score' => 4]);
        Assessment::create(['workshop_id' => $high->id, 'score' => 9]);

        $res = $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson('/api/reports/workshops?min_score=7')->assertOk();

        $this->assertSame(1, $res->json('summary.total_workshops'));
        $this->assertSame($high->id, $res->json('items.data.0.id'));
    }

    // ---- Termômetro ----

    public function test_mood_report_returns_summary_and_trend_scoped_to_company(): void
    {
        $a = $this->company('a@ex.com');
        $s = Sector::create(['company_id' => $a->id, 'name' => 'TI']);
        foreach ([5, 5, 3] as $m) {
            MoodEntry::create(['company_id' => $a->id, 'sector_id' => $s->id, 'mood' => $m]);
        }
        // outra empresa não deve contar
        $b = $this->company('b@ex.com');
        $sb = Sector::create(['company_id' => $b->id, 'name' => 'TI']);
        MoodEntry::create(['company_id' => $b->id, 'sector_id' => $sb->id, 'mood' => 1]);

        $res = $this->withToken($this->tokenFor($this->empresaUser($a)))
            ->getJson('/api/reports/mood')->assertOk();

        $this->assertSame(3, $res->json('summary.total'));
        $this->assertEqualsWithDelta(4.33, $res->json('summary.average'), 0.01); // (5+5+3)/3
        $this->assertSame(2, $res->json('summary.distribution.5'));
        $this->assertNotEmpty($res->json('summary.trend'));
    }

    // ---- Quantitativo ----

    public function test_companies_overview_lists_one_row_per_company(): void
    {
        $a = $this->company('a@ex.com');
        $b = $this->company('b@ex.com');
        $wa = $this->workshop($a);
        Assessment::create(['workshop_id' => $wa->id, 'score' => 6]);

        $res = $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson('/api/reports/companies-overview')->assertOk();

        $this->assertSame(2, $res->json('summary.total_companies'));
        $rows = collect($res->json('items.data'))->keyBy('company_id');
        $this->assertSame(1, $rows[$a->id]['workshops']);
        $this->assertEqualsWithDelta(6.0, $rows[$a->id]['avg_score'], 0.001);
        $this->assertSame(0, $rows[$b->id]['workshops']);
    }

    // ---- Participação ----

    public function test_check_ins_report_aggregates_demographics(): void
    {
        $a = $this->company('a@ex.com');
        $w = $this->workshop($a);
        $s = Sector::create(['company_id' => $a->id, 'name' => 'TI']);
        CheckIn::create(['workshop_id' => $w->id, 'name' => 'A', 'position' => 'p', 'sector_id' => $s->id, 'lgpd_read' => true, 'cpf' => '11122233344', 'birthday' => '1990-01-01', 'gender' => 'M', 'celphone' => '1']);
        CheckIn::create(['workshop_id' => $w->id, 'name' => 'B', 'position' => 'p', 'sector_id' => $s->id, 'lgpd_read' => false, 'cpf' => '22233344455', 'birthday' => '2005-01-01', 'gender' => 'F', 'celphone' => '1']);

        $res = $this->withToken($this->tokenFor($this->empresaUser($a)))
            ->getJson('/api/reports/check-ins')->assertOk();

        $this->assertSame(2, $res->json('summary.total'));
        $this->assertEqualsWithDelta(50.0, $res->json('summary.lgpd_consent_rate'), 0.001);
        $this->assertSame(1, $res->json('summary.by_gender.M'));
        // Um item não deve expor CPF.
        $this->assertArrayNotHasKey('cpf', $res->json('items.data.0'));
    }

    // ---- Satisfação ----

    public function test_assessments_report_returns_histogram_and_nps(): void
    {
        $a = $this->company('a@ex.com');
        $w = $this->workshop($a);
        foreach ([10, 9, 8, 3] as $score) {
            Assessment::create(['workshop_id' => $w->id, 'score' => $score]);
        }

        $res = $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson('/api/reports/assessments')->assertOk();

        $this->assertSame(4, $res->json('summary.total'));
        $this->assertSame(2, $res->json('summary.nps.promoters'));  // 9,10
        $this->assertSame(1, $res->json('summary.nps.detractors')); // 3
        $this->assertSame(1, $res->json('summary.histogram.10'));
    }

    // ---- Painel da empresa ----

    public function test_company_panel_ownership(): void
    {
        $a = $this->company('a@ex.com');
        $b = $this->company('b@ex.com');
        $empA = $this->empresaUser($a);

        $this->withToken($this->tokenFor($empA))->getJson("/api/reports/company/{$a->id}")
            ->assertOk()
            ->assertJsonPath('data.company.id', $a->id)
            ->assertJsonStructure(['data' => ['workshops', 'check_ins', 'satisfaction', 'mood']]);

        // empresa A não acessa o painel da empresa B
        $this->withToken($this->tokenFor($empA))->getJson("/api/reports/company/{$b->id}")->assertForbidden();

        // admin acessa qualquer uma
        $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson("/api/reports/company/{$b->id}")->assertOk();
    }
}
