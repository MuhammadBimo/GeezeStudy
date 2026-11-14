<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\Friendship;
use App\Models\Mission;
use App\Models\PointRule;
use App\Models\PointTransaction;
use App\Models\User;
use App\Services\AchievementService;
use App\Services\PointService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Data demo yang realistis per jenjang. Aman dijalankan berulang:
 * akun yang sudah punya data demo dilewati, data buatan pengguna tidak disentuh.
 * Points, level, streak, misi, dan achievements dihitung dari aktivitas yang dibuat di sini.
 */
class DemoDataSeeder extends Seeder
{
    /** Penanda: judul tugas pertama tiap profil. Bila sudah ada, akun dianggap sudah diisi. */
    private function profiles(): array
    {
        return [
            'sd@geezestudy.test' => [
                'streak' => 4, 'minutes' => [15, 30], 'hours' => [15, 19],
                'done' => [
                    ['Latihan soal pecahan halaman 42', 'Matematika'],
                    ['Menulis cerita liburan', 'Bahasa Indonesia'],
                    ['Mewarnai peta Indonesia', 'IPS'],
                    ['Menghafal perkalian 6 sampai 9', 'Matematika'],
                    ['Mengamati pertumbuhan kacang hijau', 'IPA'],
                ],
                'open' => [
                    ['PR Matematika: keliling bangun datar', 'Matematika', 1, 'high', 'todo', 'Kerjakan nomor 1 sampai 10 di buku paket halaman 58.'],
                    ['Kliping hewan langka', 'IPA', 4, 'medium', 'in_progress', 'Kumpulkan 5 gambar hewan langka beserta asal daerahnya.'],
                    ['Membaca buku cerita 20 menit', 'Bahasa Indonesia', 0, 'low', 'todo', null],
                    ['Hafalan kosakata nama hewan', 'Bahasa Inggris', 3, 'low', 'todo', null],
                    ['Prakarya celengan dari botol bekas', 'SBdP', 6, 'medium', 'todo', 'Bawa botol plastik bekas dan kertas warna.'],
                ],
                'events' => [
                    ['Les Matematika', 'class', 'weekly', 0, '15:30', 60],
                    ['Pramuka', 'personal', 'weekly', 4, '14:00', null],
                    ['Ulangan Harian IPA', 'exam', 'none', 3, '08:00', 1440],
                    ['Kerja kelompok kliping', 'meeting', 'none', 2, '15:00', 60],
                ],
                'goals' => [
                    ['Belajar 30 menit setiap hari', 'daily', 'menit', 30, 0],
                    ['Selesaikan 3 PR minggu ini', 'weekly', 'tugas', 3, 0],
                    ['Membaca 2 buku cerita bulan ini', 'long', 'lainnya', 2, 1],
                ],
            ],
            'smp@geezestudy.test' => [
                'streak' => 6, 'minutes' => [25, 50], 'hours' => [15, 21],
                'done' => [
                    ['Rangkuman bab sistem pencernaan', 'IPA Terpadu'],
                    ['Latihan soal persamaan linear', 'Matematika'],
                    ['Essay descriptive text', 'Bahasa Inggris'],
                    ['Algoritma sederhana di Scratch', 'Informatika'],
                    ['Peta konsep kerajaan Hindu-Buddha', 'IPS'],
                    ['Latihan teks eksposisi', 'Bahasa Indonesia'],
                ],
                'open' => [
                    ['PR teorema Pythagoras', 'Matematika', 1, 'high', 'todo', 'Latihan 2 halaman 87, nomor 1 sampai 15.'],
                    ['Laporan praktikum gerak lurus', 'IPA Terpadu', 3, 'high', 'in_progress', 'Sertakan tabel data dan grafik jarak terhadap waktu.'],
                    ['Presentasi "My Hobby"', 'Bahasa Inggris', 5, 'medium', 'todo', null],
                    ['Kuis Informatika di LMS', 'Informatika', 2, 'medium', 'todo', null],
                    ['Membaca novel untuk resensi', 'Bahasa Indonesia', 9, 'low', 'todo', null],
                    ['Peta persebaran sumber daya alam', 'IPS', -1, 'medium', 'todo', 'Kumpulkan di meja guru.'],
                ],
                'events' => [
                    ['Bimbel Matematika', 'class', 'weekly', 1, '16:00', 60],
                    ['Ekskul Robotik', 'personal', 'weekly', 2, '15:00', null],
                    ['Presentasi kelompok IPS', 'presentation', 'none', 4, '09:00', 60],
                    ['PTS Matematika', 'exam', 'none', 6, '07:30', 1440],
                ],
                'goals' => [
                    ['Belajar 45 menit setiap hari', 'daily', 'menit', 45, 0],
                    ['Selesaikan 4 tugas minggu ini', 'weekly', 'tugas', 4, 0],
                    ['Kuasai 5 bab Matematika semester ini', 'long', 'lainnya', 5, 2],
                ],
            ],
            'sma@geezestudy.test' => [
                'streak' => 9, 'minutes' => [30, 75], 'hours' => [15, 22],
                'done' => [
                    ['Latihan soal limit fungsi', 'Matematika'],
                    ['Laporan praktikum titrasi', 'Kimia'],
                    ['Rangkuman pewarisan sifat', 'Biologi'],
                    ['Essay argumentative', 'Bahasa Inggris'],
                    ['Tryout UTBK online #3', 'Persiapan UTBK'],
                    ['Soal gerak parabola', 'Fisika'],
                    ['Analisis sumber sejarah', 'Sejarah'],
                ],
                'open' => [
                    ['Tryout UTBK online #4', 'Persiapan UTBK', 2, 'high', 'todo', 'Penalaran umum dan literasi, 195 menit.'],
                    ['Laporan praktikum fotosintesis', 'Biologi', 3, 'high', 'in_progress', null],
                    ['Latihan 30 soal integral', 'Matematika', 1, 'medium', 'todo', null],
                    ['Presentasi Reformasi 1998', 'Sejarah', 5, 'medium', 'todo', 'Slide maksimal 12 halaman.'],
                    ['Review kosakata TOEFL', 'Bahasa Inggris', 4, 'low', 'todo', null],
                    ['Lengkapi berkas SNBP', 'Administrasi', 7, 'high', 'todo', 'Rapor semester 1 sampai 5 dan sertifikat lomba.'],
                    ['Latihan stoikiometri', 'Kimia', -2, 'medium', 'todo', null],
                ],
                'events' => [
                    ['Bimbel UTBK', 'class', 'weekly', 3, '16:00', 60],
                    ['Rapat OSIS', 'meeting', 'weekly', 1, '15:30', null],
                    ['Tryout UTBK online', 'deadline', 'none', 2, '19:00', 60],
                    ['Ujian praktik Kimia', 'exam', 'none', 5, '09:00', 1440],
                    ['Presentasi Sejarah', 'presentation', 'none', 5, '10:30', 60],
                ],
                'goals' => [
                    ['Belajar 90 menit setiap hari', 'daily', 'menit', 90, 0],
                    ['Selesaikan 5 tugas minggu ini', 'weekly', 'tugas', 5, 0],
                    ['Selesaikan 10 tryout UTBK', 'long', 'lainnya', 10, 3],
                ],
            ],
            'mahasiswa@geezestudy.test' => [
                'streak' => 12, 'minutes' => [40, 90], 'hours' => [9, 22],
                'done' => [
                    ['Laporan praktikum Basis Data modul 6', 'Basis Data'],
                    ['Kuis Statistika di LMS', 'Statistika'],
                    ['Review jurnal evaluasi usability', 'Interaksi Manusia dan Komputer'],
                    ['Rangkuman Jaringan Komputer bab 5', 'Jaringan Komputer'],
                    ['Desain ERD sistem perpustakaan', 'Basis Data'],
                    ['Makalah etika profesi TI', 'Etika Profesi'],
                    ['Latihan SQL join dan subquery', 'Basis Data'],
                ],
                'open' => [
                    ['Proyek kelompok: aplikasi web perpustakaan', 'Pemrograman Web', 6, 'high', 'in_progress', 'Fitur peminjaman dan dashboard admin. Pembagian tugas di grup.'],
                    ['Laporan praktikum Basis Data modul 7', 'Basis Data', 1, 'high', 'todo', 'Normalisasi sampai 3NF dan query agregasi.'],
                    ['Slide presentasi usability testing', 'Interaksi Manusia dan Komputer', 3, 'medium', 'in_progress', null],
                    ['Tugas uji hipotesis', 'Statistika', 4, 'medium', 'todo', null],
                    ['Persiapan UAS Jaringan Komputer', 'Jaringan Komputer', 10, 'medium', 'todo', 'Fokus subnetting dan routing.'],
                    ['Baca paper heuristic evaluation', 'Interaksi Manusia dan Komputer', 5, 'low', 'todo', null],
                    ['Revisi proposal PKM', 'Organisasi', -1, 'high', 'todo', 'Sesuaikan masukan dosen pembimbing.'],
                ],
                'events' => [
                    ['Kuliah Pemrograman Web', 'class', 'weekly', 0, '08:00', 60],
                    ['Kuliah Basis Data', 'class', 'weekly', 2, '10:00', 60],
                    ['Asistensi praktikum', 'class', 'weekly', 3, '13:00', null],
                    ['Rapat proyek kelompok', 'meeting', 'none', 1, '19:30', 60],
                    ['Deadline proposal PKM', 'deadline', 'none', 2, '23:00', 1440],
                    ['Presentasi IMK', 'presentation', 'none', 3, '13:00', 60],
                    ['UAS Jaringan Komputer', 'exam', 'none', 10, '08:00', 1440],
                ],
                'goals' => [
                    ['Belajar 2 jam setiap hari', 'daily', 'menit', 120, 0],
                    ['Selesaikan 5 tugas minggu ini', 'weekly', 'tugas', 5, 0],
                    ['Selesaikan milestone proyek perpustakaan', 'long', 'lainnya', 8, 5],
                ],
            ],
        ];
    }

    public function run(): void
    {
        mt_srand(2026);
        $today = now()->startOfDay();

        foreach ($this->profiles() as $email => $p) {
            $user = User::where('email', $email)->first();
            if (! $user || $user->tasks()->where('title', $p['done'][0][0])->exists()) {
                continue;
            }

            DB::transaction(fn () => $this->seedUser($user, $p, $today));
        }

        $this->seedFriendships();
        $this->seedAdminData();
    }

    private function seedUser(User $user, array $p, Carbon $today): void
    {
        $rules = ['task' => PointRule::value('task_completed', 20), 'per25' => PointRule::value('study_per_25_min', 25), 'cap' => PointRule::value('study_daily_cap', 200)];

        // Hari aktif: rangkaian streak berakhir hari ini, lalu satu hari bolong, lalu riwayat acak 21 hari ke belakang.
        $active = [];
        for ($i = 0; $i < $p['streak']; $i++) {
            $active[] = $i;
        }
        for ($i = $p['streak'] + 1; $i <= 24; $i++) {
            if (mt_rand(1, 100) <= 65) {
                $active[] = $i;
            }
        }

        // Tugas selesai: tersebar di hari aktif (bukan hari ini).
        $pastDays = array_values(array_filter($active, fn ($d) => $d > 0));
        foreach ($p['done'] as $i => [$title, $course]) {
            $daysAgo = $pastDays[min($i * 2 + 1, count($pastDays) - 1)];
            $doneAt = $today->copy()->subDays($daysAgo)->setTime(mt_rand(16, 21), mt_rand(0, 59));
            $task = $user->tasks()->create(['title' => $title, 'course' => $course, 'priority' => ['high', 'medium', 'low'][mt_rand(0, 2)], 'status' => 'completed', 'due_at' => $doneAt->copy()->addDays(mt_rand(0, 2))->setTime(23, 59)]);
            $task->forceFill(['completed_at' => $doneAt, 'created_at' => $doneAt->copy()->subDays(mt_rand(2, 6))])->save();
            $this->ledger($user, $rules['task'], 'task', (string) $task->id, "Tugas selesai: {$title}", $doneAt);
        }

        // Tugas terbuka dengan deadline nyata.
        $openTasks = [];
        foreach ($p['open'] as [$title, $course, $inDays, $priority, $status, $desc]) {
            $task = $user->tasks()->create([
                'title' => $title, 'course' => $course, 'priority' => $priority, 'status' => $status, 'description' => $desc,
                'due_at' => $today->copy()->addDays($inDays)->setTime(23, 59),
            ]);
            $task->forceFill(['created_at' => $today->copy()->subDays(mt_rand(1, 5))])->save();
            $openTasks[] = $task;
        }

        // Sesi belajar per hari aktif, dengan batas Points harian seperti aturan server.
        foreach ($active as $daysAgo) {
            $sessions = $daysAgo === 0 ? 1 : mt_rand(1, 3);
            $earned = 0;
            $clock = $today->copy()->subDays($daysAgo)->setTime($p['hours'][0], mt_rand(0, 30));
            for ($s = 0; $s < $sessions; $s++) {
                $minutes = mt_rand($p['minutes'][0], $p['minutes'][1]);
                $start = $clock->copy()->addMinutes(mt_rand(10, 90));
                if ($daysAgo === 0) {
                    $start = now()->subMinutes($minutes + mt_rand(30, 120)); // sesi hari ini sudah selesai
                }
                $end = $start->copy()->addMinutes($minutes + mt_rand(0, 4));
                $clock = $end;
                $points = max(0, min((int) round($minutes / 25 * $rules['per25']), $rules['cap'] - $earned));
                $earned += $points;

                $session = $user->studySessions()->create([
                    'task_id' => $openTasks ? $openTasks[array_rand($openTasks)]->id : null,
                    'focus_minutes' => $minutes, 'started_at' => $start, 'ended_at' => $end,
                ]);
                $session->forceFill(['points_awarded' => $points, 'created_at' => $end, 'updated_at' => $end])->save();
                $this->ledger($user, $points, 'study_session', (string) $session->id, "Sesi belajar {$minutes} menit", $end);
            }
        }

        // Klaim misi harian di hari-hari lalu yang memang memenuhi target.
        foreach (Mission::where('active', true)->where('type', 'daily')->get() as $mission) {
            foreach ($pastDays as $daysAgo) {
                $day = $today->copy()->subDays($daysAgo);
                $value = $mission->metric === 'tasks_completed'
                    ? $user->tasks()->whereBetween('completed_at', [$day, $day->copy()->endOfDay()])->count()
                    : (int) $user->studySessions()->whereBetween('started_at', [$day, $day->copy()->endOfDay()])->sum('focus_minutes');
                if ($value >= $mission->target && mt_rand(1, 100) <= 75) {
                    $at = $day->copy()->setTime(21, mt_rand(0, 59));
                    DB::table('mission_claims')->insertOrIgnore(['user_id' => $user->id, 'mission_id' => $mission->id, 'period_key' => $day->format('Y-m-d'), 'claimed_at' => $at]);
                    $this->ledger($user, $mission->reward_points, 'mission', "{$mission->id}:{$day->format('Y-m-d')}", "Misi: {$mission->title}", $at);
                }
            }
        }

        // Kalender: jadwal rutin mulai minggu ini dan kegiatan penting mendatang.
        $weekStart = $today->copy()->startOfWeek();
        foreach ($p['events'] as [$title, $type, $repeat, $offset, $time, $reminder]) {
            [$h, $m] = array_map('intval', explode(':', $time));
            $base = $repeat === 'weekly' ? $weekStart->copy()->addDays($offset) : $today->copy()->addDays($offset);
            $user->calendarEvents()->create(['title' => $title, 'type' => $type, 'repeat' => $repeat, 'reminder_minutes' => $reminder, 'starts_at' => $base->setTime($h, $m)]);
        }

        foreach ($p['goals'] as [$title, $period, $unit, $target, $progress]) {
            $user->goals()->create(['title' => $title, 'period' => $period, 'unit' => $unit, 'target' => $target, 'progress' => $progress]);
        }

        $this->finalize($user, $active, $today);

        $user->appNotifications()->create(['category' => 'system', 'title' => 'Selamat datang di GeezeStudy', 'body' => 'Atur target harianmu di Pengaturan, lalu mulai sesi fokus pertama.', 'read_at' => now()->subDays(3), 'created_at' => now()->subDays(20)]);
        $soon = collect($openTasks)->first(fn ($t) => $t->due_at->between(now(), now()->addDays(2)));
        if ($soon) {
            $user->appNotifications()->create(['category' => 'deadline', 'title' => "Deadline segera: {$soon->title}", 'body' => 'Tenggat '.$soon->due_at->translatedFormat('j M, H:i').'.', 'dedupe_key' => "task:{$soon->id}:24h"]);
        }
    }

    /** Hitung ulang Points, level, streak, lalu buka achievements yang memenuhi syarat. */
    private function finalize(User $user, array $active, Carbon $today): void
    {
        $days = collect($active)->sort()->values();
        $current = 0;
        while ($days->contains($current)) {
            $current++;
        }
        $best = $run = 0;
        $prev = null;
        foreach ($days as $d) {
            $run = ($prev !== null && $d === $prev + 1) ? $run + 1 : 1;
            $best = max($best, $run);
            $prev = $d;
        }

        $points = (int) $user->pointTransactions()->sum('points');
        $user->forceFill([
            'points' => $points,
            'level' => app(PointService::class)->levelFor($points),
            'current_streak' => $current,
            'best_streak' => max($best, $current),
            'last_active_on' => $today,
        ])->save();

        $before = now();
        app(AchievementService::class)->evaluate($user);

        // Achievements yang baru terbuka diberi waktu di hari aktif terakhir, bukan "detik ini".
        $stamp = $today->copy()->subDays(1)->setTime(20, 15);
        DB::table('user_achievements')->where('user_id', $user->id)->where('unlocked_at', '>=', $before)->update(['unlocked_at' => $stamp]);
        $user->pointTransactions()->where('source_type', 'achievement')->where('created_at', '>=', $before)->update(['created_at' => $stamp, 'updated_at' => $stamp]);
        AppNotification::where('user_id', $user->id)->where('category', 'achievement')->where('created_at', '>=', $before)->update(['created_at' => $stamp, 'read_at' => $stamp]);
    }

    private function ledger(User $user, int $points, string $type, string $key, string $description, Carbon $at): void
    {
        if ($points <= 0) {
            return;
        }
        PointTransaction::insertOrIgnore([
            'user_id' => $user->id, 'points' => $points, 'source_type' => $type, 'source_key' => $key,
            'description' => $description, 'created_at' => $at, 'updated_at' => $at,
        ]);
    }

    private function seedFriendships(): void
    {
        $u = User::whereIn('email', ['sd@geezestudy.test', 'smp@geezestudy.test', 'sma@geezestudy.test', 'mahasiswa@geezestudy.test'])->get()->keyBy('email');
        if ($u->count() < 4 || Friendship::whereIn('requester_id', $u->pluck('id'))->exists()) {
            return;
        }
        $pairs = [
            ['sma@geezestudy.test', 'mahasiswa@geezestudy.test', 'accepted'],
            ['sd@geezestudy.test', 'smp@geezestudy.test', 'accepted'],
            ['smp@geezestudy.test', 'sma@geezestudy.test', 'pending'],
        ];
        foreach ($pairs as [$a, $b, $status]) {
            Friendship::create(['requester_id' => $u[$a]->id, 'addressee_id' => $u[$b]->id, 'status' => $status]);
            if ($status === 'pending') {
                $u[$b]->appNotifications()->create(['category' => 'social', 'title' => "{$u[$a]->name} ingin berteman denganmu", 'body' => 'Buka halaman Teman untuk menanggapi.']);
            }
        }
    }

    private function seedAdminData(): void
    {
        $admin = User::where('email', 'admin@geezestudy.test')->first();
        if (! $admin || Announcement::where('title', 'Jadwal pemeliharaan server')->exists()) {
            return;
        }
        $a = new Announcement(['title' => 'Jadwal pemeliharaan server', 'body' => 'GeezeStudy tidak bisa diakses Minggu pukul 02.00 sampai 03.00 WIB untuk pemeliharaan rutin.']);
        $a->created_by = $admin->id;
        $a->published_at = now()->subDays(1);
        $a->save();

        foreach ([
            ['Membuat pengumuman "Jadwal pemeliharaan server"', 'info', 1],
            ['Mengubah reward misi "Belajar 25 menit" menjadi 15 Points', 'info', 3],
            ['Menonaktifkan sementara achievement uji coba', 'warning', 6],
        ] as [$action, $level, $daysAgo]) {
            AuditLog::create(['actor_id' => $admin->id, 'action' => $action, 'level' => $level, 'created_at' => now()->subDays($daysAgo)]);
        }
        AuditLog::create(['actor_id' => null, 'action' => 'Sesi belajar ditolak: durasi fokus melebihi waktu sesi', 'level' => 'warning', 'created_at' => now()->subHours(5)]);
    }
}
