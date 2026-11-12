<?php

namespace Tests\Feature;

use App\Models\Mission;
use App\Models\User;
use Database\Seeders\GamificationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GamificationSeeder::class);
    }

    public function test_completing_task_awards_points_once_even_if_toggled(): void
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create(['title' => 'Laporan']);

        $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'completed'])->assertOk();
        $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'todo'])->assertOk();
        $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'completed'])->assertOk();

        $user->refresh();
        // 20 (tugas) + 10 (achievement "Langkah Pertama") = 30, bukan 50.
        $this->assertSame(30, $user->points);
        $this->assertSame(1, $user->current_streak);
    }

    public function test_user_cannot_touch_another_users_task(): void
    {
        $owner = User::factory()->create();
        $task = $owner->tasks()->create(['title' => 'Rahasia']);

        $this->actingAs(User::factory()->create())->patchJson("/api/tasks/{$task->id}", ['title' => 'x'])->assertNotFound();
        $this->actingAs(User::factory()->create())->deleteJson("/api/tasks/{$task->id}")->assertNotFound();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'title' => 'Rahasia']);
    }

    public function test_study_session_awards_points_and_rejects_overlap(): void
    {
        $user = User::factory()->create();
        $start = now()->subMinutes(30);

        $payload = ['focus_minutes' => 25, 'started_at' => $start->toIso8601String(), 'ended_at' => $start->copy()->addMinutes(25)->toIso8601String()];

        $this->actingAs($user)->postJson('/api/study-sessions', $payload)->assertCreated()->assertJsonPath('session.points_awarded', 25);
        $this->assertSame(25, $user->refresh()->points);

        $this->actingAs($user)->postJson('/api/study-sessions', $payload)->assertUnprocessable()->assertJsonValidationErrors('started_at');
        $this->assertSame(25, $user->refresh()->points);
    }

    public function test_study_session_rejects_fake_duration(): void
    {
        $user = User::factory()->create();
        $start = now()->subMinutes(10);

        // Mengaku fokus 120 menit padahal waktunya hanya 10 menit.
        $this->actingAs($user)->postJson('/api/study-sessions', [
            'focus_minutes' => 120, 'started_at' => $start->toIso8601String(), 'ended_at' => now()->toIso8601String(),
        ])->assertUnprocessable()->assertJsonValidationErrors('focus_minutes');

        // Sesi di masa depan juga ditolak.
        $this->actingAs($user)->postJson('/api/study-sessions', [
            'focus_minutes' => 25, 'started_at' => now()->addHour()->toIso8601String(), 'ended_at' => now()->addHour()->addMinutes(25)->toIso8601String(),
        ])->assertUnprocessable();

        $this->assertSame(0, $user->refresh()->points);
    }

    public function test_daily_study_points_are_capped(): void
    {
        $user = User::factory()->create();
        $cursor = now()->startOfDay()->subDay()->addHours(1);
        // 10 sesi x 50 menit @ 50 pts = 500 pts kemungkinan, tetapi batas harian 200.
        for ($i = 0; $i < 5; $i++) {
            $start = now()->startOfDay()->addMinutes(5 + $i * 55);
            if ($start->gt(now()->subMinutes(51))) {
                $this->markTestSkipped('Terlalu dini di hari ini untuk menjalankan simulasi 5 sesi.');
            }
            $this->actingAs($user)->postJson('/api/study-sessions', [
                'focus_minutes' => 50, 'started_at' => $start->toIso8601String(), 'ended_at' => $start->copy()->addMinutes(50)->toIso8601String(),
            ])->assertCreated();
        }
        $this->assertLessThanOrEqual(200 + 10 * 5, $user->refresh()->points); // 200 belajar + bonus achievement
        $this->assertSame(200, (int) $user->studySessions()->sum('points_awarded'));
    }

    public function test_mission_claim_requires_completion_and_cannot_repeat(): void
    {
        $user = User::factory()->create();
        $mission = Mission::where('title', 'Selesaikan 2 tugas')->firstOrFail();

        $this->actingAs($user)->postJson("/api/missions/{$mission->id}/claim")->assertUnprocessable();

        foreach (['A', 'B'] as $title) {
            $task = $user->tasks()->create(['title' => $title]);
            $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'completed'])->assertOk();
        }

        $before = $user->refresh()->points;
        $this->actingAs($user)->postJson("/api/missions/{$mission->id}/claim")->assertOk()->assertJsonPath('reward_points', 20);
        $this->assertSame($before + 20, $user->refresh()->points);

        $this->actingAs($user)->postJson("/api/missions/{$mission->id}/claim")->assertUnprocessable();
        $this->assertSame($before + 20, $user->refresh()->points);
    }

    public function test_level_follows_points(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 5; $i++) {
            $task = $user->tasks()->create(['title' => "T{$i}"]);
            $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'completed']);
        }

        // 5 x 20 + 10 (Langkah Pertama) = 110 -> Level 2 (ambang 100)
        $this->assertSame(110, $user->refresh()->points);
        $this->assertSame(2, $user->level);
        $this->getJson('/api/user')->assertJsonPath('level', 2);
    }
}
