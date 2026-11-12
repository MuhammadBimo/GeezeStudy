<?php

namespace Tests\Feature;

use App\Models\Mission;
use App\Models\User;
use Database\Seeders\GamificationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAndSocialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GamificationSeeder::class);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        return $admin;
    }

    public function test_admin_manages_missions_and_actions_are_logged(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->postJson('/api/admin/missions', [
            'title' => 'Baca 10 menit', 'type' => 'daily', 'metric' => 'study_minutes', 'target' => 10, 'reward_points' => 5,
        ])->assertCreated();

        $this->assertDatabaseHas('missions', ['title' => 'Baca 10 menit']);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id]);
        $this->actingAs($admin)->getJson('/api/admin/logs')->assertOk()->assertJsonPath('data.0.action', 'Membuat misi "Baca 10 menit"');
    }

    public function test_admin_can_suspend_user_but_not_self(): void
    {
        $admin = $this->admin();
        $student = User::factory()->create();

        $this->actingAs($admin)->patchJson("/api/admin/users/{$student->id}", ['status' => 'suspended'])->assertOk();
        $this->actingAs($student->refresh())->getJson('/api/tasks')->assertForbidden();

        $this->actingAs($admin)->patchJson("/api/admin/users/{$admin->id}", ['status' => 'suspended'])->assertUnprocessable();
    }

    public function test_admin_cannot_give_points_directly(): void
    {
        $admin = $this->admin();
        $student = User::factory()->create();

        $this->actingAs($admin)->patchJson("/api/admin/users/{$student->id}", ['status' => 'active', 'points' => 9999])->assertOk();
        $this->assertSame(0, $student->refresh()->points);
    }

    public function test_level_thresholds_must_be_increasing(): void
    {
        $this->actingAs($this->admin())->putJson('/api/admin/point-settings/levels', [
            'levels' => [['level' => 1, 'points_required' => 0], ['level' => 2, 'points_required' => 100], ['level' => 3, 'points_required' => 50]],
        ])->assertUnprocessable();
    }

    public function test_inactive_mission_cannot_be_claimed(): void
    {
        $student = User::factory()->create();
        $mission = Mission::first();
        $mission->update(['active' => false]);

        $this->actingAs($student)->postJson("/api/missions/{$mission->id}/claim")->assertUnprocessable();
    }

    public function test_friend_flow_and_privacy(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create(['privacy_show_progress' => false]);

        $id = $this->actingAs($a)->postJson('/api/friends', ['email' => $b->email])->assertCreated()->json('friendship_id');
        $this->actingAs($a)->postJson('/api/friends', ['email' => $b->email])->assertUnprocessable();
        $this->actingAs($a)->postJson('/api/friends', ['email' => $a->email])->assertUnprocessable();

        // Hanya penerima yang boleh menerima permintaan.
        $this->actingAs($a)->postJson("/api/friends/{$id}/accept")->assertNotFound();
        $this->actingAs($b)->postJson("/api/friends/{$id}/accept")->assertOk();

        // b menyembunyikan progres, jadi a tidak melihat statistiknya.
        $this->actingAs($a)->getJson('/api/friends')->assertJsonPath('friends.0.stats', null);
    }

    public function test_notifications_are_private(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        $note = $a->appNotifications()->create(['category' => 'system', 'title' => 'Halo']);

        $this->actingAs($b)->patchJson("/api/notifications/{$note->id}/read")->assertNotFound();
        $this->actingAs($a)->patchJson("/api/notifications/{$note->id}/read")->assertOk();
        $this->actingAs($a)->getJson('/api/notifications')->assertJsonPath('unread', 0);
    }

    public function test_dashboard_and_progress_endpoints_respond(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/dashboard')->assertOk()->assertJsonStructure(['user', 'open_tasks', 'daily_missions', 'study_minutes_week']);
        $this->actingAs($user)->getJson('/api/progress')->assertOk()->assertJsonStructure(['achievements', 'points_history']);
    }
}
