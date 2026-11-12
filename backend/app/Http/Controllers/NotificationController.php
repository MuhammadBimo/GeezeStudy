<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['category' => ['nullable', 'in:deadline,schedule,mission,social,achievement,system']]);

        $query = $request->user()->appNotifications()->latest()
            ->when($request->query('category'), fn ($q, $c) => $q->where('category', $c));

        return response()->json([
            'unread' => $request->user()->appNotifications()->whereNull('read_at')->count(),
            'notifications' => $query->paginate(30),
        ]);
    }

    public function markRead(Request $request, int $notification): JsonResponse
    {
        $row = $request->user()->appNotifications()->findOrFail($notification);
        $row->update(['read_at' => $row->read_at ?? now()]);

        return response()->json($row);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['unread' => 0]);
    }
}
