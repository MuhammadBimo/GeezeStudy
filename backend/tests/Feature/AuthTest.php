<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Meniru permintaan dari SPA agar Sanctum memakai sesi (cookie), seperti di browser.
        $this->withHeader('Referer', config('app.frontend_url'));
    }

    public function test_register_creates_student_and_ignores_privileged_fields(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi', 'email' => 'budi@example.com',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
            'role' => 'admin', 'points' => 9999, 'level' => 10,
        ]);

        $response->assertCreated()->assertJsonPath('role', 'student')->assertJsonPath('points', 0);
        $this->assertDatabaseHas('users', ['email' => 'budi@example.com', 'role' => 'student', 'points' => 0]);
    }

    public function test_register_rejects_weak_password_and_duplicate_email(): void
    {
        User::factory()->create(['email' => 'a@example.com']);

        $this->postJson('/api/register', ['name' => 'A', 'email' => 'a@example.com', 'password' => 'abc', 'password_confirmation' => 'abc'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_logout_flow(): void
    {
        $user = User::factory()->create(['password' => 'rahasia123']);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'salah'])->assertUnprocessable();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'rahasia123'])->assertOk()->assertJsonPath('email', $user->email);
        $this->getJson('/api/user')->assertOk();
        $this->postJson('/api/logout')->assertNoContent();
    }

    public function test_guest_gets_401_and_suspended_user_cannot_login(): void
    {
        $this->getJson('/api/tasks')->assertUnauthorized();

        $user = User::factory()->create(['password' => 'rahasia123']);
        $user->forceFill(['status' => 'suspended'])->save();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'rahasia123'])->assertUnprocessable();
    }

    public function test_unverified_user_cannot_use_features(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->getJson('/api/tasks')->assertForbidden();
        $this->actingAs($user)->getJson('/api/user')->assertOk()->assertJsonPath('email_verified', false);
    }

    public function test_student_cannot_reach_admin_routes(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/api/admin/overview')->assertForbidden();
    }

    public function test_profile_update_cannot_change_role_or_points(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patchJson('/api/user', ['daily_goal_minutes' => 90, 'role' => 'admin', 'points' => 500])->assertOk();

        $user->refresh();
        $this->assertSame(90, $user->daily_goal_minutes);
        $this->assertSame('student', $user->role);
        $this->assertSame(0, $user->points);
    }
}
