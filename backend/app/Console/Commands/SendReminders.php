<?php

namespace App\Console\Commands;

use App\Models\AppNotification;
use App\Models\CalendarEvent;
use App\Models\Task;
use Illuminate\Console\Command;
use Illuminate\Database\UniqueConstraintViolationException;

class SendReminders extends Command
{
    protected $signature = 'reminders:send';

    protected $description = 'Buat notifikasi deadline tugas (24 jam) dan pengingat kegiatan kalender';

    public function handle(): int
    {
        $created = 0;

        Task::with('user')->where('status', '!=', 'completed')
            ->whereBetween('due_at', [now(), now()->addDay()])
            ->each(function (Task $task) use (&$created) {
                $created += $this->notify($task->user, 'deadline', "Deadline segera: {$task->title}",
                    'Tenggat '.$task->due_at->timezone(config('app.timezone'))->translatedFormat('j M, H:i').'.', "task:{$task->id}:24h");
            });

        CalendarEvent::with('user')->whereNotNull('reminder_minutes')
            ->whereBetween('starts_at', [now(), now()->addDay()])
            ->each(function (CalendarEvent $event) use (&$created) {
                if ($event->starts_at->gt(now()->addMinutes($event->reminder_minutes))) {
                    return;
                }
                $created += $this->notify($event->user, 'schedule', "Sebentar lagi: {$event->title}",
                    $event->starts_at->timezone(config('app.timezone'))->translatedFormat('j M, H:i'), "event:{$event->id}:{$event->starts_at->timestamp}");
            });

        $this->info("{$created} notifikasi dibuat.");

        return self::SUCCESS;
    }

    /** Hormati preferensi kategori pengguna; dedupe_key mencegah notifikasi ganda. */
    private function notify($user, string $category, string $title, string $body, string $key): int
    {
        if (($user->notification_prefs[$category] ?? true) === false) {
            return 0;
        }

        try {
            AppNotification::create(['user_id' => $user->id, 'category' => $category, 'title' => $title, 'body' => $body, 'dedupe_key' => $key]);
        } catch (UniqueConstraintViolationException) {
            return 0;
        }

        return 1;
    }
}
