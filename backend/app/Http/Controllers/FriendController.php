<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class FriendController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $me = $request->user();

        $rows = Friendship::with(['requester', 'addressee'])
            ->where(fn ($q) => $q->where('requester_id', $me->id)->orWhere('addressee_id', $me->id))
            ->get();

        $friends = $rows->where('status', 'accepted')->map(function (Friendship $f) use ($me) {
            $other = $f->requester_id === $me->id ? $f->addressee : $f->requester;

            // Statistik hanya tampil bila teman mengizinkan (privasi).
            return [
                'friendship_id' => $f->id,
                'name' => $other->name,
                'institution' => $other->institution,
                'stats' => $other->privacy_show_progress
                    ? ['level' => $other->level, 'points' => $other->points, 'streak' => $other->current_streak]
                    : null,
            ];
        })->values();

        $incoming = $rows->where('status', 'pending')->where('addressee_id', $me->id)->map(fn (Friendship $f) => [
            'friendship_id' => $f->id, 'name' => $f->requester->name,
        ])->values();

        $outgoing = $rows->where('status', 'pending')->where('requester_id', $me->id)->map(fn (Friendship $f) => [
            'friendship_id' => $f->id, 'name' => $f->addressee->name,
        ])->values();

        return response()->json(compact('friends', 'incoming', 'outgoing'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $me = $request->user();

        $target = User::where('email', $data['email'])->where('status', 'active')->first();

        // Pesan sama untuk email tak dikenal dan diri sendiri: tidak membocorkan siapa yang terdaftar.
        if (! $target || $target->id === $me->id) {
            throw ValidationException::withMessages(['email' => 'Tidak bisa mengirim permintaan ke email ini.']);
        }

        $exists = Friendship::where(fn ($q) => $q->where('requester_id', $me->id)->where('addressee_id', $target->id))
            ->orWhere(fn ($q) => $q->where('requester_id', $target->id)->where('addressee_id', $me->id))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['email' => 'Sudah berteman atau permintaan masih menunggu.']);
        }

        $friendship = Friendship::create(['requester_id' => $me->id, 'addressee_id' => $target->id]);

        $target->appNotifications()->create([
            'category' => 'social',
            'title' => "{$me->name} ingin berteman denganmu",
        ]);

        return response()->json(['friendship_id' => $friendship->id], 201);
    }

    public function accept(Request $request, int $friendship): JsonResponse
    {
        $row = Friendship::where('addressee_id', $request->user()->id)->where('status', 'pending')->findOrFail($friendship);
        $row->update(['status' => 'accepted']);

        return response()->json(['friendship_id' => $row->id]);
    }

    public function destroy(Request $request, int $friendship): Response
    {
        $me = $request->user()->id;

        Friendship::where(fn ($q) => $q->where('requester_id', $me)->orWhere('addressee_id', $me))
            ->findOrFail($friendship)
            ->delete();

        return response()->noContent();
    }
}
