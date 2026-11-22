<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\GuestSupportController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\StudySessionController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok', 'app' => config('app.name')]));

// Tamu
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::post('/helpdesk/guest', [GuestSupportController::class, 'store'])->middleware('throttle:5,10');
Route::get('/avatars/{filename}', [AvatarController::class, 'show'])->name('avatars.show');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

// Sudah masuk (belum tentu terverifikasi)
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/user', [AuthController::class, 'show']);
    Route::patch('/user', [AuthController::class, 'update']);
    Route::put('/user/password', [AuthController::class, 'changePassword'])->middleware('throttle:6,1');
    Route::post('/onboarding', [AuthController::class, 'completeOnboarding']);
    Route::post('/user/avatar', [AvatarController::class, 'store'])->middleware('throttle:10,1');
    Route::delete('/user/avatar', [AvatarController::class, 'destroy']);
    // Helpdesk: Student yang emailnya belum terverifikasi tetap boleh meminta bantuan.
    Route::get('/helpdesk', [SupportTicketController::class, 'index']);
    Route::post('/helpdesk', [SupportTicketController::class, 'store'])->middleware('throttle:10,10');
    Route::get('/helpdesk/{ticket}', [SupportTicketController::class, 'show']);
    Route::post('/helpdesk/{ticket}/replies', [SupportTicketController::class, 'reply'])->middleware('throttle:20,10');
    Route::get('/helpdesk/{ticket}/attachment', [SupportTicketController::class, 'attachment']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])->middleware('throttle:3,1');
});

// Fitur Student (email harus terverifikasi)
Route::middleware(['auth:sanctum', 'active', 'verified', 'password.changed'])->group(function () {
    Route::get('/dashboard', [ProgressController::class, 'dashboard']);
    Route::get('/progress', [ProgressController::class, 'progress']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements/{announcement}/dismiss', [AnnouncementController::class, 'dismiss'])->middleware('throttle:60,1');
    Route::get('/badges', BadgeController::class);

    Route::apiResource('tasks', TaskController::class);
    Route::get('/tasks/{task}/attachment', [TaskAttachmentController::class, 'show']);
    Route::post('/tasks/{task}/attachment', [TaskAttachmentController::class, 'store'])->middleware('throttle:20,1');
    Route::delete('/tasks/{task}/attachment', [TaskAttachmentController::class, 'destroy']);
    Route::apiResource('calendar-events', CalendarEventController::class)->except('show')->parameters(['calendar-events' => 'event']);
    Route::apiResource('goals', GoalController::class)->except('show');
    Route::get('/study-sessions', [StudySessionController::class, 'index']);
    Route::post('/study-sessions', [StudySessionController::class, 'store'])->middleware('throttle:30,1');

    Route::get('/missions', [MissionController::class, 'index']);
    Route::post('/missions/{mission}/claim', [MissionController::class, 'claim'])->middleware('throttle:30,1');

    Route::get('/friends', [FriendController::class, 'index']);
    Route::post('/friends', [FriendController::class, 'store'])->middleware('throttle:20,1');
    Route::post('/friends/{friendship}/accept', [FriendController::class, 'accept']);
    Route::delete('/friends/{friendship}', [FriendController::class, 'destroy']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
});

// Panel Admin
Route::middleware(['auth:sanctum', 'active', 'verified', 'password.changed', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/overview', Admin\OverviewController::class);
    Route::get('/users', [Admin\UserController::class, 'index']);
    Route::patch('/users/{user}', [Admin\UserController::class, 'update']);
    Route::post('/users/{user}/reset-password', [Admin\UserController::class, 'sendReset'])->middleware('throttle:10,1');
    Route::apiResource('missions', Admin\MissionController::class)->except('show');
    Route::apiResource('achievements', Admin\AchievementController::class)->except('show');
    Route::apiResource('announcements', Admin\AnnouncementController::class)->only(['index', 'store', 'destroy']);
    Route::get('/point-settings', [Admin\PointSettingsController::class, 'show']);
    Route::put('/point-settings/rules', [Admin\PointSettingsController::class, 'updateRules']);
    Route::put('/point-settings/levels', [Admin\PointSettingsController::class, 'updateLevels']);
    Route::get('/logs', [Admin\AuditLogController::class, 'index']);

    Route::get('/helpdesk', [Admin\SupportTicketController::class, 'index']);
    Route::get('/helpdesk/{ticket}', [Admin\SupportTicketController::class, 'show']);
    Route::post('/helpdesk/{ticket}/replies', [Admin\SupportTicketController::class, 'reply'])->middleware('throttle:60,1');
    Route::patch('/helpdesk/{ticket}/status', [Admin\SupportTicketController::class, 'updateStatus']);
    Route::post('/helpdesk/{ticket}/change-email', [Admin\SupportTicketController::class, 'changeEmail'])->middleware('throttle:10,1');
    Route::get('/helpdesk/{ticket}/attachment', [Admin\SupportTicketController::class, 'attachment']);
});
