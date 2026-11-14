<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AvatarAndDemoTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_replace_and_remove_avatar(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $url = $this->actingAs($user)->post('/api/user/avatar', ['avatar' => UploadedFile::fake()->image('a.png', 300, 300)], ['Accept' => 'application/json'])
            ->assertOk()->json('avatar_url');
        $this->assertNotNull($url);
        $first = $user->refresh()->avatar_path;
        Storage::disk('local')->assertExists("avatars/{$first}");

        $this->get("/api/avatars/{$first}")->assertOk();

        $this->actingAs($user)->post('/api/user/avatar', ['avatar' => UploadedFile::fake()->image('b.jpg', 200, 200)], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('local')->assertMissing("avatars/{$first}");

        $this->actingAs($user)->deleteJson('/api/user/avatar')->assertOk()->assertJsonPath('avatar_url', null);
    }

    public function test_avatar_rejects_non_images_and_bad_filenames(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $this->actingAs($user)->post('/api/user/avatar', ['avatar' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable();
        $this->get('/api/avatars/..%2F..%2F.env')->assertNotFound();
    }

    public function test_demo_seed_is_consistent_and_idempotent(): void
    {
        $this->app['env'] = 'local';
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class); // dijalankan ulang: tidak menggandakan data

        foreach (['sd', 'smp', 'sma', 'mahasiswa'] as $level) {
            $user = User::where('email', "{$level}@geezestudy.test")->firstOrFail();
            $this->assertSame((int) $user->pointTransactions()->sum('points'), $user->points, "Points {$level} harus sama dengan riwayat");
            $this->assertGreaterThan(0, $user->current_streak);
            $this->assertGreaterThanOrEqual(10, $user->tasks()->count());
            $this->assertSame(3, $user->goals()->count(), "goals {$level} tidak boleh dobel");
        }
    }
}
