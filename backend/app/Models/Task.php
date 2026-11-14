<?php

namespace App\Models;

use App\Http\Controllers\TaskAttachmentController;
use App\Models\Concerns\StoresInAppTimezone;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'course', 'description', 'priority', 'status', 'due_at', 'attachment_name'])]
#[Hidden(['attachment_path'])]
#[Appends(['has_attachment_file'])]
class Task extends Model
{
    use StoresInAppTimezone;

    public const STATUSES = ['todo', 'in_progress', 'completed'];

    public const PRIORITIES = ['high', 'medium', 'low'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        // Berkas lampiran ikut terhapus bersama tugasnya.
        static::deleted(fn (Task $task) => TaskAttachmentController::deleteFile($task->attachment_path));
    }

    protected function hasAttachmentFile(): Attribute
    {
        return Attribute::get(fn () => $this->attachment_path !== null);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }
}
