<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Foto profil opsional. File disimpan di disk privat dengan nama acak dan disajikan lewat
 * rute sendiri, jadi tidak perlu `storage:link` (yang sering gagal di Windows).
 */
class AvatarController extends Controller
{
    private const DIR = 'avatars';

    public function store(Request $request): UserResource
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=4000,max_height=4000'],
        ]);

        $user = $request->user();
        $file = $request->file('avatar');
        $name = Str::random(40).'.'.$file->extension();

        Storage::disk('local')->putFileAs(self::DIR, $file, $name);
        $this->deleteFile($user->avatar_path);

        $user->forceFill(['avatar_path' => $name])->save();

        return new UserResource($user);
    }

    public function destroy(Request $request): UserResource
    {
        $user = $request->user();
        $this->deleteFile($user->avatar_path);
        $user->forceFill(['avatar_path' => null])->save();

        return new UserResource($user);
    }

    public function show(string $filename): BinaryFileResponse
    {
        abort_unless(preg_match('/^[A-Za-z0-9]{40}\.(jpe?g|png|webp)$/', $filename) === 1, 404);

        $path = self::DIR.'/'.$filename;
        abort_unless(Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function deleteFile(?string $name): void
    {
        if ($name) {
            Storage::disk('local')->delete(self::DIR.'/'.$name);
        }
    }
}
