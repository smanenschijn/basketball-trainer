<?php

use App\Http\Controllers\Admin\RegistrationRequestController as AdminRegistrationRequestController;
use App\Http\Controllers\Auth\SetupPasswordController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ExerciseImageController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationRequestController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\TechnicalFrameworkController;
use App\Http\Controllers\TrainingDayController;
use App\Models\Exercise;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    $user = request()->user();

    return Inertia::render('Dashboard', [
        'exerciseCount' => Exercise::count(),
        'sessionCount' => $user->sessions()->count(),
        'totalTrainingMinutes' => (int) $user->sessions()->sum('duration_minutes'),
    ]);
})->middleware('auth')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/exercises', [ExerciseController::class, 'index'])->name('exercises.index');
    Route::post('/exercises', [ExerciseController::class, 'store'])->name('exercises.store');
    Route::get('/exercises/{exercise}', [ExerciseController::class, 'show'])->name('exercises.show');
    Route::put('/exercises/{exercise}', [ExerciseController::class, 'update'])->name('exercises.update');
    Route::delete('/exercises/{exercise}', [ExerciseController::class, 'destroy'])->name('exercises.destroy');

    Route::post('/uploads/exercise-images', [ExerciseImageController::class, 'store'])->name('exercise-images.store');
    Route::get('/api/materials', [MaterialController::class, 'index'])->name('materials.index');

    Route::get('/technical-framework', [TechnicalFrameworkController::class, 'index'])->name('technical-framework.index');
    Route::post('/technical-framework/upload', [TechnicalFrameworkController::class, 'upload'])->name('technical-framework.upload');
    Route::get('/technical-framework/pdf', [TechnicalFrameworkController::class, 'pdf'])->name('technical-framework.pdf');

    // Calendar
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('/calendar/assign', [CalendarController::class, 'assign'])->name('calendar.assign');
    Route::delete('/calendar/{assignment}', [CalendarController::class, 'unassign'])->name('calendar.unassign');
    Route::put('/calendar/{assignment}/move', [CalendarController::class, 'move'])->name('calendar.move');
    Route::put('/training-days', [TrainingDayController::class, 'update'])->name('training-days.update');

    // Sessions
    Route::get('/sessions', [SessionController::class, 'index'])->name('sessions.index');
    Route::post('/sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');
    Route::put('/sessions/{session}', [SessionController::class, 'update'])->name('sessions.update');
    Route::delete('/sessions/{session}', [SessionController::class, 'destroy'])->name('sessions.destroy');
    Route::post('/sessions/{session}/exercises', [SessionController::class, 'addExercise'])->name('sessions.exercises.add');
    Route::delete('/sessions/{session}/exercises/{pivotId}', [SessionController::class, 'removeExercise'])->name('sessions.exercises.remove');
    Route::put('/sessions/{session}/exercises/reorder', [SessionController::class, 'reorderExercises'])->name('sessions.exercises.reorder');
});

Route::post('/register-request', [RegistrationRequestController::class, 'store'])
    ->name('registration-request.store');

Route::get('/setup-password/{user}', [SetupPasswordController::class, 'create'])
    ->middleware('signed')
    ->name('password.setup');

Route::post('/setup-password/{user}', [SetupPasswordController::class, 'store'])
    ->middleware('signed')
    ->name('password.setup.store');

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/registration-requests', [AdminRegistrationRequestController::class, 'index'])
        ->name('admin.registration-requests.index');
    Route::post('/registration-requests/{registrationRequest}/approve', [AdminRegistrationRequestController::class, 'approve'])
        ->name('admin.registration-requests.approve');
    Route::post('/registration-requests/{registrationRequest}/reject', [AdminRegistrationRequestController::class, 'reject'])
        ->name('admin.registration-requests.reject');
});

require __DIR__.'/auth.php';
