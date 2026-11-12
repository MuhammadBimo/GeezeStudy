<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class CalendarEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $range = $request->validate(['from' => ['nullable', 'date'], 'to' => ['nullable', 'date', 'after_or_equal:from']]);

        $events = $request->user()->calendarEvents()
            // Kegiatan berulang tetap dikirim selama sudah mulai sebelum akhir rentang; klien memperluasnya per tanggal.
            ->when($range['to'] ?? null, fn ($q, $to) => $q->where('starts_at', '<=', $to))
            ->when($range['from'] ?? null, fn ($q, $from) => $q->where(
                fn ($w) => $w->where('starts_at', '>=', $from)->orWhere('repeat', '!=', 'none'),
            ))
            ->orderBy('starts_at')
            ->limit(500)
            ->get();

        return response()->json(['data' => $events]);
    }

    public function store(Request $request): JsonResponse
    {
        $event = $request->user()->calendarEvents()->create($this->rules($request, true));

        return response()->json($event->refresh(), 201);
    }

    public function update(Request $request, int $event): CalendarEvent
    {
        $model = $request->user()->calendarEvents()->findOrFail($event);
        $model->update($this->rules($request, false));

        return $model;
    }

    public function destroy(Request $request, int $event): Response
    {
        $request->user()->calendarEvents()->findOrFail($event)->delete();

        return response()->noContent();
    }

    private function rules(Request $request, bool $creating): array
    {
        $presence = $creating ? 'required' : 'sometimes';

        return $request->validate([
            'title' => [$presence, 'string', 'max:160'],
            'type' => ['sometimes', Rule::in(CalendarEvent::TYPES)],
            'starts_at' => [$presence, 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'repeat' => ['sometimes', Rule::in(CalendarEvent::REPEATS)],
            'reminder_minutes' => ['sometimes', 'nullable', Rule::in([10, 60, 1440])],
        ]);
    }
}
