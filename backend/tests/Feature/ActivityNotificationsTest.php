<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Announcement;
use App\Models\Mission;
use App\Models\User;
use App\Services\StreakService;
use Database\Seeders\GamificationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GamificationSeeder::class);
    }

    private function completeTasks(User $user, int $count): void
    {
        foreach (range(1, $count) as $i) {
            $task = $user->tasks()->create(['title' => "Tugas {$i}"]);
            $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", ['status' => 'completed'])->assertOk();
        }
    }

    public function test_mission_claim_creates_notification_with_points_once(): void
    {
        $user = User::factory()->create();
        $mission = Mission::where('title', 'Selesaikan 2 tugas')->firstOrFail();
        $this->completeTasks($user, 2);

        $this->actingAs($user)->postJson("/api/missions/{$mission->id}/claim")->assertOk();
        $this->actingAs($user)->postJson("/api/missions/{$mission->id}/claim")->assertUnprocessable();

        $this->actingAs($user)->getJson('/api/notifications?category=mission')->assertOk()
            ->assertJsonCount(1, 'notifications.data')
            ->assertJsonPath('notifications.data.0.title', 'Misi selesai: Selesaikan 2 tugas')
            ->assertJsonPath('notifications.data.0.points', 20);
    }

    public function test_achievement_notification_carries_reward_points(): void
    {
        $user = User::factory()->create();
        $this->completeTasks($user, 1);

        $row = $user->appNotifications()->where('category', 'achievement')->first();
        $this->assertNotNull($row, 'Menyelesaikan tugas pertama membuka achievement.');
        $reward = Achievement::where('title', str_replace('Achievement terbuka: ', '', $row->title))->value('reward_points');
        $this->assertSame($reward > 0 ? $reward : null, $row->points);
    }

    public function test_streak_milestone_notifies_once_and_respects_preferences(): void
    {
        $user = User::factory()->create();
        $streaks = app(StreakService::class);

        foreach (range(2, 0, -1) as $daysAgo) {
            $streaks->touch($user, now()->subDays($daysAgo));
        }
        $streaks->touch($user, now()); // hari yang sama, tidak dihitung ulang

        $this->assertSame(3, $user->current_streak);
        $this->assertSame(1, $user->appNotifications()->where('category', 'streak')->count());
        $this->assertSame('Streak 3 hari', $user->appNotifications()->where('category', 'streak')->value('title'));

        // Kategori dimatikan: tidak ada notifikasi streak baru.
        $other = User::factory()->create(['notification_prefs' => ['streak' => false]]);
        foreach (range(2, 0, -1) as $daysAgo) {
            $streaks->touch($other, now()->subDays($daysAgo));
        }
        $this->assertSame(0, $other->appNotifications()->where('category', 'streak')->count());
    }

    public function test_dismissed_announcements_stay_hidden_but_remain_in_history(): void
    {
        $user = User::factory()->create();
        $old = Announcement::create(['title' => 'Pemeliharaan server', 'body' => 'Minggu 02.00', 'published_at' => now()->subDay()]);
        $new = Announcement::create(['title' => 'Fitur baru', 'body' => 'Helpdesk sudah tersedia', 'published_at' => now()->subHour()]);
        Announcement::create(['title' => 'Draf', 'body' => 'Belum terbit', 'published_at' => null]);

        // Pengumuman baru tidak menimpa yang lama: keduanya tampil.
        $this->actingAs($user)->getJson('/api/dashboard')->assertOk()
            ->assertJsonCount(2, 'announcements')->assertJsonPath('announcements.0.id', $new->id);

        $this->actingAs($user)->postJson("/api/announcements/{$old->id}/dismiss")->assertNoContent();
        $this->actingAs($user)->postJson("/api/announcements/{$old->id}/dismiss")->assertNoContent(); // aman diulang

        $this->actingAs($user)->getJson('/api/dashboard')->assertJsonCount(1, 'announcements')->assertJsonPath('announcements.0.id', $new->id);

        // Riwayat tetap berisi semua yang terbit, dengan tanda sudah ditutup.
        $this->actingAs($user)->getJson('/api/announcements')->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('data.1.id', $old->id)->assertJsonPath('data.1.dismissed', true)
            ->assertJsonPath('data.0.dismissed', false);

        // Penutupan bersifat per pengguna dan tidak menyentuh notifikasi aktivitas.
        $this->actingAs(User::factory()->create())->getJson('/api/dashboard')->assertJsonCount(2, 'announcements');
        $this->assertSame(0, $user->appNotifications()->count());
    }

    public function test_cannot_dismiss_unpublished_announcement(): void
    {
        $draft = Announcement::create(['title' => 'Draf', 'body' => 'x', 'published_at' => null]);
        $this->actingAs(User::factory()->create())->postJson("/api/announcements/{$draft->id}/dismiss")->assertNotFound();
    }
}
