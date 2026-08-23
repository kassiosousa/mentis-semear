<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserType;
use App\Models\Company;
use App\Models\Diary;
use App\Models\Notification;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return auth('api')->login($user);
    }

    private function workshop(?User $facilitator = null): Workshop
    {
        $creator = User::factory()->create();
        $company = Company::create(['name' => 'ACME', 'address' => 'R', 'email' => 'a'.uniqid().'@ex.com']);

        return Workshop::create([
            'company_id' => $company->id, 'user_creator_id' => $creator->id,
            'user_facilitator_id' => $facilitator?->id, 'datetime' => now(), 'address' => 'L',
        ]);
    }

    // ---- Criação disparada por eventos ----

    public function test_creating_a_company_notifies_admins(): void
    {
        Company::create(['name' => 'ACME', 'address' => 'R', 'email' => 'a@ex.com']);

        $this->assertDatabaseHas('user_notifications', ['user_type' => 'admin', 'event' => 'company.created', 'status' => 'new']);
    }

    public function test_creating_a_user_notifies_admins(): void
    {
        User::factory()->create(['type' => UserType::Facilitador]);

        $this->assertDatabaseHas('user_notifications', ['user_type' => 'admin', 'event' => 'user.created']);
    }

    public function test_creating_a_workshop_notifies_admins_and_the_assigned_facilitator(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        $this->workshop(facilitator: $fac);

        $this->assertDatabaseHas('user_notifications', ['user_type' => 'admin', 'event' => 'workshop.created']);
        $this->assertDatabaseHas('user_notifications', ['user_id' => $fac->id, 'event' => 'workshop.assigned', 'status' => 'new']);
    }

    public function test_creating_a_diary_notifies_admins(): void
    {
        $workshop = $this->workshop();
        Diary::create(['workshop_id' => $workshop->id, 'user_creator_id' => User::factory()->create()->id, 'title' => 'T', 'description' => 'D', 'datetime' => now()]);

        $this->assertDatabaseHas('user_notifications', ['user_type' => 'admin', 'event' => 'diary.created']);
    }

    // ---- Leitura via API ----

    public function test_guests_cannot_list_notifications(): void
    {
        $this->getJson('/api/notifications')->assertUnauthorized();
    }

    public function test_user_sees_own_and_type_notifications_but_not_others(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        Notification::forUserId($fac->id, 'Direta', 'msg', 'x');
        Notification::forType(UserType::Facilitador, 'Do tipo facilitador', 'msg', 'y');
        Notification::forType(UserType::Admin, 'Só para admin', 'msg', 'z');

        $this->withToken($this->tokenFor($fac))->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_unread_count_and_mark_one_read(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        $n = Notification::forUserId($fac->id, 'Direta', 'msg', 'x');
        Notification::forType(UserType::Facilitador, 'Do tipo', 'msg', 'y');
        $token = $this->tokenFor($fac);

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertOk()->assertJsonPath('data.unread', 2);

        $this->withToken($token)->patchJson("/api/notifications/{$n->id}", ['status' => 'read'])
            ->assertOk()
            ->assertJsonPath('data.status', 'read')
            ->assertJsonPath('data.read_at', fn ($v) => $v !== null);

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertJsonPath('data.unread', 1);
    }

    public function test_read_all_marks_everything_read(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        Notification::forUserId($fac->id, 'a', 'm', 'x');
        Notification::forType(UserType::Facilitador, 'b', 'm', 'y');
        $token = $this->tokenFor($fac);

        $this->withToken($token)->postJson('/api/notifications/read-all')
            ->assertOk()->assertJsonPath('data.updated', 2);

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertJsonPath('data.unread', 0);
    }

    public function test_cannot_touch_another_users_notification(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        $other = User::factory()->create(['type' => UserType::Usuario]);
        $n = Notification::forUserId($other->id, 'x', 'm', 'e');

        $token = $this->tokenFor($fac);
        $this->withToken($token)->getJson("/api/notifications/{$n->id}")->assertForbidden();
        $this->withToken($token)->patchJson("/api/notifications/{$n->id}", ['status' => 'read'])->assertForbidden();
        $this->withToken($token)->deleteJson("/api/notifications/{$n->id}")->assertForbidden();
    }

    public function test_notification_starts_as_new(): void
    {
        $fac = User::factory()->create(['type' => UserType::Facilitador]);
        $n = Notification::forUserId($fac->id, 'x', 'm', 'e');

        $this->assertSame(Notification::STATUS_NEW, $n->status);
    }
}
