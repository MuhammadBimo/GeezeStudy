<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\GamificationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudyFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GamificationSeeder::class);
    }

    public function test_auto_goal_progress_comes_from_real_tasks_not_client_input(): void
    {
        $user = User::factory()->create();
        $goal = $this->actingAs($user)->postJson('/api/goals', ['title' => 'Selesaikan 2 tugas', 'period' => 'daily', 'unit' => 'tugas', 'target' => 2])
            ->assertCreated()->assertJsonPath('auto', true)->assertJsonPath('progress', 0)->json('id');

        // Klien mencoba mengisi progres sendiri: diabaikan untuk goal otomatis.
        $this->actingAs($user)->patchJson("/api/goals/{$goal}", ['progress' => 2])->assertOk()->assertJsonPath('progress', 0);

        $task = $user->tasks()->create(['title' => 'A']);
        $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'completed'])->assertOk();

        $this->actingAs($user)->getJson('/api/goals')->assertJsonPath('data.0.progress', 1);
    }

    public function test_manual_goal_progress_is_capped_at_target(): void
    {
        $user = User::factory()->create();
        $goal = $this->actingAs($user)->postJson('/api/goals', ['title' => 'Baca 3 jurnal', 'period' => 'weekly', 'unit' => 'lainnya', 'target' => 3])->json('id');

        $this->actingAs($user)->patchJson("/api/goals/{$goal}", ['progress' => 99])->assertOk()->assertJsonPath('progress', 3);
    }

    public function test_calendar_event_crud_is_scoped_to_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $id = $this->actingAs($owner)->postJson('/api/calendar-events', [
            'title' => 'Kuliah', 'type' => 'class', 'starts_at' => now()->addDay()->toIso8601String(), 'repeat' => 'weekly', 'reminder_minutes' => 60,
        ])->assertCreated()->json('id');

        $this->actingAs($other)->deleteJson("/api/calendar-events/{$id}")->assertNotFound();
        $this->actingAs($owner)->postJson('/api/calendar-events', ['title' => 'x', 'starts_at' => now()->toIso8601String(), 'type' => 'bogus'])->assertUnprocessable();
        $this->actingAs($owner)->deleteJson("/api/calendar-events/{$id}")->assertNoContent();
    }

    public function test_reminders_are_created_once_and_respect_preferences(): void
    {
        $user = User::factory()->create();
        $quiet = User::factory()->create(['notification_prefs' => ['deadline' => false]]);

        foreach ([$user, $quiet] as $u) {
            $u->tasks()->create(['title' => 'Laporan', 'due_at' => now()->addHours(5)]);
        }
        $user->calendarEvents()->create(['title' => 'Kuliah', 'starts_at' => now()->addMinutes(30), 'reminder_minutes' => 60]);

        $this->artisan('reminders:send')->assertSuccessful();
        $this->artisan('reminders:send')->assertSuccessful(); // dijalankan ulang: tidak ada notifikasi ganda

        $this->assertSame(2, $user->appNotifications()->count());
        $this->assertSame(0, $quiet->appNotifications()->count());
    }

    public function test_admin_can_trigger_password_reset_for_user(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $student = User::factory()->create();

        $this->actingAs($admin)->postJson("/api/admin/users/{$student->id}/reset-password")->assertOk();
        $this->actingAs($student)->postJson("/api/admin/users/{$admin->id}/reset-password")->assertForbidden();
    }
}
