<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\SupportTicket;
use App\Models\User;
use Database\Seeders\GamificationSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HelpdeskTest extends TestCase
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

    private function payload(array $extra = []): array
    {
        return array_merge([
            'category' => 'bug',
            'subject' => 'Timer berhenti sendiri',
            'description' => 'Timer berhenti setelah beberapa menit tanpa sebab.',
            'contact_email' => 'siswa@example.com',
        ], $extra);
    }

    private function ticketFor(User $user, array $extra = []): SupportTicket
    {
        $id = $this->actingAs($user)->postJson('/api/helpdesk', $this->payload($extra))->assertCreated()->json('id');

        return SupportTicket::findOrFail($id);
    }

    public function test_student_creates_ticket_and_gets_code_and_notification(): void
    {
        $student = User::factory()->create();

        $res = $this->actingAs($student)->postJson('/api/helpdesk', $this->payload())->assertCreated();

        $res->assertJsonPath('status', 'pending')->assertJsonPath('messages.0.body', 'Timer berhenti setelah beberapa menit tanpa sebab.');
        $this->assertMatchesRegularExpression('/^HD-\d{5}$/', $res->json('code'));
        $this->assertDatabaseHas('support_tickets', ['user_id' => $student->id, 'requester_name' => $student->name]);
        $this->assertDatabaseHas('app_notifications', ['user_id' => $student->id, 'category' => 'support']);
    }

    public function test_student_cannot_forge_identity_or_status(): void
    {
        $student = User::factory()->create();

        $id = $this->actingAs($student)->postJson('/api/helpdesk', $this->payload([
            'user_id' => 999, 'status' => 'resolved', 'requester_name' => 'Orang Lain', 'role' => 'admin',
        ]))->assertCreated()->json('id');

        $ticket = SupportTicket::find($id);
        $this->assertSame($student->id, $ticket->user_id);
        $this->assertSame('pending', $ticket->status);
        $this->assertSame($student->name, $ticket->requester_name);
    }

    public function test_student_only_sees_and_replies_to_own_tickets(): void
    {
        [$a, $b] = [User::factory()->create(), User::factory()->create()];
        $mine = $this->ticketFor($a);
        $theirs = $this->ticketFor($b);

        $this->actingAs($a)->getJson('/api/helpdesk')->assertOk()->assertJsonCount(1, 'tickets')->assertJsonPath('tickets.0.id', $mine->id);
        $this->actingAs($a)->getJson("/api/helpdesk/{$theirs->id}")->assertNotFound();
        $this->actingAs($a)->postJson("/api/helpdesk/{$theirs->id}/replies", ['body' => 'halo'])->assertNotFound();
        $this->actingAs($a)->postJson("/api/helpdesk/{$mine->id}/replies", ['body' => 'Ini screenshot-nya menyusul.'])->assertOk()->assertJsonCount(2, 'messages');
    }

    public function test_validation_rejects_bad_input(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->postJson('/api/helpdesk', ['category' => 'hack'])->assertUnprocessable()
            ->assertJsonValidationErrors(['category', 'subject', 'description', 'contact_email']);
        $this->actingAs($student)->postJson('/api/helpdesk', $this->payload(['category' => 'account_recovery']))
            ->assertUnprocessable()->assertJsonValidationErrors('education_level');
    }

    public function test_admin_lists_filters_replies_and_changes_status(): void
    {
        $admin = $this->admin();
        $student = User::factory()->create();
        $bug = $this->ticketFor($student);
        $this->ticketFor($student, ['category' => 'feature', 'subject' => 'Minta mode fokus']);

        $this->actingAs($admin)->getJson('/api/admin/helpdesk')->assertOk()->assertJsonPath('tickets.total', 2)->assertJsonPath('counts.pending', 2);
        $this->actingAs($admin)->getJson('/api/admin/helpdesk?category=feature')->assertJsonPath('tickets.total', 1);
        $this->actingAs($admin)->getJson('/api/admin/helpdesk?q='.$bug->code)->assertJsonPath('tickets.total', 1);
        $this->actingAs($admin)->getJson('/api/admin/helpdesk/'.$bug->id)->assertOk()->assertJsonPath('user.email', $student->email);

        $this->actingAs($admin)->postJson("/api/admin/helpdesk/{$bug->id}/replies", ['body' => 'Coba perbarui halaman lalu ulangi.'])
            ->assertOk()->assertJsonPath('status', 'in_progress');
        $this->assertDatabaseHas('app_notifications', ['user_id' => $student->id, 'title' => "Admin membalas laporan {$bug->code}"]);

        $this->actingAs($student)->getJson("/api/helpdesk/{$bug->id}")->assertOk()
            ->assertJsonPath('messages.1.is_staff', true)->assertJsonMissingPath('user');

        $this->actingAs($admin)->patchJson("/api/admin/helpdesk/{$bug->id}/status", ['status' => 'waiting_user'])->assertOk()->assertJsonPath('status', 'waiting_user');
        $this->assertDatabaseHas('app_notifications', ['user_id' => $student->id, 'title' => "Status laporan {$bug->code} berubah"]);
        $this->actingAs($admin)->patchJson("/api/admin/helpdesk/{$bug->id}/status", ['status' => 'bogus'])->assertUnprocessable();

        // Jawaban Student atas laporan yang menunggunya membuat laporan kembali ditangani.
        $this->actingAs($student)->postJson("/api/helpdesk/{$bug->id}/replies", ['body' => 'Masih terjadi.'])->assertOk()->assertJsonPath('status', 'in_progress');
    }

    public function test_admin_reply_is_optional_and_empty_messages_are_never_saved(): void
    {
        $admin = $this->admin();
        $ticket = $this->ticketFor(User::factory()->create());
        $reply = "/api/admin/helpdesk/{$ticket->id}/replies";
        $messages = fn () => $ticket->messages()->where('kind', 'reply')->count();

        // Tanpa balasan dan tanpa status baru: tidak ada yang berubah, jadi ditolak.
        $this->actingAs($admin)->postJson($reply, [])->assertUnprocessable()->assertJsonValidationErrors('body');
        $this->actingAs($admin)->postJson($reply, ['body' => '   '])->assertUnprocessable();
        $this->assertSame(1, $messages());

        // Hanya ubah status, balasan kosong: berhasil dan tidak membuat pesan.
        $this->actingAs($admin)->postJson($reply, ['status' => 'waiting_user', 'body' => ''])->assertOk()->assertJsonPath('status', 'waiting_user');
        $this->assertSame(1, $messages());

        // Balasan saja: tersimpan di riwayat.
        $this->actingAs($admin)->postJson($reply, ['body' => 'Mohon kirim screenshot.'])->assertOk()->assertJsonPath('status', 'waiting_user');
        $this->assertSame(2, $messages());
        $this->assertDatabaseMissing('support_messages', ['ticket_id' => $ticket->id, 'body' => '']);
    }

    public function test_resolved_closes_ticket_and_locks_the_conversation(): void
    {
        $admin = $this->admin();
        $student = User::factory()->create();
        $ticket = $this->ticketFor($student);

        // Memilih Resolved (tanpa balasan) langsung menutup laporan di server.
        $this->actingAs($admin)->postJson("/api/admin/helpdesk/{$ticket->id}/replies", ['status' => 'resolved'])
            ->assertOk()->assertJsonPath('status', 'closed');
        $this->assertDatabaseHas('support_tickets', ['id' => $ticket->id, 'status' => 'closed']);
        $this->assertNotNull($ticket->fresh()->resolved_at);
        $this->assertDatabaseHas('app_notifications', ['user_id' => $student->id, 'title' => "Laporan {$ticket->code} sudah ditutup"]);

        // Terkunci untuk semua pihak.
        $this->actingAs($student)->postJson("/api/helpdesk/{$ticket->id}/replies", ['body' => 'Halo?'])->assertUnprocessable();
        $this->actingAs($admin)->postJson("/api/admin/helpdesk/{$ticket->id}/replies", ['body' => 'Tambahan'])->assertUnprocessable();
        $this->actingAs($admin)->patchJson("/api/admin/helpdesk/{$ticket->id}/status", ['status' => 'in_progress'])->assertUnprocessable();
        $this->assertSame('closed', $ticket->fresh()->status);

        // Riwayat tetap utuh dan bisa dibaca kedua pihak.
        $this->actingAs($student)->getJson("/api/helpdesk/{$ticket->id}")->assertOk()->assertJsonPath('status', 'closed')
            ->assertJsonPath('messages.0.body', 'Timer berhenti setelah beberapa menit tanpa sebab.')
            ->assertJsonPath('messages.1.kind', 'event');
        $this->actingAs($admin)->getJson("/api/admin/helpdesk/{$ticket->id}")->assertOk()->assertJsonCount(2, 'messages');
    }

    public function test_reply_with_resolved_saves_message_then_closes(): void
    {
        $admin = $this->admin();
        $ticket = $this->ticketFor(User::factory()->create());

        $this->actingAs($admin)->postJson("/api/admin/helpdesk/{$ticket->id}/replies", ['body' => 'Sudah beres ya.', 'status' => 'resolved'])
            ->assertOk()->assertJsonPath('status', 'closed')->assertJsonPath('messages.1.body', 'Sudah beres ya.');
    }

    public function test_legacy_resolved_tickets_are_migrated_to_closed_without_losing_history(): void
    {
        $ticket = $this->ticketFor(User::factory()->create());
        $ticket->forceFill(['status' => 'resolved'])->save();

        (require base_path('database/migrations/2026_11_22_000001_close_resolved_support_tickets.php'))->up();

        $this->assertSame('closed', $ticket->fresh()->status);
        $this->assertSame(1, $ticket->messages()->count());
    }

    public function test_student_cannot_use_admin_endpoints(): void
    {
        $student = User::factory()->create();
        $ticket = $this->ticketFor($student);

        $this->actingAs($student)->getJson('/api/admin/helpdesk')->assertForbidden();
        $this->actingAs($student)->getJson("/api/admin/helpdesk/{$ticket->id}")->assertForbidden();
        $this->actingAs($student)->postJson("/api/admin/helpdesk/{$ticket->id}/replies", ['body' => 'hai'])->assertForbidden();
        $this->actingAs($student)->patchJson("/api/admin/helpdesk/{$ticket->id}/status", ['status' => 'resolved'])->assertForbidden();
        $this->actingAs($student)->postJson("/api/admin/helpdesk/{$ticket->id}/change-email", ['user_id' => $student->id, 'verified' => true])->assertForbidden();
    }

    public function test_helpdesk_requires_login(): void
    {
        $this->getJson('/api/helpdesk')->assertUnauthorized();
        $this->getJson('/api/admin/helpdesk')->assertUnauthorized();
    }

    public function test_password_reset_flow_works(): void
    {
        Notification::fake();
        $this->withHeader('Referer', config('app.frontend_url'));
        $user = User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/api/forgot-password', ['email' => 'reset@example.com'])->assertOk();
        $this->postJson('/api/forgot-password', ['email' => 'tidakada@example.com'])->assertOk(); // respons sama, tidak membocorkan akun

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($n) use (&$token) {
            $token = $n->token;

            return true;
        });

        $this->postJson('/api/reset-password', ['email' => 'reset@example.com', 'token' => $token, 'password' => 'Baru12345', 'password_confirmation' => 'Baru12345'])->assertOk();
        $this->postJson('/api/login', ['email' => 'reset@example.com', 'password' => 'Baru12345'])->assertOk();
    }

    public function test_guest_can_request_account_help_without_exposing_account_data(): void
    {
        $existing = User::factory()->create(['email' => 'ada@example.com']);

        $res = $this->postJson('/api/helpdesk/guest', [
            'category' => 'account_recovery',
            'requester_name' => 'Dina Putri',
            'subject' => 'Lupa email akun',
            'description' => 'Saya lupa email yang dipakai untuk mendaftar.',
            'contact_email' => 'dina.baru@example.com',
            'education_level' => 'sd',
            'old_email' => 'ada@example.com',
            'nim' => '12345',
        ])->assertCreated();

        $res->assertJsonStructure(['code', 'message'])->assertJsonMissingPath('user');
        $this->assertStringNotContainsString($existing->name, $res->getContent());
        $ticket = SupportTicket::firstOrFail();
        $this->assertNull($ticket->user_id);
        $this->assertSame('sd', $ticket->meta['education_level']);

        // Pengunjung tidak boleh memakai kategori internal dan wajib mengisi nama.
        $this->postJson('/api/helpdesk/guest', ['category' => 'bug', 'subject' => 'Halo juga', 'description' => 'Deskripsi cukup panjang.', 'contact_email' => 'a@b.co'])
            ->assertUnprocessable()->assertJsonValidationErrors(['category', 'requester_name']);
    }

    public function test_admin_changes_account_email_only_with_verification_and_contact_email(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['email' => 'lama@example.com']);
        $owner->createToken('x');
        $other = User::factory()->create(['email' => 'dipakai@example.com']);

        $this->postJson('/api/helpdesk/guest', [
            'category' => 'account_recovery', 'requester_name' => $owner->name, 'subject' => 'Email lama hilang',
            'description' => 'Email lama saya sudah tidak aktif.', 'contact_email' => 'baru@example.com', 'education_level' => 'college',
        ])->assertCreated();
        $ticket = SupportTicket::firstOrFail();
        $url = "/api/admin/helpdesk/{$ticket->id}/change-email";

        // Tanpa konfirmasi verifikasi, ditolak.
        $this->actingAs($admin)->postJson($url, ['user_id' => $owner->id])->assertUnprocessable()->assertJsonValidationErrors('verified');
        // Akun Admin tidak boleh diubah lewat jalur ini.
        $this->actingAs($admin)->postJson($url, ['user_id' => $admin->id, 'verified' => true])->assertUnprocessable();
        $this->assertSame('lama@example.com', $owner->fresh()->email);

        $this->actingAs($admin)->postJson($url, ['user_id' => $owner->id, 'verified' => true])->assertOk()
            ->assertJsonPath('status', 'waiting_user')->assertJsonPath('user.id', $owner->id);

        $fresh = $owner->fresh();
        $this->assertSame('baru@example.com', $fresh->email);
        $this->assertNull($fresh->email_verified_at);
        $this->assertSame(0, $fresh->tokens()->count());
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'level' => 'warning']);
        $this->assertStringNotContainsString('lama@example.com', (string) AuditLog::latest('id')->first()->action.json_encode(AuditLog::latest('id')->first()->context));

        // Email kontak yang sudah dipakai akun lain ditolak.
        $this->postJson('/api/helpdesk/guest', [
            'category' => 'account_recovery', 'requester_name' => 'X', 'subject' => 'Ganti email', 'description' => 'Tolong ganti email akun saya.',
            'contact_email' => 'dipakai@example.com', 'education_level' => 'sma',
        ])->assertCreated();
        $second = SupportTicket::latest('id')->first();
        $this->actingAs($admin)->postJson("/api/admin/helpdesk/{$second->id}/change-email", ['user_id' => $fresh->id, 'verified' => true])->assertUnprocessable();
        $this->assertNotSame($other->id, $fresh->id);
    }

    public function test_attachment_is_private_to_owner_and_admin(): void
    {
        Storage::fake('local');
        [$a, $b, $admin] = [User::factory()->create(), User::factory()->create(), $this->admin()];

        $id = $this->actingAs($a)->post('/api/helpdesk', $this->payload([
            'attachment' => UploadedFile::fake()->image('layar.png'),
        ]), ['Accept' => 'application/json'])->assertCreated()->assertJsonPath('has_attachment', true)->json('id');

        $this->actingAs($a)->get("/api/helpdesk/{$id}/attachment")->assertOk();
        $this->actingAs($admin)->get("/api/admin/helpdesk/{$id}/attachment")->assertOk();
        $this->actingAs($b)->get("/api/helpdesk/{$id}/attachment")->assertNotFound();

        $this->actingAs($a)->post('/api/helpdesk', $this->payload(['attachment' => UploadedFile::fake()->create('malware.exe', 10)]), ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('attachment');
    }

    public function test_badges_count_unread_and_opening_ticket_marks_support_notifications_read(): void
    {
        $admin = $this->admin();
        $student = User::factory()->create();
        $ticket = $this->ticketFor($student);

        // Laporan baru: admin melihat 1 laporan Pending; Student punya 1 notifikasi Helpdesk ("laporan diterima").
        $this->actingAs($admin)->getJson('/api/badges')->assertOk()->assertJsonPath('helpdesk', 1);
        $this->actingAs($student)->getJson('/api/badges')->assertOk()->assertJsonPath('helpdesk', 1)->assertJsonPath('notifications', 1);

        $this->actingAs($admin)->postJson("/api/admin/helpdesk/{$ticket->id}/replies", ['body' => 'Sedang kami cek.'])->assertOk();
        $this->actingAs($admin)->getJson('/api/badges')->assertJsonPath('helpdesk', 0);
        $this->actingAs($student)->getJson('/api/badges')->assertJsonPath('helpdesk', 2);

        // Membuka laporan menandai notifikasinya terbaca, tanpa menyentuh notifikasi kategori lain.
        $student->appNotifications()->create(['category' => 'system', 'title' => 'Lain']);
        $this->actingAs($student)->getJson("/api/helpdesk/{$ticket->id}")->assertOk();
        $this->actingAs($student)->getJson('/api/badges')->assertJsonPath('helpdesk', 0)->assertJsonPath('notifications', 1);
    }
}
