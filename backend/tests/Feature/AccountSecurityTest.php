<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\GamificationSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GamificationSeeder::class);
        $this->withHeader('Referer', config('app.frontend_url'));
    }

    public function test_user_changes_own_password_with_current_password(): void
    {
        $user = User::factory()->create(['password' => 'Lama12345']);

        $this->actingAs($user)->putJson('/api/user/password', ['current_password' => 'salah', 'password' => 'Baru12345', 'password_confirmation' => 'Baru12345'])
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->actingAs($user)->putJson('/api/user/password', ['current_password' => 'Lama12345', 'password' => 'Lama12345', 'password_confirmation' => 'Lama12345'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->actingAs($user)->putJson('/api/user/password', ['current_password' => 'Lama12345', 'password' => 'Baru12345', 'password_confirmation' => 'Baru12345'])
            ->assertOk()->assertJsonPath('must_change_password', false);

        $this->assertTrue(Hash::check('Baru12345', $user->fresh()->password));
    }

    public function test_temporary_password_from_admin_must_be_replaced_before_using_the_app(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $user = User::factory()->create();

        $this->actingAs($admin)->postJson("/api/admin/users/{$user->id}/reset-password", ['password' => 'Sementara1', 'password_confirmation' => 'Sementara1'])->assertOk();
        $this->assertTrue($user->fresh()->must_change_password);

        // Akhiri sesi admin di tes ini, lalu kembali ke penjaga login web seperti pengunjung biasa.
        $this->app['auth']->forgetGuards();
        $this->app['auth']->shouldUse('web');

        // Masuk dengan password sementara berhasil, tetapi fitur aplikasi ditolak sampai password diganti.
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'Sementara1'])->assertOk()->assertJsonPath('must_change_password', true);
        $this->getJson('/api/dashboard')->assertForbidden()->assertJsonPath('code', 'password_change_required');
        $this->getJson('/api/user')->assertOk();

        $this->putJson('/api/user/password', ['current_password' => 'Sementara1', 'password' => 'Pilihanku9', 'password_confirmation' => 'Pilihanku9'])
            ->assertOk()->assertJsonPath('must_change_password', false);
        $this->getJson('/api/dashboard')->assertOk();
    }

    public function test_changing_email_requires_current_password_and_reverification(): void
    {
        $user = User::factory()->create(['password' => 'Rahasia123', 'email' => 'lama@example.com']);

        $this->actingAs($user)->patchJson('/api/user', ['email' => 'baru@example.com'])->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->actingAs($user)->patchJson('/api/user', ['email' => 'baru@example.com', 'current_password' => 'salah'])->assertUnprocessable();
        $this->assertSame('lama@example.com', $user->fresh()->email);

        // Mengubah hal lain tanpa mengganti email tidak meminta password.
        $this->actingAs($user)->patchJson('/api/user', ['name' => 'Nama Baru', 'email' => 'lama@example.com'])->assertOk();

        $this->actingAs($user)->patchJson('/api/user', ['email' => 'baru@example.com', 'current_password' => 'Rahasia123'])
            ->assertOk()->assertJsonPath('email', 'baru@example.com')->assertJsonPath('email_verified', false);
    }

    public function test_reset_link_also_clears_temporary_password_flag(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset@example.com']);
        $user->forceFill(['must_change_password' => true])->save();

        $this->postJson('/api/forgot-password', ['email' => 'reset@example.com'])->assertOk();
        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($n) use (&$token) {
            $token = $n->token;

            return true;
        });

        $this->postJson('/api/reset-password', ['email' => 'reset@example.com', 'token' => $token, 'password' => 'Baru12345', 'password_confirmation' => 'Baru12345'])->assertOk();
        $this->assertFalse($user->fresh()->must_change_password);
    }
}
