<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Satu berkas lampiran per tugas. Disimpan di disk privat dengan nama acak;
 * hanya pemilik tugas yang bisa mengunduhnya.
 */
class TaskAttachmentController extends Controller
{
    public const DIR = 'task-attachments';

    public const MIMES = 'pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,jpg,jpeg,png,webp,zip,rar';

    public function store(Request $request, int $task): Task
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:'.self::MIMES],
        ]);

        $model = $request->user()->tasks()->findOrFail($task);
        $file = $request->file('file');
        $stored = Str::random(40).'.'.($file->extension() ?: 'bin');

        Storage::disk('local')->putFileAs(self::DIR, $file, $stored);
        self::deleteFile($model->attachment_path);

        $model->forceFill([
            'attachment_name' => Str::limit($this->cleanName($file->getClientOriginalName()), 160, ''),
            'attachment_path' => $stored,
            'attachment_size' => $file->getSize(),
        ])->save();

        return $model->refresh();
    }

    public function show(Request $request, int $task): StreamedResponse
    {
        $model = $request->user()->tasks()->findOrFail($task);
        abort_unless($model->attachment_path && Storage::disk('local')->exists(self::DIR.'/'.$model->attachment_path), 404);

        return Storage::disk('local')->download(self::DIR.'/'.$model->attachment_path, $model->attachment_name ?: $model->attachment_path, [
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function destroy(Request $request, int $task): Task
    {
        $model = $request->user()->tasks()->findOrFail($task);
        self::deleteFile($model->attachment_path);
        $model->forceFill(['attachment_name' => null, 'attachment_path' => null, 'attachment_size' => null])->save();

        return $model->refresh();
    }

    public static function deleteFile(?string $name): void
    {
        if ($name) {
            Storage::disk('local')->delete(self::DIR.'/'.$name);
        }
    }

    private function cleanName(string $name): string
    {
        $clean = trim(preg_replace('/[\x00-\x1F\x7F\/\\:*?"<>|]+/u', '_', $name));

        return $clean !== '' ? $clean : 'lampiran';
    }
}
