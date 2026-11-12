<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(GamificationSeeder::class);

        // Akun contoh hanya untuk pengembangan lokal. Jangan dibuat di produksi.
        if (app()->environment('local')) {
            foreach ([
                ['admin@geezestudy.test', 'Admin GeezeStudy', User::ROLE_ADMIN],
                ['siswa@geezestudy.test', 'Siswa Contoh', User::ROLE_STUDENT],
            ] as [$email, $name, $role]) {
                $user = User::firstOrCreate(
                    ['email' => $email],
                    ['name' => $name, 'password' => 'password123', 'email_verified_at' => now()],
                );
                $user->forceFill(['role' => $role, 'email_verified_at' => $user->email_verified_at ?? now(), 'onboarded_at' => now()])->save();
            }
        }
    }
}
