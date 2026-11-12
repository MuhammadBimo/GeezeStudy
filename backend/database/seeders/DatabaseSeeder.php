<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Akun contoh pengembangan: [email, nama, peran, jenjang, institusi, target belajar harian (menit)]. */
    private const DEMO_ACCOUNTS = [
        ['admin@geezestudy.test', 'Admin GeezeStudy', User::ROLE_ADMIN, null, null, 60],
        ['sd@geezestudy.test', 'Dina (SD)', User::ROLE_STUDENT, 'sd', 'SDN 1 Contoh', 30],
        ['smp@geezestudy.test', 'Raka (SMP)', User::ROLE_STUDENT, 'smp', 'SMPN 2 Contoh', 45],
        ['sma@geezestudy.test', 'Salsa (SMA)', User::ROLE_STUDENT, 'sma', 'SMAN 3 Contoh', 90],
        ['mahasiswa@geezestudy.test', 'Bimo (Mahasiswa)', User::ROLE_STUDENT, 'college', 'Universitas Contoh', 120],
    ];

    public function run(): void
    {
        $this->call(GamificationSeeder::class);

        // Akun contoh hanya untuk pengembangan lokal. Jangan dibuat di produksi.
        if (! app()->environment('local')) {
            return;
        }

        foreach (self::DEMO_ACCOUNTS as [$email, $name, $role, $level, $institution, $goal]) {
            $user = User::firstOrNew(['email' => $email]);
            $user->fill([
                'name' => $name,
                'password' => 'password123',
                'education_level' => $level,
                'institution' => $institution,
                'daily_goal_minutes' => $goal,
            ]);
            $user->forceFill(['role' => $role, 'email_verified_at' => now(), 'onboarded_at' => now()])->save();
        }

        // Akun lama dari versi sebelumnya.
        User::where('email', 'siswa@geezestudy.test')->delete();
    }
}
