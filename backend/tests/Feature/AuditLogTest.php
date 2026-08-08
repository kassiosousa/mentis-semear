<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Log;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    public function test_an_action_creates_an_audit_log_with_the_acting_user(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))
            ->postJson('/api/companies', ['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com'])
            ->assertCreated();

        $this->assertDatabaseHas('logs', ['user_id' => $admin->id]);

        $log = Log::latest('id')->first();
        $this->assertStringContainsString('POST', $log->description);
        $this->assertStringContainsString('companies', $log->description);
    }

    public function test_read_requests_are_not_logged(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withToken($this->tokenFor($admin))->getJson('/api/companies')->assertOk();

        $this->assertDatabaseCount('logs', 0);
    }

    public function test_public_action_is_logged_without_a_user(): void
    {
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R. 1', 'email' => 'a@ex.com']);
        $workshop = Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id, 'user_facilitator_id' => $creator->id,
            'datetime' => now(), 'address' => 'L', 'checkin_link' => 'c', 'assessment_link' => 'a',
        ]);

        $this->postJson('/api/public/assessments', ['workshop_id' => $workshop->id, 'score' => 8])
            ->assertCreated();

        $this->assertDatabaseHas('logs', ['user_id' => null]);
    }

    public function test_only_admin_can_read_logs(): void
    {
        $this->getJson('/api/logs')->assertUnauthorized();

        $this->withToken($this->tokenFor(User::factory()->create()))
            ->getJson('/api/logs')->assertForbidden();

        $this->withToken($this->tokenFor(User::factory()->admin()->create()))
            ->getJson('/api/logs')->assertOk()->assertJsonStructure(['data', 'current_page', 'total']);
    }
}
