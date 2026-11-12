<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Announcement::latest()->limit(100)->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $announcement = new Announcement($data);
        $announcement->created_by = $request->user()->id;
        $announcement->published_at = now();
        $announcement->save();

        AuditLog::record($request->user(), "Membuat pengumuman \"{$announcement->title}\"", ['announcement_id' => $announcement->id]);

        return response()->json($announcement->refresh(), 201);
    }

    public function destroy(Request $request, Announcement $announcement): Response
    {
        AuditLog::record($request->user(), "Menghapus pengumuman \"{$announcement->title}\"", ['announcement_id' => $announcement->id], 'warning');
        $announcement->delete();

        return response()->noContent();
    }
}
