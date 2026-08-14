<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Assessment;
use App\Models\CheckIn;
use App\Models\Company;
use App\Models\Diary;
use App\Models\DiaryEvidence;
use App\Models\Log;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DomainRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    private function makeWorkshop(User $creator, Company $company): Workshop
    {
        return Workshop::create([
            'company_id' => $company->id,
            'user_creator_id' => $creator->id,
            'user_facilitator_id' => $creator->id,
            'datetime' => now(),
            'address' => 'Local',
            'checkin_link' => 'http://c',
            'assessment_link' => 'http://a',
        ]);
    }

    public function test_full_workshop_chain_and_relationships(): void
    {
        $creator = User::factory()->create(['type' => UserType::Facilitador]);
        $company = Company::create(['name' => 'ACME', 'address' => 'Rua 1', 'email' => 'acme@ex.com']);
        $workshop = $this->makeWorkshop($creator, $company);

        $checkIn = CheckIn::create([
            'workshop_id' => $workshop->id, 'name' => 'Part', 'position' => 'Dev',
            'lgpd_read' => true, 'lgpd_consent_at' => now(), 'cpf' => '12345678901',
            'birthday' => '1990-01-01', 'gender' => 'M', 'celphone' => '11999999999',
        ]);
        Assessment::create(['workshop_id' => $workshop->id, 'score' => 9, 'suggestions' => 'Bom']);
        $diary = Diary::create([
            'workshop_id' => $workshop->id, 'user_creator_id' => $creator->id,
            'title' => 'Dia 1', 'description' => 'Relato', 'datetime' => now(),
        ]);
        DiaryEvidence::create(['diary_id' => $diary->id, 'user_creator_id' => $creator->id, 'link' => 'http://ev']);
        $log = Log::create(['description' => 'criou workshop', 'user_id' => $creator->id]);

        // Users use UUID as primary key.
        $this->assertSame(36, strlen($creator->id));
        $this->assertInstanceOf(UserType::class, $creator->type);

        // belongsTo
        $this->assertTrue($workshop->company->is($company));
        $this->assertTrue($workshop->creator->is($creator));
        $this->assertTrue($workshop->facilitator->is($creator));
        $this->assertTrue($log->user->is($creator));

        // hasMany / hasOne
        $this->assertCount(1, $company->workshops);
        $this->assertCount(1, $workshop->checkIns);
        $this->assertCount(1, $workshop->assessments);
        $this->assertTrue($workshop->diary->is($diary));
        $this->assertCount(1, $workshop->diary->evidences);
        $this->assertCount(1, $creator->createdWorkshops);
        $this->assertCount(1, $creator->facilitatedWorkshops);
        $this->assertCount(1, $creator->diaries);

        // casts
        $this->assertTrue($checkIn->lgpd_read);
    }

    public function test_a_workshop_can_only_have_one_diary(): void
    {
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'Rua 1', 'email' => 'acme@ex.com']);
        $workshop = $this->makeWorkshop($creator, $company);

        Diary::create(['workshop_id' => $workshop->id, 'user_creator_id' => $creator->id, 'title' => 'A', 'description' => 'x', 'datetime' => now()]);

        $this->expectException(QueryException::class);
        Diary::create(['workshop_id' => $workshop->id, 'user_creator_id' => $creator->id, 'title' => 'B', 'description' => 'y', 'datetime' => now()]);
    }

    public function test_same_cpf_cannot_check_in_twice_in_the_same_workshop(): void
    {
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'Rua 1', 'email' => 'acme@ex.com']);
        $workshop = $this->makeWorkshop($creator, $company);

        $payload = [
            'workshop_id' => $workshop->id, 'name' => 'P', 'position' => 'x',
            'cpf' => '12345678901', 'birthday' => '1990-01-01', 'gender' => 'M', 'celphone' => '119',
        ];
        CheckIn::create($payload);

        $this->expectException(QueryException::class);
        CheckIn::create($payload);
    }
}
